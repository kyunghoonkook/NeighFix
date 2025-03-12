"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/Button';

interface CompleteSolutionButtonProps {
  solutionId: string;
  problemId: string;
}

export function CompleteSolutionButton({ solutionId, problemId }: CompleteSolutionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleComplete = async () => {
    // 확인 대화상자 표시
    const confirmComplete = window.confirm(
      "이 해결책으로 문제를 완료 처리하시겠습니까?\n\n" +
      "문제의 상태가 '해결됨'으로 변경되고 다른 해결책들은 더 이상 진행되지 않습니다. " +
      "이 작업은 되돌릴 수 없습니다."
    );
    
    if (!confirmComplete) return;
    
    try {
      setIsLoading(true);
      // API 호출
      await axios.post(`/api/solutions/${solutionId}/complete`);
      
      // 성공 후 페이지 새로고침
      router.refresh();
      
      // 문제 페이지로 리디렉션
      router.push(`/problems/${problemId}`);
    } catch (error) {
      console.error('해결책 완료 처리 오류:', error);
      alert('해결책을 완료 처리하는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleComplete}
      disabled={isLoading}
      variant="primary"
      className="bg-green-600 hover:bg-green-700"
    >
      {isLoading ? '처리 중...' : '이 해결책으로 문제 완료하기'}
    </Button>
  );
} 