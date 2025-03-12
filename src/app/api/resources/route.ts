import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { authOptions } from '../auth/[...nextauth]/route';

// 자원 목록 조회 또는 필터링
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '10'; // 기본 반경 10km
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const filter: Record<string, unknown> = {};
    
    // 필터 적용
    if (category) {
      filter.category = category;
    }
    
    if (type) {
      filter.type = type;
    }
    
    // 위치 기반 검색
    if (lat && lng) {
      const radiusInKm = parseInt(radius);
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInKm * 1000 // m 단위로 변환
        }
      };
    }
    
    // 페이지네이션
    const skip = (page - 1) * limit;
    
    // 자원 조회
    const resources = await Resource.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name image')
      .sort({ createdAt: -1 });
    
    // 전체 자원 수 조회
    const total = await Resource.countDocuments(filter);
    
    return NextResponse.json({
      resources,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('자원 조회 에러:', error);
    return NextResponse.json(
      { error: '자원 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 새 자원 등록
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const data = await req.json();
    
    // 필수 필드 검증
    const { name, type, category, description, address, location, availableSupport } = data;
    
    if (!name || !type || !category || !description || !address || !location || !availableSupport) {
      return NextResponse.json(
        { error: '모든 필수 필드를 입력해주세요' },
        { status: 400 }
      );
    }
    
    // 좌표 검증
    if (!location.coordinates || location.coordinates.length !== 2) {
      return NextResponse.json(
        { error: '유효한 위치 좌표가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 새 자원 생성
    const newResource = new Resource({
      ...data,
      owner: session.user.id
    });
    
    await newResource.save();
    
    // 생성된 자원 조회
    const resource = await Resource.findById(newResource._id)
      .populate('owner', 'name image');
    
    return NextResponse.json({
      message: '자원이 성공적으로 등록되었습니다',
      resource
    });
  } catch (error) {
    console.error('자원 등록 에러:', error);
    return NextResponse.json(
      { error: '자원 등록 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 