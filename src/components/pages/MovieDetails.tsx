import { ArrowLeft, Play, Heart, Share2, Download, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMovie } from '../hooks/useMovies';
import { useAuth } from '../lib/AuthContext';
import { ref, onValue, push, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export function MovieDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { movie, loading } = useMovie(id);
  const { user } = useAuth();

  const [inWatchlist, setInWatchlist] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    const commentsRef = ref(rtdb, `comments/${id}`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data: any[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          data.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
      }
      setComments(data.sort((a, b) => b.timestamp - a.timestamp));
    });

    const ratingsRef = ref(rtdb, `ratings/${id}`);
    const unsubscribeRatings = onValue(ratingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const ratingsData = snapshot.val();
        const ratingsArray = Object.values(ratingsData) as number[];
        const total = ratingsArray.length;
        const avg = ratingsArray.reduce((acc, curr) => acc + curr, 0) / total;
        setAverageRating(Math.round(avg * 10) / 10);
        setTotalRatings(total);
        if (user && ratingsData[user.uid]) {
          setUserRating(ratingsData[user.uid]);
        } else {
          setUserRating(0);
        }
      } else {
        setAverageRating(0);
        setTotalRatings(0);
        setUserRating(0);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeRatings();
    };
  }, [id, user]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !user || !id) return;
    try {
      const newCommentRef = push(ref(rtdb, `comments/${id}`));
      await set(newCommentRef, {
        user: user.displayName || user.email?.split('@')[0] || 'User',
        userId: user.uid,
        text: newComment.trim(),
        timestamp: Date.now()
      });
      setNewComment("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleRate = async (rating: number) => {
    if (!user || !id) {
      navigate('/login');
      return;
    }
    try {
      await set(ref(rtdb, `ratings/${id}/${user.uid}`), rating);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#E8EDF2]">
        <div className="w-12 h-12 border-4 border-[#F2AE01] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#E8EDF2] min-h-screen text-gray-800">
        <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
        <button 
          onClick={() => window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/')} 
          className="px-6 py-2 bg-[#F2AE01] text-gray-900 font-bold rounded-xl shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff]"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isSeries = movie.type === 'webseries' && Array.isArray(movie.episodes) && movie.episodes.length > 0;

  return (
    <div className="animate-in fade-in pb-24 bg-[#E8EDF2] text-gray-800 min-h-screen">
      {/* Banner Section */}
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <img src={movie.banner || movie.poster} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#E8EDF2] via-transparent to-transparent"></div>
        
        {/* Back Button */}
        <button 
          onClick={() => {
            try {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            } catch (e) {
              navigate('/');
            }
          }}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#F2AE01] hover:text-black transition-colors z-50 pointer-events-auto cursor-pointer"
          type="button"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Content Details */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">{movie.title || movie.name}</h1>
          
          <div className="flex flex-wrap justify-center items-center gap-2 mb-6 text-sm text-gray-600 font-bold bg-[#E8EDF2]/80 backdrop-blur-md px-4 py-2 rounded-full shadow-[4px_4px_8px_rgba(197,202,208,0.5),-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <span className="flex items-center gap-1 text-[#F2AE01]">
              <Star size={14} className="fill-[#F2AE01]" /> {averageRating > 0 ? averageRating : (movie.rating || 'N/A')} {totalRatings > 0 ? `(${totalRatings})` : ''}
            </span>
            <span>{movie.year || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '')}</span>
            <span>{movie.language || 'English'}</span>
            <span>{movie.category || 'Movie'}</span>
            {movie.ncBadge && (
              <span className="bg-[#F2AE01] text-gray-900 px-2 py-0.5 rounded-md shadow-sm">NC</span>
            )}
            {movie.access === 'Premium' && (
               <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                 <Star size={12} className="fill-white"/> Premium
               </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-2">
        {/* Rating Section */}
        <div className="bg-[#E8EDF2] rounded-xl shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] p-4 mb-6 flex flex-col items-center justify-center gap-2">
          <p className="font-bold text-gray-700 text-sm">{userRating > 0 ? 'Your Rating' : 'Rate this title'}</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="focus:outline-none transition-transform hover:scale-110 cursor-pointer pointer-events-auto relative z-10"
                type="button"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  size={28}
                  className={`${
                    star <= userRating
                      ? 'fill-[#F2AE01] text-[#F2AE01]'
                      : 'fill-transparent text-gray-400'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button onClick={() => navigate(`/play/${movie.id}`)} className="bg-[#F2AE01] text-gray-900 font-bold py-3.5 rounded-xl shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff] hover:bg-[#f3b519] transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
            <Play size={18} className="fill-current" /> Play
          </button>
          <button 
            onClick={() => setInWatchlist(!inWatchlist)} 
            className={`font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
              inWatchlist 
                ? 'bg-[#E8EDF2] text-[#F2AE01] shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff]' 
                : 'bg-[#E8EDF2] text-gray-500 shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff]'
            }`}
          >
            <Heart size={18} className={inWatchlist ? "fill-[#F2AE01]" : ""} /> Watchlist
          </button>
        </div>
        
        <button className="w-full bg-[#E8EDF2] text-gray-600 font-bold py-3.5 rounded-xl shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center justify-center gap-2 mb-6 text-sm sm:text-base">
          <Share2 size={18} /> Share
        </button>

        {movie.ncBadge && (
          <div className="bg-[#E8EDF2] shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] rounded-xl p-4 mb-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-center">
            <span className="text-xl">😍</span>
            <p className="font-bold text-gray-600">You Can Download <span className="text-[#F2AE01]">NC</span> Video And Also Watch With Offline Player!</p>
            <span className="text-xl">👩‍💻</span>
          </div>
        )}

        {/* Storyline */}
        <div className="bg-[#E8EDF2] rounded-xl shadow-[6px_6px_12px_#c5cad0,-6px_-6px_12px_#ffffff] p-5 mb-8">
          <h3 className="flex items-center gap-2 font-bold text-lg mb-3 text-gray-800">
            <span className="w-1.5 h-6 bg-[#F2AE01] rounded"></span>
            Storyline
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed font-medium">
            {movie.storyline || movie.description || 'No storyline available.'}
          </p>
        </div>

        {/* Episodes for Series */}
        {isSeries && (
          <div className="bg-[#E8EDF2] rounded-xl shadow-[6px_6px_12px_#c5cad0,-6px_-6px_12px_#ffffff] p-5 mb-8">
            <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-gray-800">
               <span className="w-1.5 h-6 bg-[#F2AE01] rounded"></span>
               Episodes
            </h3>
            <div className="flex flex-wrap gap-3">
              {movie.episodes.map((ep: any) => (
                <button 
                  key={ep.number}
                  onClick={() => navigate(`/play/${movie.id}?ep=${ep.number}`)}
                  className="w-12 h-12 flex items-center justify-center font-bold text-sm bg-[#E8EDF2] text-gray-700 shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff] rounded-full transition-all"
                >
                  {ep.number}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-[#E8EDF2] rounded-xl shadow-[6px_6px_12px_#c5cad0,-6px_-6px_12px_#ffffff] p-5">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Comments</h3>
          <div className="flex gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#F2AE01] shadow-[2px_2px_4px_#c5cad0,-2px_-2px_4px_#ffffff] flex-shrink-0 flex items-center justify-center font-bold text-gray-900">
               {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 flex gap-2">
              <input 
                 type="text" 
                 value={newComment}
                 onChange={e => setNewComment(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                 placeholder="Write a comment..." 
                 className="w-full bg-[#E8EDF2] shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2AE01] text-gray-700 font-medium placeholder-gray-400" 
              />
              <button 
                onClick={handlePostComment}
                className="px-4 py-2 bg-[#F2AE01] text-gray-900 font-bold rounded-xl shadow-[4px_4px_8px_#c5cad0,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c5cad0,inset_-2px_-2px_4px_#ffffff]"
              >
                Post
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 font-medium text-sm py-4">No comments yet. Be the first to comment!</div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="bg-[#E8EDF2] shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff] rounded-xl p-4">
                  <div className="font-bold text-[#F2AE01] text-sm mb-1">{c.user}</div>
                  <div className="text-gray-700 text-sm">{c.text}</div>
                  {c.reply?.text && (
                    <div className="mt-3 pl-3 border-l-2 border-[#F2AE01] text-sm text-gray-600 bg-gray-50/50 p-2 rounded-r-lg">
                      <span className="font-bold text-gray-800 block text-xs">Admin Reply</span>
                      {c.reply.text}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
