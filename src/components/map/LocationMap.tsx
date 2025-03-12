"use client";

import { useEffect, useRef, useState } from 'react';

interface LocationMapProps {
  coordinates: [number, number]; // [lng, lat]
  address: string;
}

export function LocationMap({ coordinates, address }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Google Maps API 키가 유효한지 확인
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' ||
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === '발급받은_Google_Maps_API_키를_여기에_입력') {
      setError('유효한 Google Maps API 키가 필요합니다.');
      return;
    }
    
    // Google Maps API가 로드되었는지 확인
    if (!window.google) {
      setError('Google Maps API가 로드되지 않았습니다.');
      return;
    }
    
    try {
      // 지도 초기화
      const [lng, lat] = coordinates;
      const mapOptions = {
        center: { lat, lng },
        zoom: 15,
      };
      
      const map = new google.maps.Map(mapRef.current!, mapOptions);
      
      // 마커 추가
      new google.maps.Marker({
        position: { lat, lng },
        map,
        title: address,
      });
    } catch (err) {
      console.error('지도 렌더링 오류:', err);
      setError('지도를 로드하는 중 오류가 발생했습니다.');
    }
  }, [coordinates, address]);
  
  if (error) {
    return (
      <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-gray-600 text-sm">좌표: {coordinates[1]}, {coordinates[0]}</p>
          <p className="text-gray-600 text-sm">{address}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={mapRef} className="h-full w-full rounded-lg" />
  );
} 