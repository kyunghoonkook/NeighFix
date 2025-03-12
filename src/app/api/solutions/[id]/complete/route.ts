import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Solution from '@/models/Solution';
import Problem from '@/models/Problem';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 인증 확인
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    const { id: solutionId } = params;
    const userId = session.user.id;
    
    // 해결책 존재 확인
    const solution = await Solution.findById(solutionId);
    if (!solution) {
      return NextResponse.json(
        { error: '해결책을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 문제 가져오기
    const problem = await Problem.findById(solution.problem);
    if (!problem) {
      return NextResponse.json(
        { error: '연결된 문제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 권한 확인 (문제 등록자만 완료 처리 가능)
    if (problem.author.toString() !== userId) {
      return NextResponse.json(
        { error: '문제 등록자만 완료 처리할 수 있습니다.' },
        { status: 403 }
      );
    }
    
    // 이미 완료된 문제인지 확인
    if (problem.isCompleted) {
      return NextResponse.json(
        { error: '이미 완료된 문제입니다.' },
        { status: 400 }
      );
    }
    
    // 트랜잭션으로 처리 (여러 문서 업데이트)
    const session_db = await Solution.db.startSession();
    session_db.startTransaction();
    
    try {
      // 1. 선택된 해결책 상태 업데이트
      await Solution.findByIdAndUpdate(
        solutionId,
        { 
          isSelected: true,
          status: 'implemented'  
        },
        { session: session_db }
      );
      
      // 2. 문제 완료 상태로 업데이트
      await Problem.findByIdAndUpdate(
        problem._id,
        { 
          isCompleted: true,
          status: 'resolved',
          selectedSolution: solutionId 
        },
        { session: session_db }
      );
      
      // 3. 해당 문제의 다른 해결책들 상태 업데이트
      await Solution.updateMany(
        { 
          problem: problem._id,
          _id: { $ne: solutionId }
        },
        { status: 'approved' },
        { session: session_db }
      );
      
      await session_db.commitTransaction();
      session_db.endSession();
      
      return NextResponse.json({
        success: true,
        message: '문제가 성공적으로 해결되었습니다.'
      });
      
    } catch (error) {
      await session_db.abortTransaction();
      session_db.endSession();
      throw error;
    }
    
  } catch (error) {
    console.error('문제 완료 처리 오류:', error);
    return NextResponse.json(
      { error: '문제 완료 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 