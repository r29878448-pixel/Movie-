import { useState } from 'react';
import { Play, Star, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export interface ContentCardProps {
  id: string;
  title: string;
  poster: string;
  year?: number;
  releaseDate?: string;
  rating?: number;
  ncBadge?: boolean;
  access?: string;
  type: string;
}

export function ContentCard({ item, index }: { item: ContentCardProps, index: number }) {
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-36 sm:w-44 snap-center relative group"
    >
      <div className="relative aspect-[2/3] rounded-[20px] overflow-hidden shadow-[6px_6px_12px_#c5cad0,-6px_-6px_12px_#ffffff] transition-transform duration-300 md:group-hover:-translate-y-2">
        <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90 pointer-events-none"></div>
        
        <div className="absolute top-2 right-2 bg-[#F2AE01] text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm pointer-events-none z-10">
          {item.year || (item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A')}
        </div>
        
        {item.access === 'Premium' && (
          <div className="absolute top-8 right-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 pointer-events-none z-10">
             <Star className="w-3 h-3 fill-white" /> Premium
          </div>
        )}

        <div className="absolute flex flex-col justify-end p-3 inset-0 pointer-events-none z-10">
          <h3 className="text-white font-bold text-sm leading-tight drop-shadow-md line-clamp-2 mb-1">{item.title}</h3>
          <div className="flex items-center gap-1 text-[11px] text-[#F2AE01] drop-shadow-md">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-semibold">{Number(item.rating || 0).toFixed(1)}</span>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900/20 backdrop-blur-[2px] pointer-events-none z-10">
          <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white flex flex-col items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Play className="w-6 h-6 ml-1 fill-white" />
          </div>
        </div>

        <Link to={`/details/${item.id}`} className="absolute inset-0 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F2AE01] rounded-[20px]" aria-label={`View details for ${item.title}`}>
          <span className="sr-only">View details for {item.title}</span>
        </Link>
        
        <button 
          type="button"
          className={`absolute top-2 left-2 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center border cursor-pointer transition-all active:scale-95 z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2AE01] ${isWatchlisted ? 'bg-[#e50914]/20 border-[#e50914]/50 text-[#e50914] hover:bg-[#e50914]/30' : 'bg-white/20 border-white/30 text-white hover:bg-white/30 hover:scale-110'}`}
          aria-label={isWatchlisted ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            setIsWatchlisted(!isWatchlisted);
          }}
        >
          <Heart className="w-4 h-4" fill={isWatchlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.div>
  );
}

export function ContentRail({ title, items, viewAllLink }: { title: string, items: ContentCardProps[], viewAllLink?: string }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-[#F2AE01] rounded"></div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h2>
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} aria-label={`View all ${title}`} className="text-sm font-semibold text-[#F2AE01] hover:text-[#e6a300] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2AE01] rounded">
            View All &gt;
          </Link>
        )}
      </div>

      <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {items.map((item, index) => (
          <ContentCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
