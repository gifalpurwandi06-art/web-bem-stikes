"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface FileReviewViewerProps {
  fileDataUrl: string;
  fileName: string;
  isImage: boolean;
  isAdmin: boolean;
  annotations: Record<number, string>;
  brushColor: string;
  brushSize: number;
  onAnnotationChange: (pageNumber: number, dataUrl: string) => void;
  onBrushColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onClear: () => void;
}

interface AnnotationCanvasProps {
  pageNumber: number;
  width: number;
  height: number;
  dataUrl?: string;
  isDrawing: boolean;
  brushColor: string;
  brushSize: number;
  onChange: (pageNumber: number, dataUrl: string) => void;
}

function AnnotationCanvas({
  pageNumber,
  width,
  height,
  dataUrl,
  isDrawing,
  brushColor,
  brushSize,
  onChange,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    context.lineCap = "round";
    context.lineJoin = "round";
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (dataUrl) {
      const image = new window.Image();
      image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = dataUrl;
    }
  }, [dataUrl, height, width]);

  const getPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;

    const position = getPosition(event);
    context.fillStyle = brushColor;
    context.beginPath();
    context.arc(position.x, position.y, brushSize / 2, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(position.x, position.y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;

    const position = getPosition(event);
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineTo(position.x, position.y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(pageNumber, canvas.toDataURL());
  };

  return (
    <canvas
      ref={canvasRef}
      aria-label={`Coretan koreksi halaman ${pageNumber}`}
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerCancel={stopDrawing}
      className={`absolute inset-0 h-full w-full touch-none ${isDrawing ? "cursor-crosshair" : "pointer-events-none"}`}
    />
  );
}

export default function FileReviewViewer({
  fileDataUrl,
  fileName,
  isImage,
  isAdmin,
  annotations,
  brushColor,
  brushSize,
  onAnnotationChange,
  onBrushColorChange,
  onBrushSizeChange,
  onClear,
}: FileReviewViewerProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(720);
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pageRatios, setPageRatios] = useState<Record<number, number>>({});
  const [imageRatio, setImageRatio] = useState(1);
  const [drawMode, setDrawMode] = useState(false);
  const pageWidth = Math.round(Math.max(280, Math.min(viewportWidth - 32, 760)) * zoom);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(([entry]) => {
      setViewportWidth(entry.contentRect.width);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const handleAnnotationChange = (pageNumber: number, dataUrl: string) => {
    onAnnotationChange(pageNumber, dataUrl);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-300 bg-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-white px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((current) => Math.max(0.5, Math.round((current - 0.2) * 10) / 10))}
            disabled={zoom <= 0.5}
            aria-label="Perkecil pratinjau"
            className="h-8 w-8 rounded border border-slate-300 text-lg font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            −
          </button>
          <span className="w-12 text-center text-xs font-semibold text-slate-600">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.min(2.5, Math.round((current + 0.2) * 10) / 10))}
            disabled={zoom >= 2.5}
            aria-label="Perbesar pratinjau"
            className="h-8 w-8 rounded border border-slate-300 text-lg font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            +
          </button>
          <span className="ml-1 max-w-40 truncate text-[11px] text-slate-500" title={fileName}>{fileName}</span>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-slate-300 p-0.5" aria-label="Mode pratinjau">
              <button
                type="button"
                onClick={() => setDrawMode(false)}
                aria-pressed={!drawMode}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${!drawMode ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                Lihat
              </button>
              <button
                type="button"
                onClick={() => setDrawMode(true)}
                aria-pressed={drawMode}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${drawMode ? "bg-red-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                Kuas
              </button>
            </div>
            <button type="button" onClick={() => onBrushColorChange("#ef4444")} aria-label="Kuas merah" title="Kuas merah" className={`h-6 w-6 rounded-full border-2 bg-red-500 ${brushColor === "#ef4444" ? "border-slate-900" : "border-white"}`} />
            <button type="button" onClick={() => onBrushColorChange("#2563eb")} aria-label="Kuas biru" title="Kuas biru" className={`h-6 w-6 rounded-full border-2 bg-blue-600 ${brushColor === "#2563eb" ? "border-slate-900" : "border-white"}`} />
            <label className="flex items-center gap-1.5 text-[10px] text-slate-500" title="Ukuran kuas">
              <span>Kuas</span>
              <input type="range" min="2" max="12" value={brushSize} onChange={(event) => onBrushSizeChange(Number(event.target.value))} className="w-14 accent-slate-700" />
            </label>
            <button type="button" onClick={onClear} className="rounded border border-slate-300 px-2 py-1.5 text-[10px] font-semibold text-slate-600 hover:border-red-300 hover:text-red-600">
              Hapus coretan
            </button>
          </div>
        )}
      </div>

      <div ref={viewportRef} className="max-h-[70vh] min-h-[420px] overflow-auto overscroll-contain p-4">
        {isImage ? (
          <div className="flex min-w-max justify-center">
            <div className="relative shrink-0 bg-white shadow-md" style={{ width: pageWidth, height: pageWidth * imageRatio }}>
              <Image
                src={fileDataUrl}
                alt={`File kiriman ${fileName}`}
                width={pageWidth}
                height={Math.max(1, Math.round(pageWidth * imageRatio))}
                unoptimized
                onLoad={(event) => {
                  const image = event.currentTarget;
                  if (image.naturalWidth) setImageRatio(image.naturalHeight / image.naturalWidth);
                }}
                className="h-full w-full object-contain"
              />
              <AnnotationCanvas
                pageNumber={1}
                width={pageWidth}
                height={pageWidth * imageRatio}
                dataUrl={annotations[1]}
                isDrawing={isAdmin && drawMode}
                brushColor={brushColor}
                brushSize={brushSize}
                onChange={handleAnnotationChange}
              />
            </div>
          </div>
        ) : (
          <Document
            file={fileDataUrl}
            onLoadSuccess={({ numPages: pageCount }) => setNumPages(pageCount)}
            loading={<p className="py-12 text-center text-xs text-slate-500">Memuat dokumen PDF…</p>}
            error={<p className="py-12 text-center text-xs text-red-600">PDF tidak dapat dibuka. Gunakan tombol buka file untuk mencoba lagi.</p>}
            className="flex min-w-max flex-col items-center gap-5"
          >
            {Array.from({ length: numPages }, (_, index) => {
              const pageNumber = index + 1;
              const ratio = pageRatios[pageNumber] || 1.414;
              const pageHeight = pageWidth * ratio;

              return (
                <div key={pageNumber} className="relative shrink-0 bg-white shadow-md" style={{ width: pageWidth, height: pageHeight }}>
                  <Page
                    pageNumber={pageNumber}
                    width={pageWidth}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    onLoadSuccess={(page) => {
                      const viewport = page.getViewport({ scale: 1 });
                      setPageRatios((current) => ({ ...current, [pageNumber]: viewport.height / viewport.width }));
                    }}
                    loading={<div className="flex h-full items-center justify-center text-xs text-slate-400">Memuat halaman {pageNumber}…</div>}
                    error={<div className="p-6 text-xs text-red-600">Halaman {pageNumber} gagal dimuat.</div>}
                  />
                  <AnnotationCanvas
                    pageNumber={pageNumber}
                    width={pageWidth}
                    height={pageHeight}
                    dataUrl={annotations[pageNumber]}
                    isDrawing={isAdmin && drawMode}
                    brushColor={brushColor}
                    brushSize={brushSize}
                    onChange={handleAnnotationChange}
                  />
                </div>
              );
            })}
          </Document>
        )}
      </div>
      {!isImage && numPages > 0 && (
        <div className="border-t border-slate-300 bg-white px-3 py-2 text-center text-[10px] text-slate-500">
          {numPages} halaman · gulir untuk melihat seluruh dokumen
        </div>
      )}
    </section>
  );
}