import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';

export const metadata: Metadata = {
  title: '문제 목록 - 지역사회 문제 해결 플랫폼',
  description: '지역 사회의 다양한 문제들을 확인하고 참여해보세요.'
};

// 문제 데이터 인터페이스 정의
interface ProblemData {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  images?: string[];
  author: {
    name?: string;
    image?: string;
  };
  status: 'pending' | 'processing' | 'resolved';
  priority: number;
  participants: string[] | { _id: string; name?: string; image?: string; }[];
  createdAt: string;
  tags?: string[];
  isCompleted?: boolean;
}

// 페이지 컴포넌트
export default async function ProblemsPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  await dbConnect();
  
  // 검색 파라미터에서 필터 옵션 확인
  const showCompleted = searchParams.showCompleted === 'true';
  
  try {
    // 쿼리 필터 설정
    const filter = showCompleted ? {} : { isCompleted: { $ne: true } };
    
    const problems = await Problem.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'name image')
      .limit(20);
    
    const problemsData: ProblemData[] = JSON.parse(JSON.stringify(problems));
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">지역 문제 목록</h1>
          <Link href="/problems/new">
            <Button>
              새 문제 등록하기
            </Button>
          </Link>
        </div>
        
        {/* 필터 옵션 */}
        <div className="mb-6 flex justify-end">
          <div className="flex space-x-2 items-center">
            <span className="text-sm text-gray-600">완료된 문제 표시:</span>
            <Link
              href={showCompleted ? '/problems' : '/problems?showCompleted=true'}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                showCompleted 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {showCompleted ? '모든 문제 보기' : '완료되지 않은 문제만'}
            </Link>
          </div>
        </div>
        
        {problemsData.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-10 text-center">
            <h2 className="text-xl font-semibold mb-2">등록된 문제가 없습니다</h2>
            <p className="text-gray-600 mb-4">지역 사회의 첫 번째 문제를 등록해보세요.</p>
            <Link href="/problems/new">
              <Button>
                문제 등록하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemsData.map((problem) => (
              <Link 
                key={problem._id} 
                href={`/problems/${problem._id}`}
                className="block transition hover:shadow-lg"
              >
                <div className="border border-gray-200 rounded-lg overflow-hidden h-full">
                  {problem.images && problem.images.length > 0 && (
                    <div 
                      className="h-44 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${problem.images[0]})` }}
                    />
                  )}
                  <div className="p-4">
                    <div className="flex space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        problem.priority === 3 ? 'bg-red-100 text-red-800' : 
                        problem.priority === 2 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {problem.priority === 3 ? '높은 우선순위' : 
                         problem.priority === 2 ? '중간 우선순위' : '낮은 우선순위'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        problem.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        problem.status === 'processing' ? 'bg-purple-100 text-purple-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {problem.status === 'resolved' ? '해결됨' : 
                         problem.status === 'processing' ? '진행 중' : '대기 중'}
                      </span>
                      
                      {problem.isCompleted && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-600 text-white">
                          완료됨
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mb-2 line-clamp-2">{problem.title}</h2>
                    <p className="text-gray-600 mb-3 line-clamp-3">{problem.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        <span>{problem.category}</span>
                        <span className="mx-2">•</span>
                        <span>참여자 {problem.participants.length}명</span>
                      </div>
                      <div>
                        {new Date(problem.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('문제 목록 불러오기 오류:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 my-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">오류가 발생했습니다</h2>
          <p className="text-red-500">문제 목록을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </div>
    );
  }
} 