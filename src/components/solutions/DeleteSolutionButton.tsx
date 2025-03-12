'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '../ui/Button';

interface DeleteSolutionButtonProps {
  solutionId: string;
  problemId: string;
}

export const DeleteSolutionButton = ({ solutionId, problemId }: DeleteSolutionButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const handleDeleteClick = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.delete(`/api/solutions/${solutionId}`);
      router.push(`/solutions?problemId=${problemId}`);
      router.refresh();
    } catch (error) {
      console.error('해결책 삭제 오류:', error);
      alert('해결책을 삭제하는 중 오류가 발생했습니다.');
      setIsConfirming(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant="secondary"
      className={`${isConfirming ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200'}`}
      onClick={handleDeleteClick}
      disabled={isLoading}
    >
      {isLoading ? 
        '삭제 중...' : 
        (isConfirming ? '삭제 확인' : '삭제하기')
      }
    </Button>
  );
}; 