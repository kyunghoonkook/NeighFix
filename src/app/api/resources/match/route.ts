import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Resource from '@/models/Resource';
import { authOptions } from '../../auth/[...nextauth]/route';

// 문제에 적합한 자원 매칭
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId');
    
    if (!problemId) {
      return NextResponse.json(
        { error: '문제 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 문제 조회
    const problem = await Problem.findById(problemId);
    
    if (!problem) {
      return NextResponse.json(
        { error: '문제를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 위치 정보 확인
    if (!problem.location || !problem.location.coordinates) {
      return NextResponse.json(
        { error: '문제에 위치 정보가 없습니다' },
        { status: 400 }
      );
    }
    
    // 문제 카테고리와 위치를 기반으로 적합한 자원 찾기
    // 1. 가장 가까운 자원 (5km 이내)
    // 2. 문제 카테고리와 일치하는 자원
    // 3. 높은 우선순위 문제일수록 더 많은 자원 매칭
    
    const categoryMapping: Record<string, string[]> = {
      '환경': ['환경', '청소', '재활용', '쓰레기', '공원', '녹지'],
      '교통': ['교통', '도로', '주차', '신호등', '보행로', '자전거'],
      '안전': ['안전', '범죄', '방범', '가로등', '화재', '재난'],
      '복지': ['복지', '노인', '아동', '장애인', '저소득', '교육'],
      '시설': ['시설', '건물', '공공시설', '유지보수', '수리', '개선']
    };
    
    // 매칭할 카테고리 확장
    const matchCategories = [problem.category];
    // 매핑된 세부 카테고리가 있다면 추가
    if (categoryMapping[problem.category]) {
      matchCategories.push(...categoryMapping[problem.category]);
    }
    
    // 기본 반경 설정 (우선순위에 따라 조정)
    const radius = problem.priority === 3 ? 10 : problem.priority === 2 ? 5 : 3;
    
    // 적합한 자원 검색
    const matchedResources = await Resource.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: problem.location.coordinates
          },
          $maxDistance: radius * 1000 // km to m
        }
      },
      $or: [
        { category: { $in: matchCategories } },
        { availableSupport: { $in: matchCategories } }
      ]
    })
    .limit(10)
    .populate('owner', 'name image');
    
    // 리소스 매칭 결과에 관련성 점수 추가
    const resourcesWithScore = matchedResources.map(resource => {
      // 위치 기반 점수 (가까울수록 높은 점수, 최대 50점)
      const distanceInMeters = getDistanceFromLatLonInMeters(
        problem.location.coordinates[1],
        problem.location.coordinates[0],
        resource.location.coordinates[1],
        resource.location.coordinates[0]
      );
      const distanceScore = Math.max(0, 50 - Math.floor(distanceInMeters / 100));
      
      // 카테고리 일치 점수 (최대 30점)
      const categoryMatchCount = resource.category.filter((cat: string) => 
        matchCategories.includes(cat)
      ).length;
      const categoryScore = Math.min(30, categoryMatchCount * 10);
      
      // 제공 가능한 지원 일치 점수 (최대 20점)
      const supportMatchCount = resource.availableSupport.filter((support: string) => 
        matchCategories.includes(support)
      ).length;
      const supportScore = Math.min(20, supportMatchCount * 5);
      
      // 총점
      const totalScore = distanceScore + categoryScore + supportScore;
      
      return {
        ...resource.toObject(),
        matchScore: totalScore,
        matchDetails: {
          distanceScore,
          categoryScore,
          supportScore,
          distanceInKm: (distanceInMeters / 1000).toFixed(2)
        }
      };
    });
    
    // 점수 순으로 정렬
    resourcesWithScore.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json({
      matchedResources: resourcesWithScore,
      totalMatches: resourcesWithScore.length,
      searchRadius: radius
    });
  } catch (error) {
    console.error('자원 매칭 에러:', error);
    return NextResponse.json(
      { error: '자원 매칭 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 두 지점 간의 거리 계산 함수 (미터 단위)
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { problemId, resourceIds } = await request.json();
    
    if (!problemId || !resourceIds || !Array.isArray(resourceIds)) {
      return NextResponse.json({ error: '문제 ID와 리소스 ID 배열이 필요합니다.' }, { status: 400 });
    }
    
    // 문제 찾기
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return NextResponse.json({ error: '문제를 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 각 리소스 확인 및 연결
    const connectedResources = [];
    
    for (const resourceId of resourceIds) {
      const resource = await Resource.findById(resourceId);
      if (resource) {
        // 이미 연결되어 있는지 확인
        if (!problem.connectedResources.includes(resourceId)) {
          problem.connectedResources.push(resourceId);
          connectedResources.push(resource);
        }
      }
    }
    
    await problem.save();
    
    return NextResponse.json({ 
      success: true, 
      message: '리소스가 성공적으로 연결되었습니다.',
      connectedResources
    });
  } catch (error) {
    console.error('리소스 연결 오류:', error);
    return NextResponse.json({ error: '리소스 연결 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 