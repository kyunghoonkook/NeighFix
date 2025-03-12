'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';

// Google Maps 타입 정의
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: google.maps.MapOptions) => google.maps.Map;
        Marker: new (options: google.maps.MarkerOptions) => google.maps.Marker;
        places: {
          Autocomplete: new (element: HTMLInputElement, options?: google.maps.places.AutocompleteOptions) => google.maps.places.Autocomplete;
          PlacesService: new (map: google.maps.Map) => google.maps.places.PlacesService;
        };
        Geocoder: new () => google.maps.Geocoder;
        Animation: {
          DROP: number;
        };
        MapMouseEvent: google.maps.MapMouseEvent;
        event: {
          clearInstanceListeners: (instance: google.maps.MapsEventListener | google.maps.places.Autocomplete) => void;
          addListener: <T extends google.maps.places.Autocomplete | google.maps.Map | google.maps.Marker>(
            instance: T, 
            eventName: string, 
            handler: (...args: unknown[]) => void
          ) => google.maps.MapsEventListener;
        };
      };
    };
    __googleMapsScriptLoading?: boolean;
    initGoogleMaps?: () => void;
  }
}

// 문제 제출 폼 인터페이스
interface ProblemFormProps {
  editMode?: boolean;
  problemData?: {
    _id?: string;
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
    location?: {
      coordinates: [number, number];
      address: string;
    };
    images?: string[];
  };
}

// 카테고리 목록
const CATEGORIES = [
  '환경',
  '교통',
  '안전',
  '복지',
  '시설',
  '기타'
];

