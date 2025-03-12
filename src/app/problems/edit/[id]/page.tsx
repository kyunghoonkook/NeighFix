import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { ProblemForm } from '@/components/problems/ProblemForm';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface EditProblemPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditProblemPageProps): Promise<Metadata> {
  const safeParams = await Promise.resolve(params);
  
  return {
    title: '문제 수정 - 지역사회 문제 해결 플랫폼',
    description: '문제 내용을 수정하여 더 정확한 정보를 제공해보세요.'
  };
}

export default async function EditProblemPage({ params }: EditProblemPageProps) {
  const safeParams = await Promise.resolve(params);
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 my-4">
          <h2 className="text-xl font-bold text-yellow-600 mb-2">접근 권한이 없습니다</h2>
          <p className="text-yellow-500">문제를 수정하려면 로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }
  
  try {
    await dbConnect();
    
    const problem = await Problem.findById(safeParams.id);
    
    if (!problem) {
      notFound();
    }
    
    // 작성자 또는 관리자만 수정 가능
    if (problem.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 my-4">
            <h2 className="text-xl font-bold text-red-600 mb-2">접근 권한이 없습니다</h2>
            <p className="text-red-500">이 문제의 작성자만 수정할 수 있습니다.</p>
          </div>
        </div>
      );
    }
    
    // 문제 데이터를 JSON으로 변환
    const problemData = JSON.parse(JSON.stringify(problem));
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">문제 수정</h1>
        <ProblemForm 
          editMode={true} 
          problemData={problemData} 
        />
      </div>
    );
  } catch (error) {
    console.error('문제 수정 페이지 로드 오류:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 my-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">오류가 발생했습니다</h2>
          <p className="text-red-500">문제 정보를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </div>
    );
  }
} 