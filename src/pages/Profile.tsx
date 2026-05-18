import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { LogOut } from 'lucide-react';

export function Profile() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const initial = user?.displayName ? user.displayName[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <div className="p-4 px-6 pt-12 min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-[#F2AE01] text-gray-900 text-4xl font-black flex items-center justify-center shadow-[0_4px_15px_rgba(242,174,1,0.5)] mb-4 overflow-hidden">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <h2 className="text-2xl font-black text-gray-800 tracking-wider">
          {user?.displayName || user?.email?.split('@')[0] || 'USER'}
        </h2>
        <p className="text-gray-500 font-medium text-sm mt-1">{user?.email}</p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
         <button 
           onClick={handleLogout}
           className="w-full flex items-center justify-center gap-2 bg-[#E8EDF2] text-red-500 font-bold py-3.5 rounded-xl shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff] transition-all"
         >
           <LogOut size={18} /> Logout
         </button>
      </div>
    </div>
  );
}