export function ProblemForm({ editMode = false, problemData }: ProblemFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState(problemData?.title || '');
  const [description, setDescription] = useState(problemData?.description || '');
  const [category, setCategory] = useState(problemData?.category || '');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>(problemData?.tags || []);
  const [location, setLocation] = useState({
    coordinates: problemData?.location?.coordinates || [0, 0],
    address: problemData?.location?.address || ''
  });
  const [images, setImages] = useState<string[]>(problemData?.images || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // 상태로 map과 marker 관리
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // 구글 맵 스크립트 로딩
  useEffect(() => {
    // 전역 변수로 스크립트 로딩 상태 추적
    const isScriptLoading = window.__googleMapsScriptLoading;
    const isScriptLoaded = window.google?.maps;
    
    if (isScriptLoaded) {
      // 이미 로드된 경우 바로 맵 초기화
      setIsMapLoaded(true);
      return;
    }
    
    if (isScriptLoading) {
      // 이미 로딩 중인 경우 로드 완료 이벤트 리스너 추가
      const handleMapsLoaded = () => {
        setIsMapLoaded(true);
      };
      window.addEventListener('google-maps-loaded', handleMapsLoaded);
      return () => {
        window.removeEventListener('google-maps-loaded', handleMapsLoaded);
      };
    }
    
    // 스크립트 로딩 시작
    window.__googleMapsScriptLoading = true;
    
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // 콜백 함수를 전역으로 정의
      window.initGoogleMaps = () => {
        window.__googleMapsScriptLoading = false;
        setIsMapLoaded(true);
        // 커스텀 이벤트를 발생시켜 다른 컴포넌트에게 로드 완료 알림
        window.dispatchEvent(new Event('google-maps-loaded'));
        // 콜백 함수 정리
        delete window.initGoogleMaps;
      };
      
      script.onerror = (error) => {
        console.error("Google Maps 스크립트 로드 오류:", error);
        window.__googleMapsScriptLoading = false;
        setError('구글 맵을 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.');
      };
      
      document.head.appendChild(script);
    };
    
    loadGoogleMapsScript();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, []);
  
  // 맵 초기화 - 의존성에 map 추가하여 한 번만 실행되도록 함
  useEffect(() => {
    if (isMapLoaded && mapRef.current && !map) {
      initMap();
    }
  }, [isMapLoaded, map]);
  
  // Place 변경 핸들러
  const handlePlaceChanged = () => {
    if (!autocompleteRef.current || !map || !marker) return;
    
    try {
      const place = autocompleteRef.current.getPlace();
      if (!place || !place.geometry || !place.geometry.location) {
        console.warn("선택된 장소에 위치 정보가 없습니다.");
        return;
      }
      
      const location = place.geometry.location;
      const lat = location.lat();
      const lng = location.lng();
      
      map.setCenter(location);
      map.setZoom(16);
      marker.setPosition(location);
      
      setLocation({
        coordinates: [lng, lat],
        address: place.formatted_address || place.name || '알 수 없는 주소'
      });
    } catch (error) {
      console.error("Place 변경 처리 오류:", error);
      setError('주소 검색 처리 중 오류가 발생했습니다.');
    }
  };
  
  // 맵 초기화 함수
  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    
    try {
      const initialLocation = location.coordinates[0] !== 0 && location.coordinates[1] !== 0
        ? { lat: location.coordinates[1], lng: location.coordinates[0] }
        : { lat: 37.5665, lng: 126.9780 }; // 서울 좌표
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: initialLocation,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
      
      const newMarker = new window.google.maps.Marker({
        position: initialLocation,
        map: newMap,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });
      
      setMap(newMap);
      setMarker(newMarker);
      
      // 마커 드래그 이벤트
      newMarker.addListener('dragend', () => {
        if (!newMarker) return;
        const position = newMarker.getPosition();
        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          geocodePosition({ lat, lng });
          setLocation(prev => ({
            ...prev,
            coordinates: [lng, lat]
          }));
        }
      });
      
      // 맵 클릭 이벤트
      newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!newMarker || !e.latLng) return;
        newMarker.setPosition(e.latLng);
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        geocodePosition({ lat, lng });
        setLocation(prev => ({
          ...prev,
          coordinates: [lng, lat]
        }));
      });
      
      // 주소 검색 자동완성 - try-catch로 오류 처리 추가
      if (searchInputRef.current) {
        try {
          // 이전 인스턴스가 있으면 이벤트 리스너 제거
          if (autocompleteRef.current) {
            google.maps.event.clearInstanceListeners(autocompleteRef.current);
          }
          
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            searchInputRef.current,
            {
              types: ['geocode', 'establishment'],
              componentRestrictions: { country: 'kr' }
            }
          );
          
          // 명시적으로 바인딩된 이벤트 등록
          google.maps.event.addListener(
            autocompleteRef.current, 
            'place_changed', 
            handlePlaceChanged
          );
        } catch (error) {
          console.error("Places API 초기화 오류:", error);
          setError('주소 검색 기능 초기화 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error("맵 초기화 오류:", error);
    }
  };
  
  // 좌표로 주소 가져오기
  const geocodePosition = (pos: { lat: number, lng: number }) => {
    if (!window.google) return;
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: pos }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setLocation(prev => ({
            ...prev,
            address: results[0].formatted_address || ''
          }));
        } else {
          console.warn("Geocoding 실패:", status);
        }
      });
    } catch (error) {
      console.error("Geocoding 오류:", error);
    }
  };
  
  // 태그 추가 함수
  const addTag = () => {
    const trimmedTag = tagsInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagsInput('');
    }
  };
  
  // 태그 제거 함수
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // 이미지 파일 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray]);
      
      // 이미지 미리보기
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            setImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  // 미리보기 이미지 제거
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newImageFiles = [...imageFiles];
    newImageFiles.splice(index, 1);
    setImageFiles(newImageFiles);
  };
  
  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // 권한 확인
    if (!session) {
      setError('로그인이 필요한 기능입니다.');
      setIsLoading(false);
      return;
    }
    
    // 유효성 검사
    if (!title || !description || !category || location.coordinates[0] === 0) {
      setError('제목, 설명, 카테고리, 위치 정보를 모두 입력해주세요.');
      setIsLoading(false);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('location', JSON.stringify(location));
      formData.append('tags', JSON.stringify(tags));
      
      // 이미지 파일 추가
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
      
      let response;
      if (editMode && problemData?._id) {
        // 문제 수정
        response = await axios.put(`/api/problems/${problemData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // 새로운 문제 등록
        response = await axios.post('/api/problems', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setSuccess(editMode ? '문제가 성공적으로 수정되었습니다.' : '문제가 성공적으로 등록되었습니다.');
      
      // 등록 완료 후 문제 상세 페이지로 이동
      setTimeout(() => {
        if (response.data && response.data.problem) {
          router.push(`/problems/${response.data.problem._id}`);
        }
      }, 1500);
    } catch (err) {
      console.error('문제 등록 오류:', err);
      setError('문제 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{editMode ? '문제 수정' : '문제 등록'}</h1>
      
      <form onSubmit={handleSubmit}>
        {/* 제목 입력 */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">제목</label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문제의 제목을 입력하세요"
            required
          />
        </div>
        
        {/* 설명 입력 */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">설명</label>
          <textarea
            id="description"
            className="w-full p-2 border rounded-md min-h-[150px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="문제에 대한 자세한 설명을 입력하세요"
            required
          />
        </div>
        
        {/* 카테고리 선택 */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium mb-1">카테고리</label>
          <select
            id="category"
            className="w-full p-2 border rounded-md"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">카테고리 선택</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {/* 위치 정보 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">위치 정보</label>
          
          {/* 주소 검색 */}
          <div className="mb-2">
            <input
              type="text"
              ref={searchInputRef}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="주소 검색"
            />
          </div>
          
          {/* 지도 */}
          <div 
            ref={mapRef} 
            className="w-full h-[300px] border rounded-md mb-2"
          ></div>
          
          {/* 선택한 위치 정보 표시 */}
          {location.address && (
            <div className="p-2 bg-gray-100 rounded-md">
              <p className="text-sm">선택한 위치: {location.address}</p>
              <p className="text-xs text-gray-500">
                좌표: {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
              </p>
            </div>
          )}
        </div>
        
        {/* 태그 입력 */}
        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium mb-1">태그</label>
          <div className="flex">
            <input
              type="text"
              id="tags"
              className="flex-1 p-2 border rounded-l-md"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="태그 입력 후 추가 버튼을 누르세요"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button 
              type="button" 
              className="rounded-l-none"
              onClick={addTag}
            >
              추가
            </Button>
          </div>
          
          {/* 태그 목록 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    className="ml-1 text-primary-800 hover:text-primary-900"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* 이미지 업로드 */}
        <div className="mb-4">
          <label htmlFor="images" className="block text-sm font-medium mb-1">이미지</label>
          <input
            type="file"
            id="images"
            className="w-full p-2 border rounded-md"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          
          {/* 이미지 미리보기 */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative w-24 h-24">
                  <Image
                    src={image}
                    alt={`미리보기 ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* 성공 메시지 */}
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {/* 제출 버튼 */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner size="small" className="mr-2" />
          ) : null}
          {editMode ? '문제 수정하기' : '문제 등록하기'}
        </Button>
      </form>
    </Card>
  );
} 