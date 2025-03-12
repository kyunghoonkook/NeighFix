import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/SessionProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeighFix - 이웃과 함께 문제 해결",
  description: "인공지능 기술을 활용하여 지역사회 문제를 해결하는 플랫폼입니다.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  
  // API 키가 유효한지 확인
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isValidApiKey = apiKey && 
                         apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && 
                         apiKey !== '발급받은_Google_Maps_API_키를_여기에_입력';
  
  return (
    <html lang="ko">
      <head>
        {isValidApiKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`}
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 pt-24 pb-8">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
