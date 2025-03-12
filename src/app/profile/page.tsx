import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Solution from '@/models/Solution';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '내 프로필 - 지역사회 문제 해결 플랫폼',
  description: '내 프로필 정보와 활동 내역을 확인하세요.'
};

// 타입 정의
interface ProblemData {
  _id: string;
  title: string;
  description: string;
  category: string;
  participants?: Array<string | { _id: string; name?: string; image?: string; }>;
  createdAt: string;
}

interface SolutionData {
  _id: string;
  title: string;
  description: string;
  problem: string | {
    _id: string;
    title: string;
  };
  votes: number;
  createdAt: string;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  await dbConnect();
  
  // 사용자가 참여 중인 문제 조회
  const participatingProblems = await Problem.find({
    participants: session.user.id
  })
  .sort({ createdAt: -1 })
  .limit(5);
  
  // 사용자가 작성한 문제 조회
  const authoredProblems = await Problem.find({
    author: session.user.id
  })
  .sort({ createdAt: -1 })
  .limit(5);
  
  // 사용자가 제안한 해결책 조회
  const authoredSolutions = await Solution.find({
    author: session.user.id
  })
  .populate('problem', 'title')
  .sort({ createdAt: -1 })
  .limit(5);
  
  const userData = {
    participatingProblems: JSON.parse(JSON.stringify(participatingProblems)),
    authoredProblems: JSON.parse(JSON.stringify(authoredProblems)),
    authoredSolutions: JSON.parse(JSON.stringify(authoredSolutions))
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">내 프로필</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* 사용자 정보 */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || '사용자'} 
                  className="w-20 h-20 rounded-full mr-4"
                />
              ) : (
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-indigo-600 text-xl font-bold">
                    {(session.user.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">{session.user.name || '사용자'}</h2>
                <p className="text-gray-600">{session.user.email}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">활동 통계</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <span className="block text-2xl font-bold text-indigo-600">{userData.authoredProblems.length}</span>
                  <span className="text-sm text-gray-600">등록한 문제</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <span className="block text-2xl font-bold text-indigo-600">{userData.authoredSolutions.length}</span>
                  <span className="text-sm text-gray-600">제안한 해결책</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <span className="block text-2xl font-bold text-indigo-600">{userData.participatingProblems.length}</span>
                  <span className="text-sm text-gray-600">참여 중인 문제</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <span className="block text-2xl font-bold text-indigo-600">0</span>
                  <span className="text-sm text-gray-600">완료된 문제</span>
                </div>
              </div>
            </div>
            
            <Link href="/problems/new">
              <Button className="w-full mb-3">
                새 문제 등록하기
              </Button>
            </Link>
          </div>
        </div>
        
        {/* 활동 내역 */}
        <div className="md:w-2/3">
          {/* 참여 중인 문제 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">참여 중인 문제</h3>
              <Link href="/problems" className="text-indigo-600 hover:text-indigo-800 text-sm">
                전체 보기
              </Link>
            </div>
            
            {userData.participatingProblems.length > 0 ? (
              <div className="space-y-4">
                {userData.participatingProblems.map((problem: ProblemData) => (
                  <Link key={problem._id} href={`/problems/${problem._id}`} className="block">
                    <div className="border border-gray-200 rounded-md p-4 hover:shadow-md transition">
                      <h4 className="font-semibold mb-1">{problem.title}</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{problem.description}</p>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>{problem.category}</span>
                        <span>{new Date(problem.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>아직 참여 중인 문제가 없습니다.</p>
                <Link href="/problems" className="text-indigo-600 hover:text-indigo-800 text-sm block mt-2">
                  문제 둘러보기
                </Link>
              </div>
            )}
          </div>
          
          {/* 작성한 문제 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">내가 등록한 문제</h3>
              <Link href="/problems" className="text-indigo-600 hover:text-indigo-800 text-sm">
                전체 보기
              </Link>
            </div>
            
            {userData.authoredProblems.length > 0 ? (
              <div className="space-y-4">
                {userData.authoredProblems.map((problem: ProblemData) => (
                  <Link key={problem._id} href={`/problems/${problem._id}`} className="block">
                    <div className="border border-gray-200 rounded-md p-4 hover:shadow-md transition">
                      <h4 className="font-semibold mb-1">{problem.title}</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{problem.description}</p>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>참여자 {problem.participants?.length || 0}명</span>
                        <span>{new Date(problem.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>아직 등록한 문제가 없습니다.</p>
                <Link href="/problems/new" className="text-indigo-600 hover:text-indigo-800 text-sm block mt-2">
                  문제 등록하기
                </Link>
              </div>
            )}
          </div>
          
          {/* 제안한 해결책 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">내가 제안한 해결책</h3>
              <Link href="/solutions" className="text-indigo-600 hover:text-indigo-800 text-sm">
                전체 보기
              </Link>
            </div>
            
            {userData.authoredSolutions.length > 0 ? (
              <div className="space-y-4">
                {userData.authoredSolutions.map((solution: SolutionData) => (
                  <Link 
                    key={solution._id} 
                    href={`/problems/${typeof solution.problem === 'string' ? solution.problem : solution.problem._id}/solutions/${solution._id}`} 
                    className="block"
                  >
                    <div className="border border-gray-200 rounded-md p-4 hover:shadow-md transition">
                      <h4 className="font-semibold mb-1">{solution.title}</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{solution.description}</p>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>문제: {typeof solution.problem === 'object' ? solution.problem.title : '삭제된 문제'}</span>
                        <span>투표 {solution.votes || 0}개</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>아직 제안한 해결책이 없습니다.</p>
                <Link href="/problems" className="text-indigo-600 hover:text-indigo-800 text-sm block mt-2">
                  해결책 제안하기
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 