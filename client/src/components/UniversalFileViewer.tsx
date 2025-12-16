import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface UniversalFileViewerProps {
  fileUrl: string;
  fileName: string;
  fileFormat: string;
  fontSize?: number;
  theme?: "light" | "dark" | "sepia";
  onPageChange?: (page: number, totalPages: number) => void;
}

export function UniversalFileViewer({
  fileUrl,
  fileName,
  fileFormat,
  fontSize = 16,
  theme = "light",
  onPageChange,
}: UniversalFileViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [content, setContent] = useState<string>("");
  const readerRef = useRef<any>(null);
  const pdfRef = useRef<any>(null);

  const themeClasses = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-900 text-white",
    sepia: "bg-amber-50 text-amber-900",
  };

  useEffect(() => {
    loadFile();
  }, [fileUrl, fileFormat]);

  const loadFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const format = fileFormat.toLowerCase();

      switch (format) {
        case "pdf":
          await loadPDF();
          break;
        case "epub":
          await loadEPUB();
          break;
        case "txt":
          await loadTXT();
          break;
        case "docx":
          await loadDOCX();
          break;
        case "html":
          await loadHTML();
          break;
        default:
          await loadPlainText();
      }
    } catch (err) {
      setError(`Failed to load ${fileFormat.toUpperCase()} file: ${err instanceof Error ? err.message : "Unknown error"}`);
      console.error("File loading error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPDF = async () => {
    const pdf = await pdfjsLib.getDocument(fileUrl).promise;
    pdfRef.current = pdf;
    setTotalPages(pdf.numPages);
    await renderPDFPage(pdf, 1);
  };

  const renderPDFPage = async (pdf: any, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      setCurrentPage(pageNum);
      onPageChange?.(pageNum, pdf.numPages);
    } catch (err) {
      console.error("Error rendering PDF page:", err);
    }
  };

  const loadEPUB = async () => {
    try {
      const EPub = (await import("epubjs")).default;
      const book = EPub(fileUrl);
      readerRef.current = book;
      await book.ready;
      const spineLength = (book.spine as any).length || 1;
      setTotalPages(spineLength);
      await renderEPUBChapter(book, 0);
    } catch (err) {
      console.error("EPUB loading error:", err);
      setError("Failed to load EPUB file");
    }
  };

  const renderEPUBChapter = async (book: any, spineIndex: number) => {
    try {
      const chapter = book.spine.get(spineIndex);
      if (!chapter) return;

      const html = await chapter.render();
      setContent(html || "<p>No content available</p>");
      setCurrentPage(spineIndex + 1);
      onPageChange?.(spineIndex + 1, book.spine.length);
    } catch (err) {
      console.error("Error rendering EPUB chapter:", err);
    }
  };

  const loadTXT = async () => {
    const response = await fetch(fileUrl);
    const text = await response.text();
    const lines = text.split("\n");
    const pageSize = 30;
    const pages = Math.ceil(lines.length / pageSize);
    setTotalPages(pages);
    setContent(`<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: monospace;">${escapeHtml(text)}</pre>`);
    setCurrentPage(1);
    onPageChange?.(1, pages);
  };

  const loadDOCX = async () => {
    try {
      setContent("<div style='padding: 20px; text-align: center;'><p>DOCX files are best viewed in their native format.</p><p>Please download the file to view it properly in Microsoft Word or compatible applications.</p></div>");
      setTotalPages(1);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error loading DOCX:", err);
      setContent("<p>Unable to preview DOCX file. Please download to view.</p>");
    }
  };

  const loadHTML = async () => {
    const response = await fetch(fileUrl);
    const html = await response.text();
    setContent(html);
    setTotalPages(1);
    setCurrentPage(1);
  };

  const loadPlainText = async () => {
    const response = await fetch(fileUrl);
    const text = await response.text();
    setContent(`<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: monospace;">${escapeHtml(text)}</pre>`);
    setTotalPages(1);
    setCurrentPage(1);
  };

  const escapeHtml = (text: string) => {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const handleNextPage = async () => {
    const format = fileFormat.toLowerCase();
    if (format === "pdf" && pdfRef.current && currentPage < totalPages) {
      await renderPDFPage(pdfRef.current, currentPage + 1);
    } else if (format === "epub" && readerRef.current && currentPage < totalPages) {
      await renderEPUBChapter(readerRef.current, currentPage);
    }
  };

  const handlePrevPage = async () => {
    const format = fileFormat.toLowerCase();
    if (format === "pdf" && pdfRef.current && currentPage > 1) {
      await renderPDFPage(pdfRef.current, currentPage - 1);
    } else if (format === "epub" && readerRef.current && currentPage > 1) {
      await renderEPUBChapter(readerRef.current, currentPage - 2);
    }
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <p className="text-sm text-gray-600">
          Supported formats: PDF, EPUB, TXT, DOCX, HTML
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin inline-block mb-4">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
        </div>
        <p className="text-gray-600">Loading {fileFormat.toUpperCase()} file...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Content Display */}
      {fileFormat.toLowerCase() === "pdf" ? (
        <div className={`${themeClasses[theme]} rounded-lg p-4 flex justify-center overflow-auto max-h-96`}>
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded"
            style={{ maxWidth: "100%" }}
          />
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`${themeClasses[theme]} rounded-lg p-8 min-h-96 max-h-96 overflow-auto prose prose-sm`}
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          variant="outline"
          size="sm"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* File Info */}
      <div className="text-xs text-gray-500 text-center">
        <p>{fileName} • {fileFormat.toUpperCase()}</p>
      </div>
    </div>
  );
}
