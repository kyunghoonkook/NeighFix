import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Solution from '@/models/Solution';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SolutionForm } from '@/components/solutions/SolutionForm';

interface EditSolutionPageProps {
  params: {
    id: string;
    solutionId: string;
  };
}

export async function generateMetadata({ params }: EditSolutionPageProps): Promise<Metadata> {
  await dbConnect();
  
  try {
    const solution = await Solution.findById(params.solutionId);
    
    if (!solution) {
      return {
        title: '해결책을 찾을 수 없습니다',
        description: '요청하신 해결책을 찾을 수 없습니다.'
      };
    }
    
    return {
      title: `${solution.title} - 해결책 수정`,
      description: `${solution.title} 해결책 정보를 수정합니다.`
    };
  } catch {
    return {
      title: '해결책 수정',
      description: '해결책 정보를 수정합니다.'
    };
  }
}

export default async function EditSolutionPage({ params }: EditSolutionPageProps) {
  const { id, solutionId } = params;
  const session = await getServerSession(authOptions);
  
  // 로그인 검증
  if (!session) {
    redirect(`/problems/${id}/solutions/${solutionId}`);
  }
  
  try {
    await dbConnect();
    
    // 해결책 정보 조회
    const solution = await Solution.findById(solutionId);
    
    if (!solution) {
      notFound();
    }
    
    // 권한 검증 (작성자 또는 관리자만 수정 가능)
    if (solution.author.toString() !== session.user.id && session.user.role !== 'admin') {
      redirect(`/problems/${id}/solutions/${solutionId}`);
    }
    
    // 문제와 해결책 연결 검증
    if (solution.problem.toString() !== id) {
      notFound();
    }
    
    // 리소스 배열로 변환 (DB에는 문자열로 저장되어 있음)
    const resources = solution.resources ? 
      solution.resources.split(',').map((r: string) => r.trim()) : 
      [];
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">해결책 수정</h1>
        <SolutionForm 
          problemId={id} 
          editMode={true}
          solutionData={{
            _id: solution._id.toString(),
            title: solution.title,
            description: solution.description,
            budget: solution.budget,
            timeline: solution.timeline,
            resources: resources
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('해결책 수정 페이지 로드 오류:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 my-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">오류가 발생했습니다</h2>
          <p className="text-red-500">해결책 수정 페이지를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </div>
    );
  }
} 