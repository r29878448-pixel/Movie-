import { useSearchParams, Link } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';
import { Search as SearchIcon } from 'lucide-react';

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { movies, loading } = useMovies();

  const searchResults = movies.filter((m: any) => 
    (m.type === 'movie' || m.type === 'webseries') &&
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-4 pb-20 fade-in animate-in duration-300">
      <h1 className="text-xl font-bold text-gray-800 border-l-4 border-[#F2AE01] pl-3 mb-6 flex items-center gap-2">
        Search Results {query && <span className="text-gray-500 font-normal text-sm">for "{query}"</span>}
      </h1>
      
      {!query ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-16 h-16 rounded-full bg-[#E8EDF2] shadow-[6px_6px_12px_#c5cad0,-6px_-6px_12px_#ffffff] flex items-center justify-center mb-4 text-gray-300">
            <SearchIcon size={32} />
          </div>
          <p className="text-lg font-medium">Type to search movies & series</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#F2AE01] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {searchResults.map((item: any) => (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg font-medium">No results found.</p>
        </div>
      )}
    </div>
  );
}
