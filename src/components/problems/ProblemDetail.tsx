"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Button } from "../ui/Button";
import { IProblem } from "@/models/Problem";
import { LocationMap } from "../map/LocationMap";
import axios from "axios";
import { useRouter } from "next/navigation";

// 날짜 형식 지정을 위한 유틸리티 함수
function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - targetDate.getTime()) / 1000
  );

  // 시간대별로 다른 형식 반환
  if (diffInSeconds < 60) {
    return "방금 전";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}일 전`;
  } else if (diffInSeconds < 2592000) {
    // 약 30일
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}주 전`;
  } else {
    // 한 달 이상이면 날짜 표시
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }
}

// 사용자 정보 인터페이스
interface UserInfo {
  _id: string;
  name?: string;
  image?: string;
}

// 참가자 타입 정의
interface Participant {
  _id: string;
  name?: string;
  image?: string;
}

interface ProblemDetailProps {
  problem: IProblem;
}

export function ProblemDetail({ problem }: ProblemDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Mongoose 객체를 일반 JS 객체로 변환 (타입 안전성을 위해)
  const problemData = JSON.parse(JSON.stringify(problem));

  const [isParticipating, setIsParticipating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 현재 로그인한 사용자가 문제 작성자인지 확인
  const isAuthor = session?.user?.id === 
    (typeof problemData.author === 'object' ? problemData.author._id : problemData.author);

  // 우선순위에 따른 배지 색상
  const priorityBadgeColor = () => {
    switch (problemData.priority) {
      case 3:
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // 상태에 따른 배지 색상
  const statusBadgeColor = () => {
    switch (problemData.status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 상태 텍스트 변환
  const statusText = () => {
    switch (problemData.status) {
      case "resolved":
        return "해결됨";
      case "processing":
        return "진행 중";
      default:
        return "대기 중";
    }
  };

  // 참여 버튼 클릭 핸들러
  const handleParticipate = () => {
    // TODO: API 호출하여 참여 상태 업데이트
    setIsParticipating(!isParticipating);
  };

  // 참여자 목록 렌더링 helper
  const renderParticipants = () => {
    if (!problemData.participants || problemData.participants.length === 0) {
      return <p className="text-gray-500">아직 참여자가 없습니다</p>;
    }

    return (
      <>
        {problemData.participants
          .slice(0, 5)
          .map((participant: string | Participant, index: number) => {
            // 직렬화된 객체에서는 participant가 id만 있는 문자열이거나
            // name, image 등 정보가 있는 객체일 수 있음
            const participantInfo: UserInfo =
              typeof participant === "object"
                ? {
                    _id: participant._id || "",
                    name: participant.name,
                    image: participant.image,
                  }
                : { _id: participant };

            return (
              <div
                key={index}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden"
              >
                {participantInfo.image ? (
                  <Image
                    src={participantInfo.image}
                    alt={participantInfo.name || "참여자"}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-300 h-full w-full flex items-center justify-center text-xs text-gray-600">
                    {participantInfo.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
            );
          })}
        {problemData.participants.length > 5 && (
          <div className="inline-block h-8 w-8 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-xs text-gray-600">
            +{problemData.participants.length - 5}
          </div>
        )}
      </>
    );
  };

  // 작성자 정보 처리 (직렬화된 객체에서는 id 또는 전체 객체)
  const authorInfo: UserInfo =
    typeof problemData.author === "object"
      ? {
          _id: problemData.author._id || "",
          name: problemData.author.name,
          image: problemData.author.image,
        }
      : { _id: problemData.author };

  // 수정 페이지로 이동
  const handleEdit = () => {
    router.push(`/problems/edit/${problemData._id}`);
  };

  // 문제 삭제 처리
  const handleDelete = async () => {
    if (!confirm('정말 이 문제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`/api/problems/${problemData._id}`);
      router.push('/problems');
      router.refresh();
    } catch (error) {
      console.error('문제 삭제 오류:', error);
      alert('문제를 삭제하는 중 오류가 발생했습니다.');
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">
              {problemData.title}
            </CardTitle>
            <div className="flex items-center mt-2 space-x-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${priorityBadgeColor()}`}
              >
                {problemData.priority === 3
                  ? "높은 우선순위"
                  : problemData.priority === 2
                  ? "중간 우선순위"
                  : "낮은 우선순위"}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadgeColor()}`}
              >
                {statusText()}
              </span>
              {problemData.tags?.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {formatRelativeTime(problemData.createdAt)}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">
            {problemData.description}
          </p>
        </div>

        {problemData.images && problemData.images.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {problemData.images.map((image: string, index: number) => (
              <div
                key={index}
                className="relative h-48 rounded-lg overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`${problemData.title} 이미지 ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {problemData.location && problemData.location.coordinates && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">위치</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700">{problemData.location.address}</p>
              <div className="h-64 w-full bg-gray-200 mt-2 rounded-lg relative">
                <LocationMap 
                  coordinates={problemData.location.coordinates as [number, number]} 
                  address={problemData.location.address} 
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">카테고리</h3>
          <p className="text-gray-700">{problemData.category}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">비슷한 문제 빈도</h3>
          <p className="text-gray-700">{problemData.frequency}건</p>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">참여자</h3>
          <div className="flex -space-x-2 overflow-hidden">
            {renderParticipants()}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-6 flex justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
            {authorInfo.image ? (
              <Image
                src={authorInfo.image}
                alt={authorInfo.name || "작성자"}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-600">
                {authorInfo.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{authorInfo.name || "익명"}</p>
            <p className="text-xs text-gray-500">작성자</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {/* 작성자에게만 수정/삭제 버튼 표시 */}
          {isAuthor && (
            <>
              <Button variant="outline" onClick={handleEdit}>
                수정
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="text-red-600 hover:bg-red-50 border-red-300"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            </>
          )}
          
          {/* 참여 버튼은 비작성자에게만 표시 */}
          {!isAuthor && (
            <Button
              variant={isParticipating ? "secondary" : "primary"}
              onClick={handleParticipate}
            >
              {isParticipating ? "참여 취소" : "참여하기"}
            </Button>
          )}
          
          {/* 해결책 링크 수정 */}
          <Link href={`/solutions?problemId=${problemData._id}`}>
            <Button variant="outline">해결책 보기</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
