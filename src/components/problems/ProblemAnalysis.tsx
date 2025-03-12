"use client";

import { useState } from 'react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';

interface ProblemAnalysisProps {
  problemId: string;
  initialAnalysis?: string;
}

export function ProblemAnalysis({ problemId, initialAnalysis }: ProblemAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>(initialAnalysis || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const requestAnalysis = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/api/ai/analyze', { problemId });
      setAnalysis(response.data.analysis);
    } catch (err: any) {
      setError(err.response?.data?.error || '분석 요청 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 분석 결과를 마크다운 형식으로 파싱하여 더 읽기 쉽게 렌더링
  const renderAnalysis = () => {
    if (!analysis) return null;

    // 줄바꿈을 <br> 태그로 변환
    const lines = analysis.split('\n');
    return lines.map((line, index) => {
      // 제목 형식 (숫자. 내용)
      if (/^\d+\./.test(line)) {
        return <h3 key={index} className="font-bold text-lg mt-4 mb-2">{line}</h3>;
      }
      // 부제목 형식 (- 내용)
      else if (/^\s*-\s/.test(line)) {
        return <p key={index} className="pl-4 py-1 font-medium">{line}</p>;
      }
      // 빈 줄
      else if (line.trim() === '') {
        return <br key={index} />;
      }
      // 일반 텍스트
      else {
        return <p key={index} className="py-1">{line}</p>;
      }
    });
  };

  return (
    <Card className="p-6 my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">문제 심층 분석</h2>
        {!loading && !analysis && (
          <Button onClick={requestAnalysis} className="bg-indigo-600 hover:bg-indigo-700">
            AI 분석 요청
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center py-8">
          <Spinner size="large" />
          <p className="mt-4 text-gray-600">AI가 문제를 분석하고 있습니다. 잠시만 기다려주세요...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="prose max-w-none">
          {renderAnalysis()}
        </div>
      )}

      {!analysis && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6 my-4 text-center">
          <p className="text-gray-600 mb-2">이 문제에 대한 AI 심층 분석을 아직 요청하지 않았습니다.</p>
          <p className="text-gray-500 text-sm">AI 분석을 통해 문제의 유형, 심각성, 원인, 필요 자원, 해결 접근법 등에 대한 상세한 정보를 얻을 수 있습니다.</p>
        </div>
      )}
    </Card>
  );
} 