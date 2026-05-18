import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Search, Play } from 'lucide-react';

export function LiveTV() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const navigate = useNavigate();

  useEffect(() => {
    const liveTvRef = ref(rtdb, 'live_tv');
    const unsubscribe = onValue(liveTvRef, (snapshot) => {
      const liveTvData: any[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          liveTvData.push({ id: childSnapshot.key, ...childSnapshot.val(), type: 'livetv' });
        });
      }
      setChannels(liveTvData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['All', '24x7'];

  const displayChannels = channels; // for now display all since we don't have deep categories in dummy data. Or filter if you wish.

  return (
    <div className="pt-4 pb-24 animate-in fade-in duration-500 min-h-screen px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <span className="text-red-500 text-xl font-bold tracking-tighter">((o))</span> Live TV
        </h1>
        <button className="w-10 h-10 rounded-full bg-[#E8EDF2] shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-500 transition-all">
          <Search size={18} />
        </button>
      </div>

      {/* Categories Toggle */}
      <div className="mb-8">
        <div className="inline-flex items-center p-1 bg-[#E8EDF2] rounded-2xl shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff]">
          {categories.map(cat => (
             <button 
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-6 py-2 font-bold text-sm rounded-xl transition-all ${
                 activeCategory === cat 
                   ? 'bg-[#F2AE01] text-gray-900 shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff]' 
                   : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               {cat}
             </button>
          ))}
        </div>
      </div>

      {/* Main channel list */}
      <div>
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-4 border-[#F2AE01] border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : displayChannels.length > 0 ? (
           <div className="flex flex-col gap-6">
             {displayChannels.map(channel => (
               <div 
                 key={channel.id}
                 onClick={() => navigate(`/play/${channel.id}`)}
                 className="w-full relative h-[180px] rounded-[24px] overflow-hidden shadow-[6px_6px_12px_#c5cad0,-6px_-6px_12px_#ffffff] cursor-pointer group"
               >
                 {/* Background Thumbnail */}
                 <div className="absolute inset-0">
                    <img src={channel.thumbnail || channel.logo || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80'} alt="bg" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
                 </div>

                 {/* Content Overlay */}
                 <div className="absolute inset-0 p-4 flex items-center z-10">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md flex-shrink-0 shadow-lg flex items-center justify-center p-1">
                       <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain" />
                    </div>
                    
                    <div className="flex-1 px-4">
                       <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 drop-shadow-sm">{channel.name}</h2>
                       <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600">
                          <span className="flex items-center gap-1 text-red-600"><span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> LIVE</span>
                          <span className="text-gray-400">&bull;</span>
                          <span>24x7</span>
                       </div>
                    </div>

                    <div className="flex-shrink-0 pr-2">
                       <div className="w-14 h-14 rounded-full bg-[#F2AE01] text-gray-900 flex items-center justify-center shadow-[4px_4px_10px_rgba(242,174,1,0.5)] group-hover:scale-105 transition-transform">
                          <Play size={28} className="fill-current ml-1" />
                       </div>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <div className="text-center py-20 text-gray-400 font-medium bg-[#E8EDF2] rounded-2xl shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff]">
            No channels found.
          </div>
        )}
      </div>
    </div>
  );
}
