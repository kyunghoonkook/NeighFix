import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-20">
      {/* 히어로 섹션 */}
      <section className="text-center py-20 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-3xl shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="block">NeighFix와 함께</span>
            <span className="block mt-2">지역사회 문제를 해결하세요</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            당신의 지역에서 발생하는 문제를 공유하고, 인공지능의 도움을 받아 
            효과적인 해결책을 함께 만들어 갑니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/problems"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition duration-300"
            >
              문제 둘러보기
            </Link>
            <Link
              href="/problems/new"
              className="bg-blue-800 hover:bg-blue-900 px-8 py-4 rounded-lg font-bold text-lg transition duration-300"
            >
              문제 등록하기
            </Link>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            NeighFix의 특별한 기능
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">지역 문제 공유</h3>
              <p className="text-gray-600">
                당신의 지역에서 발생하는 다양한 문제를 쉽게 등록하고 공유할 수 있습니다.
                사진과 상세 설명을 함께 올려 문제를 명확히 전달하세요.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">AI 해결책 제안</h3>
              <p className="text-gray-600">
                인공지능이 지역 문제를 분석하고 실현 가능한 해결책을 제시합니다.
                예산, 타임라인, 필요 자원 등 구체적인 실행 계획까지 함께 제공됩니다.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">커뮤니티 협업</h3>
              <p className="text-gray-600">
                주민, 지역 단체, 행정기관이 함께 해결책을 논의하고 개선할 수 있습니다.
                투표 시스템을 통해 최적의 해결책을 선정하고 실행합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 통계 섹션 */}
      <section className="py-16 rounded-3xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            지금까지의 NeighFix 성과
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-teal-600 mb-2">134+</div>
              <div className="text-gray-600">등록된 문제</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-teal-600 mb-2">856</div>
              <div className="text-gray-600">해결된 문제</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-teal-600 mb-2">15,790</div>
              <div className="text-gray-600">활동 회원</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-teal-600 mb-2">98%</div>
              <div className="text-gray-600">사용자 만족도</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 프로세스 설명 섹션 */}
      <section className="py-16  rounded-3xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            NeighFix의 문제 해결 프로세스
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* 세로선 */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-teal-200"></div>
              
              {/* 프로세스 아이템 1 */}
              <div className="mb-16 md:flex items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12 md:text-right">
                  <h3 className="text-2xl font-bold text-teal-600 mb-3">문제 등록</h3>
                  <p className="text-gray-600">
                    지역에서 발견한 문제를 상세히 설명하고 사진과 함께 등록합니다.
                    위치, 카테고리, 관련 태그를 함께 입력하면 더 정확한 분석이 가능합니다.
                  </p>
                </div>
                <div className="md:w-1/2 relative flex justify-center md:justify-start">
                  <div className="bg-teal-600 rounded-full h-10 w-10 flex items-center justify-center z-10 text-white font-bold">
                    1
                  </div>
                </div>
              </div>
              
              {/* 프로세스 아이템 2 */}
              <div className="mb-16 md:flex items-center">
                <div className="md:w-1/2 relative flex justify-center md:justify-end order-1 md:order-none">
                  <div className="bg-teal-600 rounded-full h-10 w-10 flex items-center justify-center z-10 text-white font-bold">
                    2
                  </div>
                </div>
                <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
                  <h3 className="text-2xl font-bold text-teal-600 mb-3">AI 분석 및 해결책 생성</h3>
                  <p className="text-gray-600">
                    AI가 문제를 분석하고 실현 가능한 해결책을 자동으로 생성합니다.
                    해결에 필요한 자원, 예산, 타임라인 등 구체적인 실행 계획을 제시합니다.
                  </p>
                </div>
              </div>
              
              {/* 프로세스 아이템 3 */}
              <div className="mb-16 md:flex items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12 md:text-right">
                  <h3 className="text-2xl font-bold text-teal-600 mb-3">커뮤니티 논의</h3>
                  <p className="text-gray-600">
                    AI가 제안한 해결책에 대해 지역 주민들이 의견을 나누고 개선점을 제안합니다.
                    사용자들은 해결책에 투표하고 추가 아이디어를 제시할 수 있습니다.
                  </p>
                </div>
                <div className="md:w-1/2 relative flex justify-center md:justify-start">
                  <div className="bg-teal-600 rounded-full h-10 w-10 flex items-center justify-center z-10 text-white font-bold">
                    3
                  </div>
                </div>
              </div>
              
              {/* 프로세스 아이템 4 */}
              <div className="md:flex items-center">
                <div className="md:w-1/2 relative flex justify-center md:justify-end order-1 md:order-none">
                  <div className="bg-teal-600 rounded-full h-10 w-10 flex items-center justify-center z-10 text-white font-bold">
                    4
                  </div>
                </div>
                <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
                  <h3 className="text-2xl font-bold text-teal-600 mb-3">실행 및 모니터링</h3>
                  <p className="text-gray-600">
                    채택된 해결책을 실행하고 진행 상황을 모니터링합니다.
                    문제 해결 후에는 성공 사례로 등록되어 다른 지역의 참고 자료가 됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 성공 사례 섹션 */}
      {/* <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
            성공 사례
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            NeighFix와 함께 지역 문제를 성공적으로 해결한 사례들을 살펴보세요.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">환경</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">녹지 공간 회복 프로젝트</h3>
                <p className="text-gray-600 mb-4">
                  방치된 공터를 주민들을 위한 녹지 공간으로 탈바꿈시켰습니다. 
                  AI가 제안한 해결책을 바탕으로 지역 주민들이 협력하여 2개월 만에 완성했습니다.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">서울 마포구</span>
                  <Link href="/cases/1" className="text-teal-600 hover:text-teal-800">자세히 보기 &rarr;</Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">교통</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">교차로 안전 개선 사업</h3>
                <p className="text-gray-600 mb-4">
                  사고가 빈번했던 교차로의 교통 패턴을 분석하고 새로운 신호 체계와 
                  도로 마킹을 도입하여 교통사고율을 70% 감소시켰습니다.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">부산 해운대구</span>
                  <Link href="/cases/2" className="text-teal-600 hover:text-teal-800">자세히 보기 &rarr;</Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">복지</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">노인 돌봄 네트워크 구축</h3>
                <p className="text-gray-600 mb-4">
                  독거노인을 위한 커뮤니티 돌봄 시스템을 구축했습니다. 
                  지역 봉사자들과 AI 매칭 시스템을 통해 효율적인 돌봄 서비스를 제공합니다.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">대구 수성구</span>
                  <Link href="/cases/3" className="text-teal-600 hover:text-teal-800">자세히 보기 &rarr;</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/cases" className="inline-block text-teal-600 hover:text-teal-800 font-semibold">
              모든 성공 사례 보기 &rarr;
            </Link>
          </div>
        </div>
      </section> */}
      
      {/* FAQ 섹션 */}
      {/* <section className="py-16 bg-gray-50 rounded-3xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
            자주 묻는 질문
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            NeighFix 서비스에 대한 궁금증을 해결해 드립니다.
          </p>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-3 text-gray-800">NeighFix는 어떤 서비스인가요?</h3>
              <p className="text-gray-600">
                NeighFix는 지역사회 문제를 공유하고 AI의 도움을 받아 해결책을 찾는 플랫폼입니다. 
                주민들이 직접 발견한 문제를 등록하면 AI가 분석하여 실현 가능한 해결책을 제안하고, 
                지역 주민들이 함께 논의하여 최적의 해결책을 선택하고 실행할 수 있도록 도와줍니다.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-3 text-gray-800">어떤 종류의 문제를 등록할 수 있나요?</h3>
              <p className="text-gray-600">
                환경, 교통, 안전, 복지, 문화, 교육 등 지역사회와 관련된 다양한 문제를 등록할 수 있습니다. 
                작은 골목길의 쓰레기 문제부터 지역 노인 돌봄 시스템 개선까지, 크고 작은 모든 지역 문제가 대상입니다.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-3 text-gray-800">AI는 어떻게 해결책을 제안하나요?</h3>
              <p className="text-gray-600">
                등록된 문제의 상세 내용, 위치, 카테고리 등의 정보를 AI가 분석합니다. 
                유사한 문제들의 해결 사례와 지역 특성을 고려하여 가장 효과적인 해결책을 
                예산, 필요 자원, 실행 계획 등과 함께 제안합니다.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-3 text-gray-800">해결책은 어떻게 실행되나요?</h3>
              <p className="text-gray-600">
                커뮤니티 투표를 통해 선택된 해결책은 지역 주민, 봉사자, 관련 기관이 협력하여 실행합니다. 
                NeighFix는 실행 과정을 모니터링하고 진행 상황을 공유하여 투명성을 유지합니다.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-3 text-gray-800">NeighFix 서비스는 무료인가요?</h3>
              <p className="text-gray-600">
                기본적인 문제 등록과 AI 해결책 제안, 커뮤니티 참여는 무료입니다. 
                다만, 더 심층적인 분석이나 전문가 컨설팅 등의 고급 기능은 유료로 제공될 수 있습니다.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/faq" className="inline-block text-teal-600 hover:text-teal-800 font-semibold">
              더 많은 질문 보기 &rarr;
            </Link>
          </div>
        </div>
      </section> */}
      
      {/* 뉴스레터 구독 섹션 */}
      {/* <section className="py-16 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-3xl shadow-xl">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              최신 지역 소식을 받아보세요
            </h2>
            <p className="text-xl mb-10">
              NeighFix 뉴스레터를 구독하고 지역 문제 해결 성공 사례와 새로운 기능 소식을 가장 먼저 받아보세요.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <input
                type="email"
                placeholder="이메일 주소를 입력하세요"
                className="px-6 py-4 rounded-lg text-gray-800 w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button className="bg-blue-800 hover:bg-blue-900 px-8 py-4 rounded-lg font-bold text-lg transition duration-300 w-full sm:w-auto">
                구독하기
              </button>
            </div>
            
            <p className="mt-6 text-sm text-blue-100">
              * 개인정보는 뉴스레터 발송 목적으로만 사용되며, 언제든지 구독을 취소할 수 있습니다.
            </p>
          </div>
        </div>
      </section>
       */}
      {/* CTA 섹션 */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            함께 더 나은 지역사회를 만들어요
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            지금 바로 참여하여 여러분의 지역이 직면한 문제를 공유하고,
            NeighFix와 함께 효과적인 해결책을 찾아보세요.
          </p>
          <Link
            href="/register"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition duration-300"
          >
            지금 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
