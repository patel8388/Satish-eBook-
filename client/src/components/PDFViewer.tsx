import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  onPageChange?: (page: number, totalPages: number) => void;
  currentPage?: number;
  fontSize?: number;
  theme?: "light" | "dark" | "sepia";
}

export function PDFViewer({
  fileUrl,
  onPageChange,
  currentPage = 1,
  fontSize = 16,
  theme = "light",
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<any>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        renderPage(pdf, currentPage);
      } catch (err) {
        setError("Failed to load PDF file");
        console.error("PDF loading error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [fileUrl]);

  const renderPage = async (pdf: any, pageNum: number) => {
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

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      onPageChange?.(pageNum, totalPages);
    } catch (err) {
      console.error("Error rendering page:", err);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && pdfRef.current) {
      renderPage(pdfRef.current, currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && pdfRef.current) {
      renderPage(pdfRef.current, currentPage - 1);
    }
  };

  const themeClasses = {
    light: "bg-white",
    dark: "bg-gray-900",
    sepia: "bg-amber-50",
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading PDF...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${themeClasses[theme]} rounded-lg p-4 flex justify-center overflow-auto max-h-96`}>
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded"
          style={{ maxWidth: "100%" }}
        />
      </div>

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
    </div>
  );
}
