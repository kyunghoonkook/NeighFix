import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Solution from '@/models/Solution';
import Problem from '@/models/Problem';
import { authOptions } from "@/lib/auth";
import mongoose from 'mongoose';

// 해결책 목록 조회
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const url = new URL(req.url);
    const problemId = url.searchParams.get('problemId');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    
    const skip = (page - 1) * limit;
    
    // 필터 조건 구성
    const filter: Record<string, mongoose.Types.ObjectId | undefined> = {};
    if (problemId) {
      // ObjectId 유효성 검사
      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return NextResponse.json(
          { error: '유효하지 않은 문제 ID입니다' },
          { status: 400 }
        );
      }
      filter.problem = new mongoose.Types.ObjectId(problemId);
    }
    
    const solutions = await Solution.find(filter)
      .populate('author', 'name email image')
      .populate('problem', 'title')
      .sort({ votes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Solution.countDocuments(filter);
    
    return NextResponse.json({
      solutions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('해결책 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '해결책 목록을 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 새 해결책 등록
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
    
    const { 
      problemId, 
      title, 
      description, 
      budget, 
      timeline, 
      resources, 
      aiGenerated 
    } = await req.json();
    
    // 필수 필드 유효성 검사
    if (!problemId || !title || !description) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }
    
    // 문제 ID 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return NextResponse.json(
        { error: '유효하지 않은 문제 ID입니다' },
        { status: 400 }
      );
    }
    
    // 문제가 존재하는지 확인
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return NextResponse.json(
        { error: '해당 문제를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 해결책 등록
    const solution = await Solution.create({
      title,
      description,
      problem: problemId,
      author: session.user.id,
      budget: budget || 0,
      timeline: timeline || '',
      resources: Array.isArray(resources) ? resources.join(', ') : resources || '',
      votes: 0,
      aiGenerated: aiGenerated || false,
      status: 'proposed'
    });
    
    await solution.populate('author', 'name email image');
    
    // 문제가 아직 '진행 중' 상태가 아니라면 상태 업데이트
    if (problem.status === 'pending') {
      await Problem.findByIdAndUpdate(problemId, { status: 'processing' });
    }
    
    return NextResponse.json(
      { message: '해결책이 성공적으로 등록되었습니다', solution },
      { status: 201 }
    );
  } catch (error) {
    console.error('해결책 등록 에러:', error);
    return NextResponse.json(
      { error: '해결책을 등록하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 