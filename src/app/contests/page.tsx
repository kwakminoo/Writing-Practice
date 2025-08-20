"use client";
import Link from "next/link";

export default function ContestsPage() {
	const contests = [
		{ id: "c1", title: "2025 단편소설 공모전", sponsor: "한국문학진흥원", deadline: "2025-09-30", status: "접수중" },
		{ id: "c2", title: "청소년 문학상 수필 부문", sponsor: "청소년문화재단", deadline: "2025-10-15", status: "접수중" },
		{ id: "c3", title: "웹소설 신인상", sponsor: "K-스토리 컴퍼니", deadline: "2025-11-05", status: "신규" },
		{ id: "c4", title: "시(詩) 콘테스트", sponsor: "시인협회", deadline: "2025-09-25", status: "접수중" },
		{ id: "c5", title: "장편소설 기획전", sponsor: "문예출판사", deadline: "2025-10-10", status: "예정" },
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
			<div className="mx-auto max-w-5xl">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">공모전 목록</h1>
					<Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">홈으로</Link>
				</div>
				<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-300">
							<tr>
								<th className="px-4 py-3 text-left font-semibold">공모명</th>
								<th className="px-4 py-3 text-left font-semibold">주최</th>
								<th className="px-4 py-3 text-left font-semibold">마감일</th>
								<th className="px-4 py-3 text-left font-semibold">상태</th>
								<th className="px-4 py-3"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
							{contests.map((c) => (
								<tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
									<td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.title}</td>
									<td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.sponsor}</td>
									<td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.deadline}</td>
									<td className="px-4 py-3">
										<span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 text-xs font-medium px-2 py-1">{c.status}</span>
									</td>
									<td className="px-4 py-3 text-right">
										<Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">자세히</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}




