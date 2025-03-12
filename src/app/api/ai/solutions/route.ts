import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { OpenAI } from 'openai';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Solution from '@/models/Solution';
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
    
    // 문제 조회
    const problem = await Problem.findById(problemId).populate('author', 'name');
    
    if (!problem) {
      return NextResponse.json(
        { error: '문제를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // AI에게 문제 설명 및 해결책 요청
    const prompt = `
다음은 지역사회에서 발생한 문제에 대한 설명입니다:

제목: ${problem.title}
위치: ${problem.location}
카테고리: ${problem.category}
설명: ${problem.description}
${problem.tags && problem.tags.length > 0 ? `태그: ${problem.tags.join(', ')}` : ''}

위 문제에 대한 현실적이고 효과적인 해결책을 제시해주세요. 
다음 형식으로 응답해주세요:

1. 해결책 제목
2. 상세 설명
3. 필요한 자원
4. 예상 비용
5. 실행 타임라인
`;
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const aiResponse = completion.choices[0].message.content || '';
    
    // AI 응답 파싱
    const lines = aiResponse.split('\n').filter(line => line.trim() !== '');
    
    let title = '지역사회 문제 해결책';
    let description = aiResponse;
    let resources = '';
    let budget = 0;
    let timeline = '';
    
    // 응답에서 정보 추출 시도
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('1.') || line.includes('해결책 제목')) {
        title = line.replace(/1\.\s|해결책 제목[:：]?\s?/g, '').trim();
      } else if (line.startsWith('3.') || line.includes('필요한 자원')) {
        resources = line.replace(/3\.\s|필요한 자원[:：]?\s?/g, '').trim();
        
        // 다음 줄들이 있고 다음 섹션이 시작되지 않았다면 계속 붙임
        let j = i + 1;
        while (j < lines.length && !lines[j].startsWith('4.') && !lines[j].includes('예상 비용')) {
          resources += '\n' + lines[j];
          j++;
        }
      } else if (line.startsWith('4.') || line.includes('예상 비용')) {
        const budgetStr = line.replace(/4\.\s|예상 비용[:：]?\s?/g, '').trim();
        // 숫자만 추출 시도
        const budgetMatch = budgetStr.match(/\d[\d,]*(\.\d+)?/);
        budget = budgetMatch ? parseFloat(budgetMatch[0].replace(/,/g, '')) : 0;
      } else if (line.startsWith('5.') || line.includes('실행 타임라인')) {
        timeline = line.replace(/5\.\s|실행 타임라인[:：]?\s?/g, '').trim();
        
        // 다음 줄들이 있으면 계속 붙임
        let j = i + 1;
        while (j < lines.length) {
          timeline += '\n' + lines[j];
          j++;
        }
      }
    }
    
    // 해결책 생성
    const solution = await Solution.create({
      title,
      description,
      problem: problemId,
      author: session.user.id,
      votes: 0,
      aiGenerated: true,
      status: 'proposed',
      resources,
      budget,
      timeline
    });
    
    await solution.populate('author', 'name email image');
    await solution.populate('problem', 'title');
    
    return NextResponse.json({
      message: 'AI 해결책이 성공적으로 생성되었습니다',
      solution
    });
  } catch (error) {
    console.error('AI 해결책 생성 에러:', error);
    return NextResponse.json(
      { error: 'AI 해결책을 생성하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 