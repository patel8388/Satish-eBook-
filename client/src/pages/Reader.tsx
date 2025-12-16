import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { BookOpen, ChevronLeft, Settings, Bookmark, LogOut, Download } from "lucide-react";
import { UniversalFileViewer } from "@/components/UniversalFileViewer";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Reader() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [bookId, setBookId] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("light");
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Extract bookId from URL
  useEffect(() => {
    const path = window.location.pathname;
    const id = parseInt(path.split("/").pop() || "0");
    if (id) setBookId(id);
  }, []);

  const { data: book, isLoading: bookLoading } = trpc.books.getById.useQuery(
    { id: bookId || 0 },
    { enabled: !!bookId }
  );

  const { data: progress } = trpc.readingProgress.get.useQuery(
    { bookId: bookId || 0 },
    { enabled: !!bookId }
  );

  const { data: bookmarks } = trpc.bookmarks.list.useQuery(
    { bookId: bookId || 0 },
    { enabled: !!bookId }
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleBookmark = () => {
    toast.success("Bookmark added at page " + currentPage);
  };

  const handleDownload = () => {
    if (book) {
      const link = document.createElement("a");
      link.href = book.fileUrl;
      link.download = book.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handlePageChange = (page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
  };

  if (!user) {
    navigate("/");
    return null;
  }

  if (bookLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <BookOpen className="w-12 h-12 text-indigo-600" />
          </div>
          <p className="text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Book not found</p>
          <Button onClick={() => navigate("/library")}>Back to Library</Button>
        </Card>
      </div>
    );
  }

  const themeClasses = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-900 text-white",
    sepia: "bg-amber-50 text-amber-900",
  };

  return (
    <div className={`min-h-screen ${themeClasses[theme]}`}>
      {/* Header */}
      <nav className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/library")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">{book.title}</h1>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {book.author || "Unknown Author"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              title="Add bookmark"
            >
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              title="Download book"
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"} border-b p-4`}>
          <div className="max-w-7xl mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Font Size: {fontSize}px</label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="flex gap-2">
                {(["light", "dark", "sepia"] as const).map((t) => (
                  <Button
                    key={t}
                    variant={theme === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme(t)}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <UniversalFileViewer
          fileUrl={book.fileUrl}
          fileName={book.title}
          fileFormat={book.format}
          fontSize={fontSize}
          theme={theme}
          onPageChange={handlePageChange}
        />

        {/* Reading Progress & Bookmarks */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {progress && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Reading Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${progress.percentRead}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{progress.percentRead}% complete</p>
            </Card>
          )}

          {bookmarks && bookmarks.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Bookmarks ({bookmarks.length})</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {bookmarks.map((bm) => (
                  <p key={bm.id} className="text-sm">
                    <span className="font-medium">Page {bm.page}:</span> {bm.text}
                  </p>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
