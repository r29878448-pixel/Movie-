import { Bell, Search, User, LogOut, Settings, PlayCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export function TopBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchClick();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-[60] px-4 py-3 bg-[#E8EDF2] flex items-center gap-3 pointer-events-auto">
      <Link to="/" className="shrink-0 relative">
        <div className="w-10 h-10 rounded-xl bg-[#0c0c1e] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.2)] overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#F2AE01] fill-[#F2AE01]/20"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            <span className="text-[4px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mt-0.5 leading-none tracking-wider">NEXTGEN</span>
            <span className="text-[3px] font-bold text-[#F2AE01] tracking-widest leading-none mt-0.5">CINEMA</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/20 blur-md"></div>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#E8EDF2] rounded-full"></div>
      </Link>
      
      <form onSubmit={handleSearchSubmit} className="flex-1 h-10 bg-[#E8EDF2] shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] rounded-full flex items-center px-4 transition-colors focus-within:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff]">
        <Search size={18} className="shrink-0 text-gray-400" onClick={handleSearchClick} />
        <input 
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="ml-2 w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 font-medium"
        />
      </form>
      
      <div className="flex items-center gap-3 shrink-0 relative">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-10 h-10 rounded-full bg-[#E8EDF2] flex items-center justify-center transition-all relative ${showNotifications ? 'shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff] text-[#F2AE01]' : 'shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] text-gray-500 hover:text-gray-700'}`}
          >
            <Bell size={18} />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#e50914] rounded-full border border-[#E8EDF2]"></div>
          </button>
          
          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-[#E8EDF2] rounded-2xl shadow-[10px_10px_20px_#c5cad0,-10px_-10px_20px_#ffffff] p-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <span className="text-xs text-[#F2AE01] font-bold cursor-pointer">Mark all read</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-[#E8EDF2] shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff] rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F2AE01] flex items-center justify-center shrink-0 text-white">
                    <PlayCircle size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium leading-tight">New Episode Available!</p>
                    <p className="text-xs text-gray-500 mt-1">Stranger Things Season 5 Episode 1 is now streaming.</p>
                  </div>
                </div>
                <div className="p-3 bg-[#E8EDF2] shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 text-white">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium leading-tight">Welcome to NextGen Cinema</p>
                    <p className="text-xs text-gray-500 mt-1">Complete your profile to get personalized recommendations.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              if (!user) navigate('/login');
              else setShowProfileMenu(!showProfileMenu);
            }}
            className={`w-10 h-10 rounded-full transition-all flex items-center justify-center shadow-[0_4px_10px_rgba(242,174,1,0.4)] ${showProfileMenu ? 'bg-[#f3b519]' : 'bg-[#F2AE01]'}`}
          >
            {user && user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover p-0.5 bg-white" />
            ) : (
              <User size={18} className="text-gray-900" />
            )}
          </button>
          
          {showProfileMenu && user && (
            <div className="absolute top-full right-0 mt-3 w-60 bg-[#E8EDF2] rounded-2xl shadow-[10px_10px_20px_#c5cad0,-10px_-10px_20px_#ffffff] p-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="p-3 border-b border-gray-200/50 mb-2">
                <p className="font-bold text-gray-800 truncate">{user.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#E8EDF2] hover:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff] transition-all text-sm font-medium text-gray-700">
                <User size={16} className="text-gray-500" />
                My Profile
              </Link>
              <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#E8EDF2] hover:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff] transition-all text-sm font-medium text-gray-700">
                <Settings size={16} className="text-gray-500" />
                Settings
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#E8EDF2] hover:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff] transition-all text-sm font-medium text-[#e50914] mt-1">
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
