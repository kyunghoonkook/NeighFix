import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Chat from '@/models/Chat';
import Problem from '@/models/Problem';
import { authOptions } from '../auth/[...nextauth]/route';

// 참가자 타입 정의
interface Participant {
  _id?: {
    toString(): string;
  } | string;
  name?: string;
  image?: string;
}

// 채팅 목록 조회 또는 필터링
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId');
    
    if (!problemId) {
      return NextResponse.json(
        { error: '문제 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 해당 문제의 채팅방이 존재하는지 확인
    let chat = await Chat.findOne({ problemId })
      .populate('participants', 'name image')
      .populate({
        path: 'messages.sender',
        select: 'name image'
      });
    
    // 채팅방이 없다면 새로 생성
    if (!chat) {
      // 문제가 존재하는지 확인
      const problem = await Problem.findById(problemId);
      
      if (!problem) {
        return NextResponse.json(
          { error: '문제를 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      
      // 새 채팅방 생성
      chat = new Chat({
        problemId,
        participants: [session.user.id],
        messages: []
      });
      
      await chat.save();
      
      // 새로 생성된 채팅방 정보 불러오기
      chat = await Chat.findById(chat._id)
        .populate('participants', 'name image')
        .populate({
          path: 'messages.sender',
          select: 'name image'
        });
    }
    
    // 사용자가 참여자 목록에 없다면 추가
    if (!chat.participants.some((p: Participant) => {
      if (typeof p === 'object' && p !== null && p._id) {
        const participantId = typeof p._id === 'string' ? p._id : p._id.toString();
        return participantId === session.user.id;
      }
      return false;
    })) {
      chat.participants.push(session.user.id);
      await chat.save();
    }
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error('채팅 조회 에러:', error);
    return NextResponse.json(
      { error: '채팅 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 새 메시지 전송
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
    
    const { problemId, content } = await req.json();
    
    if (!problemId || !content) {
      return NextResponse.json(
        { error: '문제 ID와 메시지 내용이 필요합니다' },
        { status: 400 }
      );
    }
    
    // 해당 문제의 채팅방이 존재하는지 확인
    let chat = await Chat.findOne({ problemId });
    
    // 채팅방이 없다면 새로 생성
    if (!chat) {
      // 문제가 존재하는지 확인
      const problem = await Problem.findById(problemId);
      
      if (!problem) {
        return NextResponse.json(
          { error: '문제를 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      
      // 새 채팅방 생성
      chat = new Chat({
        problemId,
        participants: [session.user.id],
        messages: []
      });
    }
    
    // 사용자가 참여자 목록에 없다면 추가
    if (!chat.participants.includes(session.user.id)) {
      chat.participants.push(session.user.id);
    }
    
    // 메시지 추가
    chat.messages.push({
      sender: session.user.id,
      content,
      createdAt: new Date()
    });
    
    await chat.save();
    
    // 새로 생성된 메시지 정보 불러오기
    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name image')
      .populate({
        path: 'messages.sender',
        select: 'name image'
      });
    
    // 실시간 소켓 통신 코드가 여기에 추가될 수 있습니다
    
    return NextResponse.json({
      message: '메시지가 전송되었습니다',
      chat: updatedChat
    });
  } catch (error) {
    console.error('메시지 전송 에러:', error);
    return NextResponse.json(
      { error: '메시지 전송 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 