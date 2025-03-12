'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // 스크롤 이벤트 감지하여 헤더 스타일 변경
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white text-gray-800 shadow-lg' 
        : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white'
    }`}>
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className={`text-2xl font-extrabold ${scrolled ? 'text-blue-600' : 'text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className={`text-2xl font-extrabold tracking-tight leading-none ${scrolled ? 'text-blue-600' : 'text-white'}`}>
                NeighFix
              </span>
              <span className={`text-xs transform ${scrolled ? 'text-teal-600' : 'text-teal-200'}`}>
                이웃과 함께 문제 해결
              </span>
            </div>
          </Link>
          
          {/* 모바일 메뉴 토글 버튼 */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-opacity-20 hover:bg-gray-700"
            onClick={toggleMenu}
            aria-label="메뉴 토글"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          
          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/problems" scrolled={scrolled}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              문제 목록
            </NavLink>
            
            <NavLink href="/problems/new" scrolled={scrolled}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              문제 등록
            </NavLink>
            
            <NavLink href="/solutions" scrolled={scrolled}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              해결책 목록
            </NavLink>
            
            {session ? (
              <>
                <NavLink href="/profile" scrolled={scrolled}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  프로필
                </NavLink>
                <button 
                  onClick={() => signOut()}
                  className={`ml-2 flex items-center px-4 py-2 rounded-full transition-colors duration-200 ${
                    scrolled 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-800 bg-opacity-40 hover:bg-blue-800 hover:bg-opacity-60 text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <NavLink href="/login" scrolled={scrolled}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  로그인
                </NavLink>
                <Link 
                  href="/register" 
                  className={`ml-2 flex items-center px-4 py-2 rounded-full transition-colors duration-200 ${
                    scrolled 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-800 bg-opacity-40 hover:bg-blue-800 hover:bg-opacity-60 text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
        
        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <nav className={`md:hidden mt-4 pb-2 rounded-lg ${
            scrolled ? 'bg-gray-50' : 'bg-blue-800 bg-opacity-20 backdrop-blur-lg'
          }`}>
            <div className="p-3 space-y-2">
              <MobileNavLink href="/problems" scrolled={scrolled} onClick={() => setIsMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                문제 목록
              </MobileNavLink>
              
              <MobileNavLink href="/problems/new" scrolled={scrolled} onClick={() => setIsMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                문제 등록
              </MobileNavLink>
              
              <MobileNavLink href="/solutions" scrolled={scrolled} onClick={() => setIsMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                해결책 목록
              </MobileNavLink>
              
              {session ? (
                <>
                  <MobileNavLink href="/profile" scrolled={scrolled} onClick={() => setIsMenuOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    프로필
                  </MobileNavLink>
                  
                  <button 
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full p-3 rounded-md ${
                      scrolled 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-white hover:bg-blue-700 hover:bg-opacity-40'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink href="/login" scrolled={scrolled} onClick={() => setIsMenuOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    로그인
                  </MobileNavLink>
                  
                  <MobileNavLink href="/register" scrolled={scrolled} onClick={() => setIsMenuOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    회원가입
                  </MobileNavLink>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

// 네비게이션 링크 컴포넌트 (데스크탑)
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  scrolled: boolean;
}

function NavLink({ href, children, scrolled }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
        scrolled 
          ? 'hover:bg-gray-100 text-gray-700 hover:text-blue-600' 
          : 'hover:bg-blue-700 hover:bg-opacity-30 text-white'
      }`}
    >
      {children}
    </Link>
  );
}

// 네비게이션 링크 컴포넌트 (모바일)
interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  scrolled: boolean;
  onClick: () => void;
}

function MobileNavLink({ href, children, scrolled, onClick }: MobileNavLinkProps) {
  return (
    <Link 
      href={href} 
      className={`flex items-center p-3 rounded-md ${
        scrolled 
          ? 'hover:bg-gray-100 text-gray-700' 
          : 'text-white hover:bg-blue-700 hover:bg-opacity-40'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
} 