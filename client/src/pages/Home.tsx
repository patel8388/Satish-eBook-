import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Cloud, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/library");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <BookOpen className="w-12 h-12 text-indigo-600" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Satish eBook</h2>
            <p className="text-gray-600">Your personal digital library</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Read Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Access your collection of PDF and EPUB books
                </p>
                <Button onClick={() => navigate("/library")} className="w-full">
                  Go to Library
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-indigo-600" />
                  Cloud Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Upload and manage your books from Terabox
                </p>
                <Button variant="outline" className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Reading Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Track your reading progress and bookmarks
                </p>
                <Button variant="outline" className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BookOpen className="w-16 h-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Satish eBook</h1>
          <p className="text-lg text-gray-600">Your Personal Digital Library</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to access your ebook collection and start reading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href={getLoginUrl()}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Sign In with Google
              </Button>
            </a>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Sign In with Terabox
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-indigo-600">✓</span>
              Read PDF and EPUB files
            </li>
            <li className="flex items-center gap-2">
              <span className="text-indigo-600">✓</span>
              Track reading progress
            </li>
            <li className="flex items-center gap-2">
              <span className="text-indigo-600">✓</span>
              Create bookmarks and highlights
            </li>
            <li className="flex items-center gap-2">
              <span className="text-indigo-600">✓</span>
              Sync with Terabox cloud storage
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
