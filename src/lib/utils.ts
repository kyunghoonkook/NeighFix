import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 클래스명을 조건부로 결합하는 유틸리티 함수
 * Tailwind CSS와 함께 사용할 때 클래스 충돌 방지
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 날짜를 포맷팅하는 함수
 * @param date 포맷팅할 날짜
 * @returns 포맷팅된 날짜 문자열 (예: 2023년 10월 15일)
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
} 