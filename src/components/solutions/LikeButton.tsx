'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

interface LikeButtonProps {
  solutionId: string;
  initialLikes: number;
  initialLiked?: boolean;
}

export function LikeButton({ solutionId, initialLikes, initialLiked = false }: LikeButtonProps) {
  const { data: session, status } = useSession();
  const [likes, setLikes] = useState<number>(initialLikes);
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // 세션이 로드되면 사용자의 좋아요 상태 확인
    if (status === 'authenticated' && session?.user?.id) {
      checkIfLiked();
    }
  }, [session, status, solutionId]);

  const checkIfLiked = async () => {
    try {
      const response = await fetch(`/api/solutions/${solutionId}/likes/check`);
      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
      }
    } catch (error) {
      console.error('좋아요 상태 확인 오류:', error);
    }
  };

  const handleLike = async () => {
    if (status !== 'authenticated') {
      toast({
        title: '로그인이 필요합니다',
        message: '좋아요를 하려면 로그인해주세요.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/solutions/${solutionId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setLiked(data.liked);
        
        toast({
          title: data.liked ? '좋아요 완료' : '좋아요 취소',
          message: data.liked ? '해결책에 좋아요를 표시했습니다.' : '해결책에 좋아요를 취소했습니다.',
          type: 'success',
        });
      } else {
        toast({
          title: '오류 발생',
          message: '좋아요 처리 중 오류가 발생했습니다.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error);
      toast({
        title: '오류 발생',
        message: '좋아요 처리 중 오류가 발생했습니다.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLike}
      disabled={isLoading}
      variant="ghost"
      className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
        liked ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-red-500'
      }`}
    >
      <span className="text-xl">
        {liked ? '❤️' : '🤍'}
      </span>
      <span className="font-semibold">{likes}</span>
    </Button>
  );
} 