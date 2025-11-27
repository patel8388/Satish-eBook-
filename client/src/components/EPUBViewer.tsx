import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EPUBViewerProps {
  fileUrl: string;
  onPageChange?: (page: number, totalPages: number) => void;
  currentPage?: number;
  fontSize?: number;
  theme?: "light" | "dark" | "sepia";
}

export function EPUBViewer({
  fileUrl,
  onPageChange,
  currentPage = 1,
  fontSize = 16,
  theme = "light",
}: EPUBViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [book, setBook] = useState<any>(null);
  const [currentSpine, setCurrentSpine] = useState(0);

  useEffect(() => {
    const loadEPUB = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import of epub.js to avoid SSR issues
        const EPub = (await import("epub.js" as any)).default;
        const epubBook = new EPub(fileUrl);

        await epubBook.ready;
        setBook(epubBook);
        setTotalPages(epubBook.spine.length);

        // Render the first chapter
        if (epubBook.spine.length > 0) {
          renderChapter(epubBook, 0);
        }
      } catch (err) {
        setError("Failed to load EPUB file");
        console.error("EPUB loading error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEPUB();
  }, [fileUrl]);

  const renderChapter = async (epubBook: any, spineIndex: number) => {
    try {
      const chapter = epubBook.spine.get(spineIndex);
      if (!chapter) return;

      const container = containerRef.current;
      if (!container) return;

      // Render the chapter content
      const contents = await chapter.render();
      container.innerHTML = contents || "<p>No content available</p>";

      setCurrentSpine(spineIndex);
      onPageChange?.(spineIndex + 1, totalPages);
    } catch (err) {
      console.error("Error rendering chapter:", err);
    }
  };

  const handleNextPage = () => {
    if (currentSpine < totalPages - 1 && book) {
      renderChapter(book, currentSpine + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentSpine > 0 && book) {
      renderChapter(book, currentSpine - 1);
    }
  };

  const themeClasses = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-900 text-white",
    sepia: "bg-amber-50 text-amber-900",
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
        <p className="text-gray-600">Loading EPUB...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className={`${themeClasses[theme]} rounded-lg p-8 min-h-96 max-h-96 overflow-auto prose prose-sm`}
        style={{ fontSize: `${fontSize}px` }}
      />

      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevPage}
          disabled={currentSpine <= 0}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <span className="text-sm font-medium">
          Chapter {currentSpine + 1} of {totalPages}
        </span>

        <Button
          onClick={handleNextPage}
          disabled={currentSpine >= totalPages - 1}
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
