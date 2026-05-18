import { useState, useEffect } from 'react';
import { ref, get, child } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { ContentCardProps } from '../components/ContentRail';

export function useMovies() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const dbRef = ref(rtdb);
        const [moviesSnap, webseriesSnap, animeSnap] = await Promise.all([
          get(child(dbRef, 'movies')),
          get(child(dbRef, 'webseries')),
          get(child(dbRef, 'anime'))
        ]);
        
        let allContent: any[] = [];
        
        if (webseriesSnap.exists()) {
          const data = webseriesSnap.val();
          const webseries = Object.keys(data).map(key => ({ id: key, ...data[key], type: 'webseries' }));
          allContent = [...allContent, ...webseries];
        }
        
        if (moviesSnap.exists()) {
          const data = moviesSnap.val();
          const moviesData = Object.keys(data).map(key => ({ id: key, ...data[key], type: 'movie' }));
          allContent = [...allContent, ...moviesData];
        }

        if (animeSnap.exists()) {
          const data = animeSnap.val();
          const animeData = Object.keys(data).map(key => ({ id: key, ...data[key], type: 'anime' }));
          allContent = [...allContent, ...animeData];
        }

        allContent.sort((a, b) => {
          const pA = a.priority || 0;
          const pB = b.priority || 0;
          if (pA !== pB) return pB - pA;
          return (b.timestamp || 0) - (a.timestamp || 0);
        });
        
        setMovies(allContent);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  return { movies, loading };
}

export function useMovie(id: string | undefined) {
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const dbRef = ref(rtdb);
        // We will just check movies, webseries, anime and live_tv paths
        const movieSnap = await get(child(dbRef, `movies/${id}`));
        if (movieSnap.exists()) {
          setMovie({ id, ...movieSnap.val(), type: 'movie' });
        } else {
          const seriesSnap = await get(child(dbRef, `webseries/${id}`));
          if (seriesSnap.exists()) {
            setMovie({ id, ...seriesSnap.val(), type: 'webseries' });
          } else {
             const animeSnap = await get(child(dbRef, `anime/${id}`));
             if (animeSnap.exists()) {
                setMovie({ id, ...animeSnap.val(), type: 'anime' });
             } else {
                const liveSnap = await get(child(dbRef, `live_tv/${id}`));
                if(liveSnap.exists()) {
                   setMovie({ id, ...liveSnap.val(), type: 'livetv' });
                } else {
                   setMovie(null);
                }
             }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
  }, [id]);

  return { movie, loading };
}

