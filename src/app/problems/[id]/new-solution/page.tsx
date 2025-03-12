import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { SolutionForm } from '@/components/solutions/SolutionForm';
import { authOptions } from "@/lib/auth";

interface NewSolutionPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: NewSolutionPageProps): Promise<Metadata> {
  const safeParams = await Promise.resolve(params);
  await dbConnect();
  
  try {
    const problem = await Problem.findById(safeParams.id);
    
    if (!problem) {
      return {
        title: '문제를 찾을 수 없습니다',
        description: '요청하신 문제를 찾을 수 없습니다.'
      };
    }
    
    return {
      title: `${problem.title} - 해결책 제안하기`,
      description: `${problem.title} 문제에 대한 새로운 해결책을 제안해보세요.`
    };
  } catch {
    return {
      title: '해결책 제안하기',
      description: '지역 문제에 대한 새로운 해결책을 제안해보세요.'
    };
  }
}

export default async function NewSolutionPage({ params }: NewSolutionPageProps) {
  const safeParams = await Promise.resolve(params);
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 my-4">
          <h2 className="text-xl font-bold text-yellow-600 mb-2">접근 권한이 없습니다</h2>
          <p className="text-yellow-500">해결책을 제안하려면 로그인이 필요합니다.</p>
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
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">해결책 제안하기</h1>
          <p className="text-gray-600 mt-2">
            <span className="font-semibold">문제:</span> {problem.title}
          </p>
        </div>
        <SolutionForm problemId={safeParams.id} />
      </div>
    );
  } catch (error) {
    console.error('해결책 제안 페이지 로드 오류:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 my-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">오류가 발생했습니다</h2>
          <p className="text-red-500">해결책 제안 페이지를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </div>
    );
  }
} 