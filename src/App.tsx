import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { AuthProvider } from './lib/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { MovieDetails } from './pages/MovieDetails';
import { VideoPlayer } from './pages/VideoPlayer';
import { Profile } from './pages/Profile';
import { LiveTV } from './pages/LiveTV';
import { ContentRail } from './components/ContentRail';
import { useMovies } from './hooks/useMovies';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Search } from './pages/Search';

import { useEffect } from 'react';

const AdminRedirect = () => {
  useEffect(() => {
    window.location.href = '/admin/index.html';
  }, []);
  return null;
};

// Placeholder Pages
const Notifications = () => <div className="p-4 px-6"><div className="flex items-center justify-between mb-8"><h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">&larr; Notifications</h1><span className="text-[#F2AE01] text-sm font-bold flex items-center gap-1">&check; Mark all read</span></div><div className="flex flex-col items-center justify-center py-32 text-gray-400"><div className="w-16 h-16 rounded-full bg-[#E8EDF2] shadow-[6px_6px_12px_#c5cad0,-6px_-6px_12px_#ffffff] flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></div><p className="text-lg font-medium">No notifications yet</p></div></div>;

const Series = () => {
  const { movies, loading } = useMovies();
  const seriesItems = movies.filter((m: any) => m.type === 'webseries');
  return (
    <div className="p-4 pb-20">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#F2AE01] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {seriesItems.map((item: any) => (
            <Link to={`/details/${item.id}`} key={item.id} className="relative aspect-[2/3] rounded-xl overflow-hidden group block shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff]">
              <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              {item.year && (
                <div className="absolute top-0 right-0 bg-[#F2AE01] text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-xl rounded-tr-xl">
                  {item.year}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-2">
                <h3 className="text-white/80 font-medium text-[10px] sm:text-xs leading-tight line-clamp-2">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const Anime = () => {
  const { movies, loading } = useMovies();
  const animeItems = movies.filter((m: any) => m.type === 'anime');
  return (
    <div className="p-4 pb-20">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#F2AE01] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {animeItems.map((item: any) => (
            <Link to={`/details/${item.id}`} key={item.id} className="relative aspect-[2/3] rounded-xl overflow-hidden group block shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff]">
              <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              {item.year && (
                <div className="absolute top-0 right-0 bg-[#F2AE01] text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-xl rounded-tr-xl">
                  {item.year}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-2">
                <h3 className="text-white/80 font-medium text-[10px] sm:text-xs leading-tight line-clamp-2">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const Movies = () => {
  const { movies, loading } = useMovies();
  const movieItems = movies.filter((m: any) => m.type === 'movie');
  
  return (
    <div className="p-4 pb-20">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#F2AE01] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {movieItems.map((item: any) => (
            <Link to={`/details/${item.id}`} key={item.id} className="relative aspect-[2/3] rounded-xl overflow-hidden group block shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff]">
              <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              {item.year && (
                <div className="absolute top-0 right-0 bg-[#F2AE01] text-gray-900 text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl">
                  {item.year}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-2">
                <h3 className="text-white/80 font-medium text-[10px] sm:text-xs leading-tight line-clamp-2">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MainLayout() {
  return (
    <div className="min-h-screen pb-[80px] bg-[#E8EDF2] text-gray-800 font-sans">
      <TopBar />
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}


export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/admin" element={<AdminRedirect />} />
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<Home />} />
              <Route path="/series" element={<Series />} />
              <Route path="/anime" element={<Anime />} />
              <Route path="/livetv" element={<LiveTV />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/details/:id" element={<MovieDetails />} />
            </Route>
            {/* Video Player without MainLayout to hide TopBar/BottomNav */}
            <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
               <Route path="/play/:id" element={<VideoPlayer />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
