import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Solution from '@/models/Solution';
import { authOptions } from "@/lib/auth";
import mongoose from 'mongoose';

// 특정 해결책 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // 유효한 MongoDB ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 해결책 ID입니다' },
        { status: 400 }
      );
    }
    
    const solution = await Solution.findById(id)
      .populate('author', 'name email image')
      .populate('problem', 'title description status');
    
    if (!solution) {
      return NextResponse.json(
        { error: '해결책을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ solution });
  } catch (error) {
    console.error('해결책 조회 에러:', error);
    return NextResponse.json(
      { error: '해결책을 조회하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 해결책 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { id } = params;
    
    // 유효한 MongoDB ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 해결책 ID입니다' },
        { status: 400 }
      );
    }
    
    const solution = await Solution.findById(id);
    
    if (!solution) {
      return NextResponse.json(
        { error: '해결책을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 작성자 또는 관리자만 수정 가능
    if (solution.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '이 해결책을 수정할 권한이 없습니다' },
        { status: 403 }
      );
    }
    
    const { title, description, budget, timeline, resources } = await req.json();
    
    // 업데이트할 필드 구성
    const updates: Record<string, unknown> = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (budget !== undefined) updates.budget = budget;
    if (timeline) updates.timeline = timeline;
    if (resources) updates.resources = resources;
    
    const updatedSolution = await Solution.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('author', 'name email image');
    
    return NextResponse.json({
      message: '해결책이 성공적으로 수정되었습니다',
      solution: updatedSolution
    });
  } catch (error) {
    console.error('해결책 수정 에러:', error);
    return NextResponse.json(
      { error: '해결책을 수정하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 해결책 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { id } = params;
    
    // 유효한 MongoDB ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 해결책 ID입니다' },
        { status: 400 }
      );
    }
    
    const solution = await Solution.findById(id);
    
    if (!solution) {
      return NextResponse.json(
        { error: '해결책을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 작성자 또는 관리자만 삭제 가능
    if (solution.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '이 해결책을 삭제할 권한이 없습니다' },
        { status: 403 }
      );
    }
    
    // 삭제
    await Solution.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: '해결책이 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    console.error('해결책 삭제 에러:', error);
    return NextResponse.json(
      { error: '해결책을 삭제하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 