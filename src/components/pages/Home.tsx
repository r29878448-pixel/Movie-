import { useState, useMemo } from 'react';
import { ContentRail } from '../components/ContentRail';
import { useMovies } from '../hooks/useMovies';

export function Home() {
  const { movies, loading } = useMovies();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Extract unique categories safely
  const categories = useMemo(() => {
    const cats = new Set<string>();
    movies.forEach((m: any) => {
      if (!m.category) return;
      if (Array.isArray(m.category)) {
         m.category.forEach((c: string) => cats.add(c.trim()));
      } else if (typeof m.category === 'string') {
         m.category.split(',').forEach((c: string) => cats.add(c.trim()));
      }
    });
    return Array.from(cats).sort();
  }, [movies]);

  // Filter content
  const displayMovies = useMemo(() => {
    if (selectedGenres.length === 0) return movies.slice(0, 50);
    return movies.filter((m: any) => {
      if (!m.category) return false;
      
      let movieCategories: string[] = [];
      if (Array.isArray(m.category)) {
        movieCategories = m.category.map((c: string) => c.trim());
      } else if (typeof m.category === 'string') {
        movieCategories = m.category.split(',').map((s: string) => s.trim());
      }
      
      return selectedGenres.some(g => movieCategories.includes(g));
    }).slice(0, 50);
  }, [movies, selectedGenres]);

  const toggleGenre = (cat: string) => {
    setSelectedGenres(prev => 
      prev.includes(cat) ? prev.filter(g => g !== cat) : [...prev, cat]
    );
  };

  const contentTitle = selectedGenres.length === 0 
    ? "Latest Releases" 
    : selectedGenres.length <= 3 
      ? `${selectedGenres.join(', ')} Movies & Series`
      : `${selectedGenres.length} Genres Selected`;

  return (
    <div className="pt-4 pb-12 animate-in fade-in duration-500">
      
      {/* Categories */}
      <div className="px-4 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2 flex gap-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <button 
          onClick={() => setSelectedGenres([])}
          className={`inline-block px-5 py-2 font-bold rounded-xl transition-all ${
            selectedGenres.length === 0 
              ? 'bg-[#F2AE01] text-gray-900 shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff]' 
              : 'bg-[#E8EDF2] text-gray-500 shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] hover:shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] hover:text-gray-700'
          }`}
        >
          All
        </button>
        {categories.map(cat => {
          const isActive = selectedGenres.includes(cat);
          return (
            <button 
              key={cat}
              onClick={() => toggleGenre(cat)}
              className={`inline-block px-5 py-2 font-bold rounded-xl transition-all ${
                isActive 
                  ? 'bg-[#F2AE01] text-gray-900 shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff]' 
                  : 'bg-[#E8EDF2] text-gray-500 shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] hover:shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] hover:text-gray-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#F2AE01] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayMovies.length > 0 ? (
        <>
          <ContentRail title={contentTitle} items={displayMovies} viewAllLink="/movies" />
          {selectedGenres.length === 0 && (
            <>
               <ContentRail title="Trending Movies & Series" items={movies.filter((m: any) => m.priority === 1).length > 0 ? movies.filter((m: any) => m.priority === 1) : movies.slice(10, 30)} viewAllLink="/movies" />
               <ContentRail title="Binge Worthy Series" items={movies.filter((m: any) => m.type === 'webseries')} viewAllLink="/series" />
               {movies.filter((m: any) => m.type === 'anime').length > 0 && (
                 <ContentRail title="Top Anime" items={movies.filter((m: any) => m.type === 'anime')} viewAllLink="/anime" />
               )}
            </>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400 font-medium">
          No content available for the selected genres right now.
        </div>
      )}
      
    </div>
  );
}
