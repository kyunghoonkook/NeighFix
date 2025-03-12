import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Like from '@/models/Like';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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