'use client';

import dynamic from 'next/dynamic';
import { useReader } from "@/hooks/useReader";
const PdfViewer = dynamic(
  () => import('@/components/PdfViewer').then((mod) => mod.PdfViewer),
  { ssr: false }
);

export default function Home() {
  // カスタムフックから状態と操作関数を取り出す
  const { state, turnPage, addFinger, jumpToFinger, addPane, removePane, selectPane } = useReader();

  const activePane = state.panes.find((p) => p.id === state.activePaneId);
  const currentPage = activePane ? activePane.currentPageNumber : 1;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">FingerBookmarkへようこそ！</h1>
      {/* 1. 現在のペイン表示とページめくりボタン */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6 text-center border border-slate-700 min-w-[320px]">
        <h2 className="text-xl font-semibold mb-2">アクティブペイン:{state.activePaneId}</h2>
        <p className="text-4xl font-extrabold text-blue-400 my-4">
          {activePane ? `${currentPage} ページ` : "なし"}
        </p>

        {/* ペイン追加ボタンを配置*/}
        <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold shadow-md mb-8 transition"
          onClick={() => addPane()}>ペインを追加する</button>

        {/* PDF描画コンポーネントを横並びに配置*/}
        <div className="flex flex-row gap-4 justify-center my-4 overflow-x-auto">
          {state.panes.map((p) => (
            <div
              key={p.id} onClick={() => selectPane(p.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all
              ${p.id === state.activePaneId ? "border-4 border-blue-500 shadow-lg shadow-blue-500/30"
                  : "border border-slate-700"
                }`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); removePane(p.id); }}
                className="text-xs text-red-400 hover:text-red-300 mb-2">
                ×ペインを閉じる
              </button>
              <PdfViewer url="/sample.pdf" pageNumber={p.currentPageNumber} />
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => turnPage(-1)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold transition"
          >
            ◀ 前のページ
          </button>
          <button
            onClick={() => turnPage(1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold transition"
          >
            次のページ ▶
          </button>
        </div>
      </div>

      {/* 2. 指を挟むボタン */}
      <button
        onClick={addFinger}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold shadow-md mb-8 transition"
      >
        👉 現在のページに指を挟む
      </button>
      {/* 3. 挟んでいる指の一覧とジャンプボタン */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg min-w-[320px] border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 border-b border-slate-700 pb-2">
          挟んでいる指リスト ({state.fingers.length}個)
        </h3>
        {state.fingers.length === 0 ? (
          <p className="text-slate-400 text-sm text-center">指は挟まれていません</p>
        ) : (
          <ul className="space-y-2">
            {state.fingers.map((finger) => (
              <li
                key={finger.id}
                className="flex items-center justify-between bg-slate-700 p-3 rounded"
              >
                <span>指: {finger.pageNumber} ページ目</span>
                <button
                  onClick={() => jumpToFinger(finger.id)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 rounded text-sm font-bold transition"
                >
                  この指にジャンプ 🚀
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
