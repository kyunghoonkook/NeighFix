import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { OpenAI } from 'openai';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authOptions } from '../../auth/[...nextauth]/route';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { problemId } = await req.json();
    
    if (!problemId) {
      return NextResponse.json(
        { error: '문제 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 문제 조회 및 관련 데이터 가져오기
    const problem = await Problem.findById(problemId)
      .populate('author', 'name')
      .populate('participants', 'name');
    
    if (!problem) {
      return NextResponse.json(
        { error: '문제를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 심층 분석을 위한 프롬프트 생성
    const prompt = `
당신은 지역사회 문제 해결 전문가입니다. 다음 지역사회 문제를 심층적으로 분석해 주세요:

문제 제목: ${problem.title}
문제 설명: ${problem.description}
위치: ${problem.location.address}
카테고리: ${problem.category}
태그: ${problem.tags.join(', ')}
참여자 수: ${problem.participants.length}명
유사 문제 빈도: ${problem.frequency}건
현재 상태: ${problem.status}

다음 형식으로 구체적이고 실용적인 심층 분석 결과를 제공해 주세요:

1. 문제 유형 분류: [환경, 안전, 인프라, 사회적 문제 등 상세 유형]

2. 심각성 평가: 
   - 긴급도: [상/중/하]
   - 영향 범위: [개인/소규모 그룹/지역사회 전체]
   - 지속 기간: [일시적/단기/장기적]

3. 핵심 원인 분석:
   - 직접적 원인
   - 간접적 원인
   - 구조적 원인

4. 필요 자원 식별:
   - 인적 자원: [필요한 전문가, 봉사자 유형 및 수]
   - 물적 자원: [필요한 장비, 재료]
   - 재정적 자원: [예상 비용 범위]
   - 제도적 자원: [필요한 정책, 규제 지원]

5. 해결 접근법:
   - 단기 해결책 (1주 이내): [구체적 행동 방안]
   - 중기 해결책 (1-3개월): [구체적 행동 방안]
   - 장기 해결책 (3개월 이상): [구체적 행동 방안]

6. 잠재적 파트너:
   - 공공기관: [관련 기관명]
   - 민간기업: [관련 기업 유형]
   - 비영리단체: [관련 단체 유형]
   - 지역사회 그룹: [관련 커뮤니티]

7. 예상 장애물:
   - 주요 장애요소
   - 극복 방안

8. 성공 지표:
   - 단기 성공 지표
   - 장기 성공 지표
   - 측정 방법

9. 종합 평가 및 권장사항:
   - 최우선 조치사항
   - 핵심 성공 요소
   - 모범 사례 참고

실제 지역사회 문제 해결에 활용할 수 있는 구체적이고 현실적인 분석을 제공해 주세요.
`;
    
    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo-0125",
      temperature: 0.5,
      max_tokens: 2000,
    });
    
    const analysisResult = completion.choices[0].message.content || '';
    
    // 분석 결과를 DB에 저장
    problem.lastAnalysis = analysisResult;
    await problem.save();
    
    return NextResponse.json({
      message: '심층 분석이 완료되었습니다',
      analysis: analysisResult
    });
  } catch (error) {
    console.error('AI 분석 에러:', error);
    return NextResponse.json(
      { error: 'AI 분석 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 