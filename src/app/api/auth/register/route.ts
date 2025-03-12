import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, location } = await req.json();
    
    // 필드 유효성 검사
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '유효한 이메일 형식이 아닙니다' },
        { status: 400 }
      );
    }
    
    // 비밀번호 검사 (최소 8자)
    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 최소 8자 이상이어야 합니다' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // 이미 존재하는 이메일인지 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다' },
        { status: 409 }
      );
    }
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 새 사용자 생성
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      location,
      role: 'user',
      createdAt: new Date()
    });
    
    // 응답에서 비밀번호 필드 제외
    const result = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      location: user.location
    };
    
    return NextResponse.json(
      { message: '회원가입이 완료되었습니다', user: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('회원가입 에러:', error);
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 