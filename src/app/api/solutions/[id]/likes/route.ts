import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Solution from '@/models/Solution';
import Like from '@/models/Like';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    
    // 솔루션 존재 확인
    const solution = await Solution.findById(solutionId);
    if (!solution) {
      return NextResponse.json(
        { error: '해결책을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 좋아요 기록 확인
    const existingLike = await Like.findOne({
      user: userId,
      solution: solutionId
    });
    
    let likes = solution.likes || 0;
    let liked = false;
    
    // 이미 좋아요를 눌렀다면 취소, 아니면 추가
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      likes = Math.max(0, likes - 1);
    } else {
      await Like.create({
        user: userId,
        solution: solutionId,
        createdAt: new Date()
      });
      likes = likes + 1;
      liked = true;
    }
    
    // 솔루션의 좋아요 수 업데이트
    await Solution.findByIdAndUpdate(solutionId, { likes });
    
    return NextResponse.json({
      success: true,
      likes,
      liked
    });
    
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 좋아요 상태 확인 API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 인증되지 않은 경우 좋아요 상태 없음
    if (!session || !session.user?.id) {
      return NextResponse.json({ liked: false });
    }
    
    await dbConnect();
    const { id: solutionId } = params;
    const userId = session.user.id;
    
    // 좋아요 기록 확인
    const existingLike = await Like.findOne({
      user: userId,
      solution: solutionId
    });
    
    return NextResponse.json({
      liked: !!existingLike
    });
    
  } catch (error) {
    console.error('좋아요 상태 확인 오류:', error);
    return NextResponse.json(
      { error: '좋아요 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 