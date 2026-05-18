import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Film, Mail, Lock, User as UserIcon } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, rtdb } from '../lib/firebase';
import { ref, set } from 'firebase/database';

export function AuthPage() {
  const { user, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(rtdb, `users/${newUser.uid}`), {
          id: newUser.uid,
          email: newUser.email,
          name: username || newUser.email?.split('@')[0],
          membershipType: 'free',
          photoURL: '',
          createdAt: Date.now(),
          isVerified: false
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#E8EDF2]">
      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-500 bg-[#E8EDF2] rounded-[32px] shadow-[10px_10px_20px_#c5cad0,-10px_-10px_20px_#ffffff]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-[16px] bg-[#0c0c1e] flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.3)] mb-4 overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-1">
              <Film className="w-6 h-6 text-brand-gold fill-brand-gold/20" />
              <span className="text-[6px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-wider mt-0.5">NEXTGEN</span>
              <span className="text-[4px] font-bold text-brand-gold tracking-widest mt-0.5">CINEMA</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/20 blur-md"></div>
          </div>
          <h1 className="text-2xl font-black tracking-widest text-brand-gold">
            NX CINEMA
          </h1>
          <p className="text-gray-500 text-xs mt-1.5 tracking-wide uppercase font-medium">Premium Movie Streaming</p>
        </div>

        <div className="flex bg-[#E8EDF2] shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] rounded-2xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
              isLogin ? 'bg-[#F2AE01] text-white shadow-[0_4px_10px_rgba(242,174,1,0.4)]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
              !isLogin ? 'bg-[#F2AE01] text-white shadow-[0_4px_10px_rgba(242,174,1,0.4)]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-[#E8EDF2] shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] rounded-2xl py-3 pl-12 pr-4 focus:outline-none text-gray-700 placeholder-gray-400 font-medium"
                required
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or Username"
              className="w-full bg-[#E8EDF2] shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] rounded-2xl py-3 pl-12 pr-4 focus:outline-none text-gray-700 placeholder-gray-400 font-medium"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#E8EDF2] shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] rounded-2xl py-3 pl-12 pr-12 focus:outline-none text-gray-700 placeholder-gray-400 font-medium"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#F2AE01] text-gray-900 font-bold py-3 pt-3.5 rounded-2xl shadow-[0_4px_10px_rgba(242,174,1,0.4)] hover:bg-[#e6a300] transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {isLogin ? (
              <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Sign In</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Create Account</>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-4 text-gray-400 text-sm">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span>or</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full mt-6 bg-[#E8EDF2] text-gray-700 font-bold py-3.5 rounded-2xl shadow-[6px_6px_12px_#c5cad0,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
        
        {isLogin && (
          <div className="text-center mt-6">
            <a href="#" className="text-sm font-medium text-[#F2AE01]/80 hover:text-[#F2AE01] transition-colors">
              Forgot Password?
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
