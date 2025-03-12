"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

interface MatchDetails {
  distanceScore: number;
  categoryScore: number;
  supportScore: number;
  distanceInKm: string;
}

interface MatchedResource {
  _id: string;
  name: string;
  type: "public" | "private" | "ngo";
  category: string[];
  description: string;
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
  };
  address: string;
  availableSupport: string[];
  owner: {
    _id: string;
    name: string;
    image?: string;
  };
  isVerified: boolean;
  matchScore: number;
  matchDetails: MatchDetails;
}

interface ResourceMatchingProps {
  problemId: string;
}

export function ResourceMatching({ problemId }: ResourceMatchingProps) {
  const [matchedResources, setMatchedResources] = useState<MatchedResource[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(0);

  const fetchMatchedResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `/api/resources/match?problemId=${problemId}`
      );
      setMatchedResources(response.data.matchedResources);
      setSearchRadius(response.data.searchRadius);
    } catch (err: Error | unknown) {
      console.error("자원 매칭 데이터 가져오기 실패:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error ||
              "자원 매칭 데이터를 불러오는 중 오류가 발생했습니다"
          : "자원 매칭 데이터를 불러오는 중 오류가 발생했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchedResources();
  }, [problemId]);

  // 자원 유형에 따른 아이콘 및 색상
  const getResourceTypeInfo = (type: string) => {
    switch (type) {
      case "public":
        return {
          label: "공공기관",
          color: "bg-blue-100 text-blue-800",
        };
      case "private":
        return {
          label: "민간기업",
          color: "bg-purple-100 text-purple-800",
        };
      case "ngo":
        return {
          label: "비영리단체",
          color: "bg-green-100 text-green-800",
        };
      default:
        return {
          label: "기타",
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  // 매칭 점수에 따른 색상
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">지역 자원 매칭</CardTitle>
        <p className="text-sm text-gray-500">
          문제 해결에 도움을 줄 수 있는 {searchRadius}km 이내의 자원들입니다
        </p>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center py-8">
            <Spinner size="large" />
            <p className="mt-4 text-gray-600">자원 매칭 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={fetchMatchedResources}
            >
              다시 시도
            </Button>
          </div>
        ) : matchedResources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-2">
              근처에서 적합한 자원을 찾을 수 없습니다
            </p>
            <p className="text-gray-500 text-sm">
              검색 범위를 넓히거나 다른 카테고리로 시도해보세요
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matchedResources.map((resource) => {
              const typeInfo = getResourceTypeInfo(resource.type);
              const scoreColor = getScoreColor(resource.matchScore);

              return (
                <div
                  key={resource._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium">{resource.name}</h3>
                        {resource.isVerified && (
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            인증됨
                          </span>
                        )}
                      </div>

                      <div className="flex items-center mt-1 space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>
                        {resource.category.slice(0, 3).map((cat, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                          >
                            {cat}
                          </span>
                        ))}
                        {resource.category.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{resource.category.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className={`text-lg font-bold ${scoreColor}`}>
                        {resource.matchScore}점
                      </div>
                      <div className="text-sm text-gray-500">
                        {resource.matchDetails.distanceInKm}km 거리
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-gray-700 line-clamp-2">
                    {resource.description}
                  </p>

                  <div className="mt-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">주소:</span>{" "}
                      {resource.address}
                    </div>
                    {resource.contactInfo.phone && (
                      <div>
                        <span className="font-medium">연락처:</span>{" "}
                        {resource.contactInfo.phone}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center space-x-1">
                      <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-200">
                        {resource.owner.image ? (
                          <Image
                            src={resource.owner.image}
                            alt={resource.owner.name}
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-gray-600">
                            {resource.owner.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {resource.owner.name}
                      </span>
                    </div>

                    <Button variant="outline" size="sm">
                      자세히 보기
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
