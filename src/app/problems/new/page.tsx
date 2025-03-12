import { Metadata } from 'next';
import { ProblemForm } from '@/components/problems/ProblemForm';

export const metadata: Metadata = {
  title: '문제 등록 - 지역사회 문제 해결 플랫폼',
  description: '당신의 지역에서 발견한 문제를 등록하고 AI 기반 해결책을 받아보세요.',
};

export default function NewProblemPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProblemForm />
    </div>
  );
} 