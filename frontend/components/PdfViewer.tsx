'use client';

import { useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';

// 1. Worker（別スレッドのデコーダ）の読み込み設定
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PdfViewerProps {
    url: string;
    pageNumber: number;
    scale?: number;
}

export function PdfViewer({ url, pageNumber, scale = 1.0 }: PdfViewerProps) {
    // Canvas DOM への参照（ポインタ）
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let isCancelled = false;

        const renderPdf = async () => {
            try {
                // 2. PDFドキュメントへの読み込み
                const loadingTask = pdfjs.getDocument({ url });
                const pdfDoc = await loadingTask.promise;
                if (isCancelled) return;

                // 3. 指定ページの取得
                const page = await pdfDoc.getPage(pageNumber);
                if (isCancelled) return;

                // 4. キャンバスとビューポートのサイズ合わせ
                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // 5. canvas へのラスタライズ描画実行
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas,
                };

                await page.render(renderContext).promise;
            } catch (error) {
                console.error('PDF描画エラー:', error);
            }
        };

        renderPdf();

        return () => {
            isCancelled = true;
        };
    }, [url, pageNumber, scale]);

    return (
        <div className="flex justify-center items-center overflow-auto border border-slate-700 rounded-lg p-2 bg-slate-900">
            <canvas ref={canvasRef} className="shadow-2xl max-w-full h-auto" />
        </div>
    );
}
