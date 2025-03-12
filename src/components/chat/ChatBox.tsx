"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    image?: string;
  };
  content: string;
  createdAt: string;
}

interface ChatParticipant {
  _id: string;
  name: string;
  image?: string;
}

interface ChatData {
  _id: string;
  problemId: string;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  isActive: boolean;
}

interface ChatBoxProps {
  problemId: string;
}

export function ChatBox({ problemId }: ChatBoxProps) {
  const { data: session } = useSession();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // 채팅 데이터 가져오기
  const fetchChatData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/chat?problemId=${problemId}`);
      setChatData(response.data);
    } catch (err: Error | unknown) {
      console.error('채팅 데이터 가져오기 실패:', err);
      setError(
        axios.isAxiosError(err) 
          ? err.response?.data?.error || '채팅 데이터를 불러오는 중 오류가 발생했습니다'
          : '채팅 데이터를 불러오는 중 오류가 발생했습니다'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 채팅 데이터 가져오기
  useEffect(() => {
    if (session) {
      fetchChatData();
    }
  }, [session, problemId]);
  
  // 채팅창 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatData?.messages]);
  
  // 메시지 전송 핸들러
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !session) return;
    
    try {
      setSending(true);
      
      const response = await axios.post('/api/chat', {
        problemId,
        content: newMessage.trim()
      });
      
      setChatData(response.data.chat);
      setNewMessage('');
    } catch (err: Error | unknown) {
      console.error('메시지 전송 실패:', err);
      setError(
        axios.isAxiosError(err) 
          ? err.response?.data?.error || '메시지 전송 중 오류가 발생했습니다'
          : '메시지 전송 중 오류가 발생했습니다'
      );
    } finally {
      setSending(false);
    }
  };
  
  // 채팅 메시지 렌더링
  const renderChatMessages = () => {
    if (!chatData || chatData.messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">아직 대화가 없습니다. 첫 메시지를 보내보세요!</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {chatData.messages.map((message) => {
          const isCurrentUser = message.sender._id === session?.user?.id;
          
          return (
            <div 
              key={message._id} 
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                    {message.sender.image ? (
                      <Image 
                        src={message.sender.image} 
                        alt={message.sender.name || '사용자'} 
                        width={32} 
                        height={32} 
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-600">
                        {message.sender.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div 
                    className={`
                      rounded-lg px-4 py-2 
                      ${isCurrentUser 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  
                  <div className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                    <span>{message.sender.name}</span>
                    <span className="mx-1">•</span>
                    <span>
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                        locale: ko
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
    );
  };
  
  // 참여자 목록 렌더링
  const renderParticipants = () => {
    if (!chatData || chatData.participants.length === 0) {
      return <p className="text-gray-500 text-sm">참여자 없음</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {chatData.participants.map((participant) => (
          <div key={participant._id} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
            <div className="h-5 w-5 rounded-full overflow-hidden bg-gray-200">
              {participant.image ? (
                <Image 
                  src={participant.image} 
                  alt={participant.name} 
                  width={20} 
                  height={20} 
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-gray-600">
                  {participant.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-700">{participant.name}</span>
          </div>
        ))}
      </div>
    );
  };
  
  if (!session) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500 mb-2">대화에 참여하려면 로그인이 필요합니다.</p>
            <Button>로그인</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">커뮤니티 대화</CardTitle>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">참여자</h3>
            {renderParticipants()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="medium" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={fetchChatData}
            >
              다시 시도
            </Button>
          </div>
        ) : (
          <div className="h-64 overflow-y-auto mb-4">
            {renderChatMessages()}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4">
        <form onSubmit={handleSendMessage} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <Button 
              type="submit" 
              disabled={sending || !newMessage.trim()}
              isLoading={sending}
            >
              전송
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
} 