"use client";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Home() {
	const { user } = useAuth();

	// 임시 더미 데이터 (후에 Supabase 연동 가능)
	const featuredContests = [
		{
			id: "c1",
			title: "1948년, 시간을 건너는 편지쓰기 공모전",
			sponsor: "",
			deadline: "2025-09-30",
			link: "/contests",
			badge: "D-30",
			image: "/곰오전 3.png",
		},
		{
			id: "c2",
			title: "KB 창작동화제 작품 공모전",
			sponsor: "",
			deadline: "2025-10-15",
			link: "/contests",
			badge: "접수중",
			image: "/공모전 1.png",
		},
		{
			id: "c3",
			title: "2026 상상인 신춘문예 공모",
			sponsor: "",
			deadline: "2025-11-05",
			link: "/contests",
			badge: "신규",
			image: "/rhdahwjs 2.png",
		},
	];

	const moreContests = [
		{ id: "m1", title: "에세이 공모전-가을", sponsor: "문학의집", deadline: "2025-09-20" },
		{ id: "m2", title: "시(詩) 콘테스트", sponsor: "시인협회", deadline: "2025-09-25" },
		{ id: "m3", title: "장편소설 기획전", sponsor: "문예출판사", deadline: "2025-10-10" },
		{ id: "m4", title: "시나리오 페스티벌", sponsor: "영상진흥원", deadline: "2025-10-12" },
		{ id: "m5", title: "수필 신춘문예", sponsor: "도시문화재단", deadline: "2025-10-20" },
		{ id: "m6", title: "단편 공포소설전", sponsor: "호러문학회", deadline: "2025-10-31" },
		{ id: "m7", title: "판타지 웹소설 공모", sponsor: "플랫폼A", deadline: "2025-11-02" },
		{ id: "m8", title: "로맨스 단편전", sponsor: "플랫폼B", deadline: "2025-11-10" },
		{ id: "m9", title: "SF 단편선 공개 모집", sponsor: "SF협회", deadline: "2025-11-15" },
		{ id: "m10", title: "청년문학상", sponsor: "문화재단", deadline: "2025-11-30" },
	];

	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* 상단: 공모전 히어로 슬라이더 */}
			<section className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur">
				<div className="mx-auto max-w-7xl px-4 py-10">
					<HeroSlider items={featuredContests} />
				</div>
			</section>

			{/* 메인: 기존 히어로 및 액션 */}
			<main className="flex flex-col items-center justify-center py-12 px-4">
				<h1 className="text-4xl sm:text-5xl font-bold mb-4 text-center text-gray-900 dark:text-white">글쓰기 훈련소</h1>
				{user ? (
					<>
						<p className="text-lg sm:text-xl text-center text-gray-700 dark:text-gray-300 mb-8 max-w-xl">
							안녕하세요, {user.name || user.email}님!<br />
							오늘도 멋진 글을 써보세요.
						</p>
						<div className="flex gap-4 mb-8">
							<Link href="/practice-modes" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-8 py-3 transition-colors shadow-lg">
								연습 시작하기
							</Link>
							<Link href="/profile" className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg px-8 py-3 transition-colors shadow-lg">
								프로필 보기
							</Link>
						</div>
					</>
				) : (
					<>
						<p className="text-lg sm:text-xl text-center text-gray-700 dark:text-gray-300 mb-8 max-w-xl">
							다양한 장르의 글쓰기를 연습하고, AI 피드백을 받아보세요.<br />
							소설, 시나리오, 시, 에세이 등 원하는 방식으로 자유롭게 글을 써보세요.
						</p>
						<div className="flex gap-4 mb-8">
							<Link href="/practice-modes" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-8 py-3 transition-colors shadow-lg">
								연습 시작하기
							</Link>
							<Link href="/login" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-8 py-3 transition-colors shadow-lg">
								로그인/회원가입
							</Link>
						</div>
					</>
				)}
				<div className="flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
					<span>AI 피드백, 다크모드, 모바일 지원</span>
				</div>
			</main>

			{/* 하단: 더 많은 공모전 (게시판 스타일) */}
			<section className="w-full pb-12 px-4">
				<div className="mx-auto max-w-7xl">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white">더 많은 공모전</h2>
						<Link href="/contests" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">전체 보기</Link>
					</div>
					<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
						<ul className="divide-y divide-gray-200 dark:divide-gray-700">
							{moreContests.map((m) => (
								<li key={m.id} className="flex items-center justify-between px-4 py-3">
									<div className="min-w-0">
										<p className="truncate font-medium text-gray-900 dark:text-white">{m.title}</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">{m.sponsor} · 마감 {m.deadline}</p>
									</div>
									<Link href="/contests" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">자세히</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>
		</div>
	);
}

type HeroItem = {
	id: string;
	title: string;
	sponsor: string;
	deadline: string;
	link: string;
	badge: string;
	image: string;
};

function HeroSlider({ items }: { items: HeroItem[] }) {
	const [index, setIndex] = useState(0);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const next = () => setIndex((i) => (i + 1) % items.length);
	const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

	useEffect(() => {
		if (timerRef.current) clearInterval(timerRef.current);
		timerRef.current = setInterval(() => {
			next();
		}, 4000);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [items.length]);

	return (
		<div className="relative">
			<div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
				<div
					className="whitespace-nowrap transition-transform duration-700 ease-out"
					style={{ transform: `translateX(-${index * 100}%)` }}
				>
					{items.map((c) => (
						<div key={c.id} className="inline-block align-top w-full">
							<Link href={c.link} className="block">
								<div className="relative h-[200px] sm:h-[260px] md:h-[320px] lg:h-[380px] w-full overflow-hidden">
									<div className="absolute inset-0">
										{(() => {
											let src = c.image || "";
											src = src.replace(/^\/?public\//i, "/");
											if (src && !src.startsWith("/")) src = "/" + src;
											return (
												<Image src={src} alt="contest" fill priority className="object-cover" />
											);
										})()}
									</div>
									<div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
									<div className="relative h-full w-full flex items-center">
										<div className="mx-auto w-full max-w-5xl px-6 flex items-center gap-6">
											<div className="flex-1 text-white">
												<div className="flex items-center gap-3 mb-2">
													<span className="inline-flex items-center rounded-full bg-white/20 text-white text-xs font-medium px-2 py-1">{c.badge}</span>
													<span className="text-xs opacity-90">마감 {c.deadline}</span>
												</div>
												<h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-sm">{c.title}</h3>
												<p className="text-sm sm:text-base opacity-90">{c.sponsor}</p>
											</div>
											{/* CTA 버튼 제거 */}
										</div>
									</div>
								</div>
							</Link>
						</div>
					))}
				</div>
			</div>
			{/* Controls */}
			<button
				onClick={prev}
				className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 p-2 shadow hover:bg-white dark:hover:bg-gray-800"
				aria-label="이전"
			>
				<span className="sr-only">이전</span>
				{/* simple chevron */}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
			</button>
			<button
				onClick={next}
				className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 p-2 shadow hover:bg-white dark:hover:bg-gray-800"
				aria-label="다음"
			>
				<span className="sr-only">다음</span>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
			</button>
			{/* Indicators */}
			<div className="flex items-center justify-center gap-2 mt-3">
				{items.map((_, i) => (
					<button
						key={i}
						onClick={() => setIndex(i)}
						className={`h-2 rounded-full transition-all ${index === i ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
						aria-label={`슬라이드 ${i + 1}`}
					/>
				))}
			</div>
		</div>
	);
}