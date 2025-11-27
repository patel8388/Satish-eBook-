import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { BookOpen, ChevronLeft, ChevronRight, Settings, Bookmark, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Reader() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [bookId, setBookId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("light");
  const [showSettings, setShowSettings] = useState(false);

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

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleBookmark = () => {
    toast.success("Bookmark added!");
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
      <nav className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-sm`}>
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className={`${themeClasses[theme]} p-8 min-h-96 mb-8`}>
          <div style={{ fontSize: `${fontSize}px`, lineHeight: "1.8" }}>
            <p className="text-center text-gray-500 mb-8">
              📖 Reader Preview - Page {currentPage + 1}
            </p>
            <p className="leading-relaxed">
              This is where the PDF or EPUB content would be displayed. The reader would render
              the actual book content here with support for text selection, highlighting, and
              annotations. The current implementation shows the reading interface structure.
            </p>
            <p className="mt-4 leading-relaxed">
              Reading progress: {progress ? `${progress.percentRead}%` : "0%"}
            </p>
            {bookmarks && bookmarks.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-bold mb-4">Bookmarks ({bookmarks.length})</h3>
                <ul className="space-y-2">
                  {bookmarks.map((bm) => (
                    <li key={bm.id} className="text-sm">
                      <span className="font-medium">Page {bm.page}:</span> {bm.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-center">
            <p className="font-medium">
              Page {currentPage + 1}
            </p>
            <Slider
              value={[currentPage]}
              onValueChange={(value) => setCurrentPage(value[0])}
              min={0}
              max={100}
              step={1}
              className="w-64"
            />
          </div>

          <Button
            onClick={handleNextPage}
            variant="outline"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
