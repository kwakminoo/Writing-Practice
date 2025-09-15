import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../contexts/AuthContext";
import QueryProvider from "../providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "글쓰기 훈련소 - AI 피드백으로 글쓰기 실력 향상",
    template: "%s | 글쓰기 훈련소"
  },
  description: "소설, 시나리오, 시, 에세이 등 다양한 장르의 글쓰기를 연습하고 AI 피드백을 받아보세요. 다크모드와 모바일을 지원하는 글쓰기 연습 플랫폼입니다.",
  keywords: ["글쓰기", "소설", "시나리오", "시", "에세이", "AI 피드백", "창작", "문학", "작문"],
  authors: [{ name: "글쓰기 훈련소" }],
  creator: "글쓰기 훈련소",
  publisher: "글쓰기 훈련소",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://writingstudio.kr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://writingstudio.kr',
    title: '글쓰기 훈련소 - AI 피드백으로 글쓰기 실력 향상',
    description: '소설, 시나리오, 시, 에세이 등 다양한 장르의 글쓰기를 연습하고 AI 피드백을 받아보세요.',
    siteName: '글쓰기 훈련소',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '글쓰기 훈련소 - AI 피드백으로 글쓰기 실력 향상',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '글쓰기 훈련소 - AI 피드백으로 글쓰기 실력 향상',
    description: '소설, 시나리오, 시, 에세이 등 다양한 장르의 글쓰기를 연습하고 AI 피드백을 받아보세요.',
    images: ['/og-image.png'],
    creator: '@writingstudio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <div className="min-h-[80vh] flex flex-col">
              {children}
            </div>
            <Footer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}