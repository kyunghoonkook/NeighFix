import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authOptions } from "@/lib/auth";
import { OpenAI } from 'openai';
import mongoose from 'mongoose';

// OpenAI 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 요청 데이터 파싱
    const { problemId } = await req.json();
    
    // 필수 필드 확인
    if (!problemId) {
      return NextResponse.json(
        { error: '문제 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    // ObjectId 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return NextResponse.json(
        { error: '유효하지 않은 문제 ID입니다' },
        { status: 400 }
      );
    }
    
    // 데이터베이스 연결
    await dbConnect();
    
    // 문제 정보 조회
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return NextResponse.json(
        { error: '문제를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // OpenAI 요청 준비
    const prompt = `
    지역사회 문제에 대한 실용적인 해결책을 제안해주세요. 

    문제 제목: ${problem.title}
    문제 설명: ${problem.description}
    카테고리: ${problem.category}
    위치: ${problem.location.address}
    
    다음 형식으로 해결책을 제공해주세요:
    1. 제목: 간결하고 명확한 해결책 제목
    2. 설명: 상세한 해결책 설명 (500-800자 정도)
    3. 예산: 대략적인 금액 (예: 300000)
    4. 타임라인: 해결책 실행에 필요한 시간 (예: 3개월)
    5. 필요 자원: 배열 형태로 3-5개 항목 (예: ["인적 자원", "장비", "공간"])
    
    JSON 형식으로 응답해주세요.
    `;
    
    // OpenAI 요청
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: '당신은 지역사회 문제 해결에 도움을 주는 AI 전문가입니다. 주어진 문제에 대한 실용적이고 구체적인 해결책을 제안합니다.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });
    
    // AI 응답 파싱
    const responseText = aiResponse.choices[0].message.content;
    let solution;
    
    try {
      solution = JSON.parse(responseText || '{}');
    } catch (error) {
      console.error('AI 응답 파싱 오류:', error);
      return NextResponse.json(
        { error: 'AI 응답을 처리하는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ solution });
  } catch (error) {
    console.error('AI 해결책 생성 오류:', error);
    return NextResponse.json(
      { error: 'AI 해결책을 생성하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 