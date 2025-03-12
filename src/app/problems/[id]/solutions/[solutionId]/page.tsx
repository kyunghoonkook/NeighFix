import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Solution from '@/models/Solution';
import Problem from '@/models/Problem';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { DeleteSolutionButton } from '@/components/solutions/DeleteSolutionButton';
import { LikeButton } from '@/components/solutions/LikeButton';
import { CompleteSolutionButton } from '@/components/solutions/CompleteSolutionButton';

interface SolutionDetailPageProps {
  params: {
    id: string;
    solutionId: string;
  };
}

export async function generateMetadata({ params }: SolutionDetailPageProps): Promise<Metadata> {
  await dbConnect();
  
  try {
    const solution = await Solution.findById(params.solutionId)
      .populate('problem', 'title');
    
    if (!solution) {
      return {
        title: '해결책을 찾을 수 없습니다',
        description: '요청하신 해결책을 찾을 수 없습니다.'
      };
    }
    
    return {
      title: `${solution.title} - 해결책 상세`,
      description: solution.description.substring(0, 160)
    };
  } catch {
    return {
      title: '해결책 상세',
      description: '지역 문제에 대한 해결책 정보입니다.'
    };
  }
}

export default async function SolutionDetailPage({ params }: SolutionDetailPageProps) {
  // params 객체를 직접 사용하지 않고 함수 내에서 await 사용
  const session = await getServerSession(authOptions);
  
  try {
    await dbConnect();
    
    // 문제와 해결책 정보 불러오기
    const [problem, solution] = await Promise.all([
      Problem.findById(params.id),
      Solution.findById(params.solutionId).populate('author', 'name email image')
    ]);
    
    if (!problem || !solution) {
      notFound();
    }
    
    // 문제와 해결책 연결 검증
    if (solution.problem.toString() !== params.id) {
      notFound();
    }
    
    // 기본 데이터 준비
    const isAuthor = session?.user?.id === solution.author._id.toString();
    const isAdmin = session?.user?.role === 'admin';
    const canEdit = isAuthor || isAdmin;
    const isProblemAuthor = session?.user?.id === problem.author.toString();
    const isProblemCompleted = problem.isCompleted || false;
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/problems/${params.id}`} className="text-blue-600 hover:underline mb-2 inline-block">
            &larr; 문제로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold mt-2">{solution.title}</h1>
          
          {/* 작성자 및 날짜 정보 */}
          <div className="flex items-center mt-3 text-gray-600">
            <div className="flex items-center">
              {solution.author.image && (
                <img 
                  src={solution.author.image} 
                  alt={solution.author.name || '사용자'} 
                  className="w-6 h-6 rounded-full mr-2"
                />
              )}
              <span>{solution.author.name || '익명 사용자'}</span>
            </div>
            <span className="mx-2">•</span>
            <span>{formatDate(new Date(solution.createdAt))}</span>
            
            {solution.aiGenerated && (
              <>
                <span className="mx-2">•</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">AI 생성</span>
              </>
            )}
          </div>
        </div>
        
        {/* 해결책 상세 정보 */}
        <Card className="p-6 mb-6">
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold mb-4">설명</h2>
            <div className="whitespace-pre-wrap">{solution.description}</div>
            
            {solution.budget > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold">예상 예산</h3>
                <p>{solution.budget.toLocaleString()}원</p>
              </div>
            )}
            
            {solution.timeline && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">예상 일정</h3>
                <p>{solution.timeline}</p>
              </div>
            )}
            
            {solution.resources && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">필요 자원</h3>
                <p>{solution.resources}</p>
              </div>
            )}
          </div>
        </Card>
        
        {/* 투표 및 좋아요 정보 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="font-semibold">{solution.votes}</span>
            </div>
            
            {/* 좋아요 버튼 추가 */}
            <LikeButton 
              solutionId={params.solutionId} 
              initialLikes={solution.likes || 0}
            />
            
            <div>
              <span className="text-sm font-medium">
                상태: 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  solution.status === 'proposed' ? 'bg-yellow-100 text-yellow-800' :
                  solution.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {solution.status === 'proposed' ? '제안됨' :
                   solution.status === 'approved' ? '승인됨' : '실행됨'}
                </span>
              </span>
            </div>
          </div>
          
          {/* 작업 버튼 */}
          <div className="flex justify-between items-center">
            {canEdit && (
              <div className="flex space-x-2">
                <Link href={`/problems/${params.id}/solutions/${params.solutionId}/edit`}>
                  <Button variant="outline">수정하기</Button>
                </Link>
                <DeleteSolutionButton solutionId={params.solutionId} problemId={params.id} />
              </div>
            )}
            
            {/* 문제 작성자만 볼 수 있는 완료 버튼 */}
            {isProblemAuthor && !isProblemCompleted && (
              <CompleteSolutionButton 
                solutionId={params.solutionId} 
                problemId={params.id}
              />
            )}
          </div>
        </div>
        
        {/* 관련 해결책 보기 버튼 */}
        <div className="mt-8 border-t pt-6">
          <Link href={`/solutions?problemId=${params.id}`}>
            <Button variant="outline" className="w-full">
              이 문제의 다른 해결책 보기
            </Button>
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error('해결책 상세 페이지 로드 오류:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 my-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">오류가 발생했습니다</h2>
          <p className="text-red-500">해결책 상세 정보를 불러오는 중 오류가 발생했습니다.</p>
          <Link href={`/problems/${params.id}`}>
            <Button variant="outline" className="mt-4">문제로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }
} 