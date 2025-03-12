import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { dbConnect } from '@/lib/mongodb';
import Solution from '@/models/Solution';
import Problem from '@/models/Problem';

export const metadata: Metadata = {
  title: '해결책 목록 - 지역사회 문제 해결 플랫폼',
  description: '지역 사회의 문제에 대한 다양한 해결책을 확인하고 투표해보세요.'
};

interface SolutionsPageProps {
  searchParams?: {
    problemId?: string;
    page?: string;
    limit?: string;
    showCompleted?: string;
  };
}

export default async function SolutionsPage({ searchParams }: SolutionsPageProps) {
  await dbConnect();
  
  // searchParams 객체를 직접 사용하지 않고 함수 내에서 await 사용
  const pageParam = searchParams?.page;
  const limitParam = searchParams?.limit;
  const problemId = searchParams?.problemId;
  const showCompleted = searchParams?.showCompleted === 'true';
  
  // 페이지네이션 설정
  const page = pageParam ? parseInt(pageParam) : 1;
  const limit = limitParam ? parseInt(limitParam) : 10;
  const skip = (page - 1) * limit;
  
  try {
    // 필터 설정
    const filter: Record<string, unknown> = {};
    if (problemId) {
      filter.problem = problemId;
    }
    
    // 문제 필터 - 먼저 해당 문제들의 ID를 가져옴
    let problemIds = [];
    if (!showCompleted) {
      const nonCompletedProblems = await Problem.find(
        { isCompleted: { $ne: true } }, 
        '_id'
      );
      problemIds = nonCompletedProblems.map(p => p._id);
      
      // 완료되지 않은 문제에 대한 해결책만 보여줌
      if (problemIds.length > 0) {
        filter.problem = problemId 
          ? problemId // 특정 문제에 대한 필터링이면 그대로 유지
          : { $in: problemIds }; // 아니면 완료되지 않은 모든 문제에 대한 해결책
      }
    }
    
    // 해결책 목록 조회
    const solutions = await Solution.find(filter)
      .populate('author', 'name email image')
      .populate('problem', 'title isCompleted')
      .sort({ votes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // 전체 해결책 수 조회
    const total = await Solution.countDocuments(filter);
    
    // 문제 정보 조회 (problemId가 있는 경우)
    let problem = null;
    if (problemId) {
      problem = await Problem.findById(problemId);
    }
    
    // 페이지네이션 정보
    const totalPages = Math.ceil(total / limit);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {problem ? `${problem.title}에 대한 해결책` : '모든 해결책'}
          </h1>
          
          {problemId ? (
            <Link href={`/problems/${problemId}`}>
              <Button variant="outline">문제로 돌아가기</Button>
            </Link>
          ) : (
            <div className="flex space-x-2 items-center">
              <span className="text-sm text-gray-600">완료된 문제 표시:</span>
              <Link
                href={showCompleted ? '/solutions' : '/solutions?showCompleted=true'}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  showCompleted 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {showCompleted ? '모든 해결책 보기' : '완료되지 않은 해결책만'}
              </Link>
            </div>
          )}
        </div>
        
        {solutions.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">아직 등록된 해결책이 없습니다</h2>
            <p className="text-gray-600 mb-6">
              {problem 
                ? '이 문제에 대한 첫 번째 해결책을 제안해보세요!' 
                : '아직 등록된 해결책이 없습니다.'}
            </p>
            
            {problemId && (
              <Link href={`/problems/${problemId}/new-solution`}>
                <Button>해결책 제안하기</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution) => (
              <div key={solution._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">
                    {solution.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {solution.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span className="text-sm font-semibold">{solution.votes}</span>
                      </div>
                      
                      <span className={`text-xs px-2 py-1 rounded ${
                        solution.status === 'proposed' ? 'bg-yellow-100 text-yellow-800' :
                        solution.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {solution.status === 'proposed' ? '제안됨' :
                         solution.status === 'approved' ? '승인됨' : '실행됨'}
                      </span>
                      
                      {solution.isSelected && (
                        <span className="text-xs px-2 py-1 rounded bg-green-600 text-white">
                          선택됨
                        </span>
                      )}
                      
                      {solution.problem.isCompleted && (
                        <span className="text-xs px-2 py-1 rounded bg-purple-600 text-white">
                          완료됨
                        </span>
                      )}
                    </div>
                    
                    <Link href={`/problems/${solution.problem._id}/solutions/${solution._id}`}>
                      <Button variant="outline" size="sm">자세히 보기</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Link 
                  key={pageNum}
                  href={`/solutions?${new URLSearchParams({
                    ...(problemId ? { problemId } : {}),
                    ...(showCompleted ? { showCompleted: 'true' } : {}),
                    page: pageNum.toString(),
                    limit: limit.toString()
                  })}`}
                >
                  <Button 
                    variant={pageNum === page ? "primary" : "outline"}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('해결책 목록 조회 오류:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 my-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">오류가 발생했습니다</h2>
          <p className="text-red-500">해결책 목록을 불러오는 중 오류가 발생했습니다.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }
} 