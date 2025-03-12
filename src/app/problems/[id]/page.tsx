import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProblemDetail } from '@/components/problems/ProblemDetail';
import { ProblemAnalysis } from '@/components/problems/ProblemAnalysis';
import { ChatBox } from '@/components/chat/ChatBox';
import { ResourceMatching } from '@/components/resources/ResourceMatching';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';

interface ProblemPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProblemPageProps): Promise<Metadata> {
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
      title: `${problem.title} - 지역사회 문제 해결 플랫폼`,
      description: problem.description.substring(0, 160),
    };
  } catch {
    return {
      title: '오류가 발생했습니다',
      description: '문제 정보를 불러오는 중 오류가 발생했습니다.'
    };
  }
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const safeParams = await Promise.resolve(params);
  await dbConnect();
  
  try {
    const problem = await Problem.findById(safeParams.id)
      .populate('author', 'name image')
      .populate('participants', 'name image');
    
    if (!problem) {
      notFound();
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <ProblemDetail problem={JSON.parse(JSON.stringify(problem))} />
        <ProblemAnalysis 
          problemId={safeParams.id} 
          initialAnalysis={problem.lastAnalysis} 
        />
        <ChatBox problemId={safeParams.id} />
        <ResourceMatching problemId={safeParams.id} />
      </div>
    );
  } catch (error) {
    console.error('문제 상세 페이지 로드 오류:', error);
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