'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';

interface SolutionFormProps {
  problemId: string;
  editMode?: boolean;
  solutionData?: {
    _id?: string;
    title?: string;
    description?: string;
    budget?: number;
    timeline?: string;
    resources?: string[];
  };
}

export function SolutionForm({ problemId, editMode = false, solutionData }: SolutionFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState(solutionData?.title || '');
  const [description, setDescription] = useState(solutionData?.description || '');
  const [budget, setBudget] = useState<number | undefined>(solutionData?.budget);
  const [timeline, setTimeline] = useState(solutionData?.timeline || '');
  const [resources, setResources] = useState<string[]>(solutionData?.resources || []);
  const [resourceInput, setResourceInput] = useState('');
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 리소스 추가
  const addResource = () => {
    if (resourceInput.trim() && !resources.includes(resourceInput.trim())) {
      setResources([...resources, resourceInput.trim()]);
      setResourceInput('');
    }
  };

  // 리소스 삭제
  const removeResource = (index: number) => {
    const newResources = [...resources];
    newResources.splice(index, 1);
    setResources(newResources);
  };

  // 키 입력 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addResource();
    }
  };

  // AI 솔루션 생성 요청
  const generateAISolution = async () => {
    if (!problemId) {
      setError('문제 ID가 필요합니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post('/api/ai/generate-solution', { problemId });
      
      if (response.data && response.data.solution) {
        setTitle(response.data.solution.title);
        setDescription(response.data.solution.description);
        setBudget(response.data.solution.budget);
        setTimeline(response.data.solution.timeline);
        setResources(response.data.solution.resources || []);
        setIsAIGenerated(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'AI 솔루션 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // 권한 확인
    if (!session) {
      setError('로그인이 필요한 기능입니다.');
      setIsLoading(false);
      return;
    }
    
    // 유효성 검사
    if (!title || !description) {
      setError('제목과 설명은 필수 입력 항목입니다.');
      setIsLoading(false);
      return;
    }
    
    try {
      const submissionData = {
        problemId,
        title,
        description,
        budget: budget || 0,
        timeline,
        resources,
        aiGenerated: isAIGenerated,
        ...(editMode && solutionData?._id && { _id: solutionData._id })
      };
      
      let response;
      if (editMode && solutionData?._id) {
        // 해결책 수정
        response = await axios.put(`/api/solutions/${solutionData._id}`, submissionData);
      } else {
        // 새로운 해결책 등록
        response = await axios.post('/api/solutions', submissionData);
      }
      
      setSuccess(editMode ? '해결책이 성공적으로 수정되었습니다.' : '해결책이 성공적으로 등록되었습니다.');
      
      // 등록 완료 후 해결책 상세 페이지로 이동
      setTimeout(() => {
        if (response.data && response.data.solution) {
          router.push(`/problems/${problemId}/solutions/${response.data.solution._id}`);
          router.refresh();
        } else {
          router.push(`/solutions?problemId=${problemId}`);
          router.refresh();
        }
      }, 1500);
    } catch (err: any) {
      console.error('해결책 등록 오류:', err);
      setError(err.response?.data?.error || '해결책 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{editMode ? '해결책 수정' : '새로운 해결책 제안'}</h1>
      
      {!editMode && (
        <div className="mb-6">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 mb-4"
            onClick={generateAISolution}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="small" /> : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 110-2h1V9z" clipRule="evenodd" />
              </svg>
            )}
            AI를 활용하여 해결책 생성하기
          </Button>
          <p className="text-sm text-gray-500 text-center">또는 직접 아래 양식을 작성하세요.</p>
        </div>
      )}
      
      {isAIGenerated && !editMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-blue-800 font-medium">AI가 생성한 해결책이 적용되었습니다.</p>
          <p className="text-blue-600 text-sm mt-1">필요한 경우 내용을 수정하고 제출해주세요.</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-green-600">{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* 제목 입력 */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">제목</label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="해결책의 제목을 입력하세요"
            required
          />
        </div>
        
        {/* 설명 입력 */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">설명</label>
          <textarea
            id="description"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="해결책에 대한 상세 설명을 입력하세요"
            required
          ></textarea>
        </div>
        
        {/* 예산 입력 */}
        <div className="mb-4">
          <label htmlFor="budget" className="block text-sm font-medium mb-1">예산 (₩)</label>
          <input
            type="number"
            id="budget"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={budget || ''}
            onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0"
          />
        </div>
        
        {/* 타임라인 입력 */}
        <div className="mb-4">
          <label htmlFor="timeline" className="block text-sm font-medium mb-1">예상 일정</label>
          <input
            type="text"
            id="timeline"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="예: 3개월 / 2024년 6월까지"
          />
        </div>
        
        {/* 필요 자원 입력 */}
        <div className="mb-6">
          <label htmlFor="resources" className="block text-sm font-medium mb-1">필요 자원</label>
          <div className="flex gap-2">
            <input
              type="text"
              id="resources"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={resourceInput}
              onChange={(e) => setResourceInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="자원을 입력하고 추가 버튼을 클릭하세요"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={addResource}
            >
              추가
            </Button>
          </div>
          {resources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {resources.map((resource, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                  <span className="text-sm">{resource}</span>
                  <button
                    type="button"
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    onClick={() => removeResource(index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 제출 버튼 */}
        <div className="flex justify-end">
          <Button 
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="small" />
                <span className="ml-2">처리 중...</span>
              </>
            ) : (
              editMode ? '해결책 수정하기' : '해결책 제안하기'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
} 