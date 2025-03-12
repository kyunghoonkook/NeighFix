import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Solution from '@/models/Solution';
import { authOptions } from "@/lib/auth";
import mongoose from 'mongoose';

// 특정 문제 조회
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
        { error: '유효하지 않은 문제 ID입니다' },
        { status: 400 }
      );
    }
    
    const problem = await Problem.findById(id).populate('author', 'name email image');
    
    if (!problem) {
      return NextResponse.json(
        { error: '문제를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 문제에 대한 해결책 목록도 함께 조회
    const solutions = await Solution.find({ problem: id })
      .populate('author', 'name email image')
      .sort({ votes: -1, createdAt: -1 });
    
    return NextResponse.json({ problem, solutions });
  } catch (error) {
    console.error('문제 조회 에러:', error);
    return NextResponse.json(
      { error: '문제를 조회하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 문제 수정
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
        { error: '유효하지 않은 문제 ID입니다' },
        { status: 400 }
      );
    }
    
    const problem = await Problem.findById(id);
    
    if (!problem) {
      return NextResponse.json(
        { error: '문제를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 작성자 또는 관리자만 수정 가능
    if (problem.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '이 문제를 수정할 권한이 없습니다' },
        { status: 403 }
      );
    }
    
    // Content-Type에 따라 FormData 또는 JSON 처리
    const contentType = req.headers.get('content-type') || '';
    let updates: Record<string, any> = {};
    
    if (contentType.includes('multipart/form-data')) {
      // FormData 처리
      const formData = await req.formData();
      
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const category = formData.get('category') as string;
      const locationData = formData.get('location') as string;
      const tagsData = formData.get('tags') as string;
      
      // JSON 문자열을 객체로 파싱
      let location;
      let tags = [];
      
      try {
        if (locationData) {
          location = JSON.parse(locationData);
        }
        if (tagsData) {
          tags = JSON.parse(tagsData);
        }
      } catch (err) {
        console.error('JSON 파싱 오류:', err);
        return NextResponse.json(
          { error: '잘못된 데이터 형식입니다' },
          { status: 400 }
        );
      }
      
      // 필수 필드 유효성 검사
      if (!title || !description || !location || !category) {
        return NextResponse.json(
          { error: '필수 필드가 누락되었습니다' },
          { status: 400 }
        );
      }
      
      // 업데이트할 필드 설정
      updates = {
        title,
        description,
        category,
        location,
        tags
      };
      
      // 이미지 처리
      const imageFiles = formData.getAll('images');
      if (imageFiles.length > 0) {
        const images: string[] = [...problem.images]; // 기존 이미지 유지
        
        for (const imageFile of imageFiles) {
          if (imageFile instanceof File) {
            try {
              const buffer = await imageFile.arrayBuffer();
              const base64 = Buffer.from(buffer).toString('base64');
              const mimeType = imageFile.type;
              const dataUrl = `data:${mimeType};base64,${base64}`;
              images.push(dataUrl);
            } catch (error) {
              console.error('이미지 처리 오류:', error);
            }
          } else if (typeof imageFile === 'string') {
            // 이미 URL 형태로 전송된 이미지
            images.push(imageFile);
          }
        }
        
        updates.images = images;
      }
    } else {
      // JSON 처리 (기존 방식)
      const { title, description, location, category, images, tags, status } = await req.json();
      
      // 업데이트할 필드 구성
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (location) updates.location = location;
      if (category) updates.category = category;
      if (images) updates.images = images;
      if (tags) updates.tags = tags;
      if (status) updates.status = status;
    }
    
    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('author', 'name email image');
    
    return NextResponse.json({
      message: '문제가 성공적으로 수정되었습니다',
      problem: updatedProblem
    });
  } catch (error) {
    console.error('문제 수정 에러:', error);
    return NextResponse.json(
      { error: '문제를 수정하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 문제 삭제
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
        { error: '유효하지 않은 문제 ID입니다' },
        { status: 400 }
      );
    }
    
    const problem = await Problem.findById(id);
    
    if (!problem) {
      return NextResponse.json(
        { error: '문제를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 작성자 또는 관리자만 삭제 가능
    if (problem.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '이 문제를 삭제할 권한이 없습니다' },
        { status: 403 }
      );
    }
    
    // 삭제
    await Problem.findByIdAndDelete(id);
    
    // 관련된 해결책도 함께 삭제
    await Solution.deleteMany({ problem: id });
    
    return NextResponse.json({
      message: '문제와 관련 해결책이 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    console.error('문제 삭제 에러:', error);
    return NextResponse.json(
      { error: '문제를 삭제하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 