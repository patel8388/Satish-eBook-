import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Upload, LogOut, FileText, Trash2, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

const SUPPORTED_FORMATS = ["pdf", "epub", "txt", "docx", "html", "mobi", "azw3", "fb2"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function Library() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: booksList, isLoading, refetch } = trpc.books.list.useQuery();
  const uploadMutation = trpc.upload.uploadBook.useMutation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

    // Validation
    if (!SUPPORTED_FORMATS.includes(fileExt)) {
      toast.error(`Unsupported format: ${fileExt}. Supported: ${SUPPORTED_FORMATS.join(", ")}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Maximum size: 100MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      reader.onload = async () => {
        try {
          const base64Content = (reader.result as string).split(",")[1];

          // Extract title from filename
          const title = file.name.replace(/\.[^/.]+$/, "");

          // Upload via tRPC
          await uploadMutation.mutateAsync({
            fileName: file.name,
            fileSize: file.size,
            fileContent: base64Content,
            title: title,
            author: "Unknown",
            description: `Uploaded on ${new Date().toLocaleDateString()}`,
          });

          toast.success("Book uploaded successfully!");
          setUploadProgress(0);
          refetch(); // Refresh the books list
        } catch (error) {
          toast.error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to process file");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      e.currentTarget.value = "";
    }
  };

  const handleReadBook = (bookId: number) => {
    navigate(`/reader/${bookId}`);
  };

  const handleDownloadBook = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Satish eBook</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name || user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Library</h2>
          <p className="text-gray-600">Manage your ebook collection</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Upload Books
            </CardTitle>
            <CardDescription>
              Supported formats: PDF, EPUB, TXT, DOCX, HTML, MOBI, AZW3, FB2 (Max 100MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept={SUPPORTED_FORMATS.map((fmt) => `.${fmt}`).join(",")}
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">
                  {isUploading ? `Uploading... ${uploadProgress}%` : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-500">
                  {isUploading ? "Please wait..." : "PDF, EPUB, TXT, DOCX, HTML, MOBI, AZW3, FB2"}
                </p>
              </label>
              {isUploading && (
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Books Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Books ({booksList?.length || 0})
          </h3>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-40 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : booksList && booksList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {booksList.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {book.author || "Unknown Author"}
                        </CardDescription>
                      </div>
                      <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded whitespace-nowrap">
                        {book.format.toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {book.description || "No description available"}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      {(book.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => handleReadBook(book.id)}
                      >
                        Read
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadBook(book.fileUrl, book.title)}
                        title="Download book"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-4">No books in your library yet</p>
                <p className="text-sm text-gray-500 mb-6">
                  Upload your first book to get started
                </p>
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span>Upload a Book</span>
                  </Button>
                </label>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept={SUPPORTED_FORMATS.map((fmt) => `.${fmt}`).join(",")}
                  onChange={handleFileUpload}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
