import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authOptions } from "@/lib/auth";

// 필터 타입 정의
interface ProblemFilter {
  category?: string;
  'location.address'?: { $regex: string, $options: string };
  status?: string;
  'location.coordinates'?: {
    $near: {
      $geometry: {
        type: string,
        coordinates: number[]
      },
      $maxDistance: number
    }
  };
}

// 문제 목록 조회 (위치 기반 검색 기능 추가)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const locationQuery = url.searchParams.get('location');
    const status = url.searchParams.get('status');
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    const radius = url.searchParams.get('radius') || '10'; // 기본 10km
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    
    const skip = (page - 1) * limit;
    
    // 필터 조건 구성
    const filter: ProblemFilter = {};
    if (category) filter.category = category;
    if (locationQuery) filter['location.address'] = { $regex: locationQuery, $options: 'i' };
    if (status) filter.status = status;
    
    // 좌표 기반 검색
    if (lat && lng) {
      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // km -> m 변환
        }
      };
    }
    
    const problems = await Problem.find(filter)
      .populate('author', 'name email image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Problem.countDocuments(filter);
    
    return NextResponse.json({
      problems,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('문제 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '문제 목록을 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 비슷한 문제 개수 확인 함수
async function findSimilarProblemsCount(coordinates: number[], category: string): Promise<number> {
  try {
    // GeoJSON 쿼리 수행
    const count = await Problem.countDocuments({
      'location.type': 'Point',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: 100 // 100m 내
        }
      },
      category: category,
      status: { $ne: 'resolved' } // 해결되지 않은 문제만
    });
    
    return count;
  } catch (error) {
    console.error('비슷한 문제 검색 오류:', error);
    // 오류 발생 시 기본값 0 반환 (우선순위는 low로 설정됨)
    return 0;
  }
}

// 새 문제 생성 (FormData 처리 및 파일 업로드 지원)
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
    
    // FormData 처리
    const formData = await req.formData();
    
    // 폼 데이터에서 일반 필드 추출
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const locationData = formData.get('location') as string;
    const tagsData = formData.get('tags') as string;
    
    // JSON 문자열을 객체로 파싱
    let location;
    let tags = [];
    
    try {
      location = JSON.parse(locationData);
      if (tagsData) {
        tags = JSON.parse(tagsData);
      }
    } catch (err) {
      console.error('JSON 파싱 오류:', err);
      return NextResponse.json(
        { error: '잘못된 데이터 형식입니다' },
        { status: 400 }
      );
    }
    
    // 필수 필드 유효성 검사
    if (!title || !description || !location || !category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }
    
    // 위치 데이터 유효성 검사
    if (!location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return NextResponse.json(
        { error: '올바른 좌표 형식이 아닙니다' },
        { status: 400 }
      );
    }
    
    if (!location.address) {
      return NextResponse.json(
        { error: '주소가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 이미지 처리 (임시로 이미지 URL 배열 생성)
    // 실제 환경에서는 이미지 파일을 클라우드 스토리지에 업로드하고 URL을 저장해야 함
    const images: string[] = [];
    
    // Base64 형식의 이미지 데이터 처리
    // 참고: 대용량 이미지는 이 방식보다 클라우드 스토리지 사용을 권장
    const imageFiles = formData.getAll('images');
    for (const imageFile of imageFiles) {
      if (imageFile instanceof File) {
        try {
          // 예시: Base64로 인코딩된 문자열을 이미지 URL로 사용
          // 실제 프로덕션에서는 이미지를 서버나 클라우드 스토리지에 업로드해야 함
          const buffer = await imageFile.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = imageFile.type;
          const dataUrl = `data:${mimeType};base64,${base64}`;
          images.push(dataUrl);
        } catch (error) {
          console.error('이미지 처리 오류:', error);
        }
      } else if (typeof imageFile === 'string') {
        // 이미 URL 형태로 전송된 이미지
        images.push(imageFile);
      }
    }
    
    // 비슷한 문제 검색 (동일 위치 100m 내)
    // 별도 함수로 분리하여 오류 처리 강화
    const similarProblems = await findSimilarProblemsCount(location.coordinates, category);
    
    // 우선순위 계산 (유사 문제 빈도에 따라)
    // 스키마에 맞게 문자열 대신 숫자로 변경 (1: 낮음, 2: 중간, 3: 높음)
    let priority = 2; // 기본값: 중간(medium)
    if (similarProblems >= 3) {
      priority = 3; // 높음(high)
    } else if (similarProblems === 0) {
      priority = 1; // 낮음(low)
    }
    
    // Problem 스키마에 맞게 location 객체 구성
    const problemLocation = {
      type: 'Point',
      coordinates: location.coordinates,
      address: location.address
    };
    
    const problem = await Problem.create({
      title,
      description,
      location: problemLocation,
      category,
      images: images,
      author: session.user.id,
      tags: tags,
      votes: 0,
      priority,
      frequency: similarProblems + 1,
      participants: [session.user.id], // 작성자를 첫 참여자로 추가
      status: 'pending'
    });
    
    await problem.populate('author', 'name email image');
    
    return NextResponse.json(
      { message: '문제가 성공적으로 등록되었습니다', problem },
      { status: 201 }
    );
  } catch (error) {
    console.error('문제 생성 에러:', error);
    return NextResponse.json(
      { error: '문제를 등록하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 