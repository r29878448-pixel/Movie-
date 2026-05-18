import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, Settings } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMovie } from '../hooks/useMovies';
import ReactPlayer from 'react-player';
import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, useCallback } from 'react';

export function VideoPlayer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { movie, loading } = useMovie(id);
  
  const playerRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [durationTime, setDurationTime] = useState('0:00');
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const lastUpdateTimeRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isDragging) {
          setShowControls(false);
        }
      }, 3000);
    }
  }, [isPlaying, isDragging]);

  useEffect(() => {
    startControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, isDragging, startControlsTimeout]);

  const handleError = (e: any) => {
    console.error("ReactPlayer Error:", e);
    setIsLoading(false);
    setHasError(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#000] z-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie || hasError) {
    return (
      <div className="fixed inset-0 bg-[#000] z-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-white text-xl font-bold mb-4">{hasError ? "Video format not supported or invalid source." : "Video not found."}</h2>
        <button onClick={() => window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/')} className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg text-white font-bold transition-all">Go Back</button>
      </div>
    );
  }

  const searchParams = new URLSearchParams(location.search);
  const epParam = searchParams.get('ep');

  let videoUrl = movie.link;
  let title = movie.title || movie.name;

  if (movie.type === 'webseries' && movie.episodes) {
    const ep = movie.episodes.find((e: any) => e.number == epParam);
    if (ep) {
       videoUrl = ep.link;
       title = `${title} - Episode ${ep.number}`;
    } else if (movie.episodes.length > 0) {
       videoUrl = movie.episodes[0].link;
       title = `${title} - Episode ${movie.episodes[0].number}`;
    }
  }

  videoUrl = videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const calculatePercent = (clientX: number) => {
    if (!progressContainerRef.current) return 0;
    const bounds = progressContainerRef.current.getBoundingClientRect();
    const x = clientX - bounds.left;
    return Math.max(0, Math.min(1, x / bounds.width));
  };

  const handleSeek = (clientX: number) => {
    const percent = calculatePercent(clientX);
    if (playerRef.current && duration > 0) {
       // @ts-ignore
       if(playerRef.current.seekTo) playerRef.current.seekTo(percent, 'fraction');
       // @ts-ignore
       else playerRef.current.currentTime = percent * duration;
    }
    setPlayed(percent);
  };

  const onDragStart = (clientX: number) => {
    setIsDragging(true);
    handleSeek(clientX);
  };

  const onDragMove = (clientX: number) => {
    if (isDragging) {
      handleSeek(clientX);
    }
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse events for progress bar
  const handleMouseDown = (e: ReactMouseEvent) => onDragStart(e.clientX);
  const handleMouseMoveProgress = (e: ReactMouseEvent) => {
    const p = calculatePercent(e.clientX);
    setHoverPercent(p);
    onDragMove(e.clientX);
  };
  const handleMouseUp = () => onDragEnd();
  const handleMouseLeaveProgress = () => {
    setHoverPercent(null);
    if (isDragging) onDragEnd();
  };

  // Touch events for progress bar
  const handleTouchStart = (e: ReactTouchEvent) => onDragStart(e.touches[0].clientX);
  const handleTouchMove = (e: ReactTouchEvent) => onDragMove(e.touches[0].clientX);
  const handleTouchEnd = () => onDragEnd();

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const skipTime = (amount: number) => {
    if (playerRef.current && duration > 0) {
      let current = 0;
      // @ts-ignore
      if(playerRef.current.getCurrentTime) current = playerRef.current.getCurrentTime();
      // @ts-ignore
      else current = playerRef.current.currentTime || 0;

      let newTime = current + amount;
      newTime = Math.max(0, Math.min(newTime, duration));
      // @ts-ignore
      if(playerRef.current.seekTo) playerRef.current.seekTo(newTime, 'seconds');
      // @ts-ignore
      else playerRef.current.currentTime = newTime;

      setPlayed(newTime / duration);
      setCurrentTime(formatTime(newTime));
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      
      {/* Player Container */}
      <div 
        ref={playerContainerRef} 
        className={`relative w-[100vw] h-[100vh] sm:w-[90%] sm:max-w-[1000px] sm:h-auto sm:aspect-video bg-black sm:rounded-xl overflow-hidden group ${showControls && !isDragging ? 'cursor-default' : 'cursor-none'} ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseMove={startControlsTimeout}
        onClick={startControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Interaction Overlay (Catch taps) */}
        <div 
          className="absolute inset-0 z-10" 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (clickTimeoutRef.current) {
              // Double click detected
              clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = null;
              const { clientX } = e;
              const { innerWidth } = window;
              if (clientX > innerWidth / 2) skipTime(10);
              else skipTime(-10);
              setShowControls(true);
            } else {
              // Single click started
              clickTimeoutRef.current = setTimeout(() => {
                clickTimeoutRef.current = null;
                setShowControls(true); 
                setShowSettings(false); 
                handlePlayPause();
              }, 250);
            }
          }}
        ></div>

        <ReactPlayer 
          ref={playerRef as any}
          src={videoUrl}
          width="100%"
          height="100%"
          controls={false}
          playing={isPlaying}
          muted={isMuted}
          volume={volume}
          playbackRate={playbackRate}
          playsInline
          config={{ file: { forceHLS: videoUrl?.includes('m3u8') || false } }}
          onError={handleError}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onProgress={({ played, playedSeconds }: any) => {
             if (isDragging) return;
             setPlayed(played);
             setCurrentTime(formatTime(playedSeconds));
          }}
          onDurationChange={(e: React.SyntheticEvent<HTMLVideoElement>) => {
             const dur = (e.target as HTMLVideoElement).duration;
             setDuration(dur);
             setDurationTime(formatTime(dur));
          }}
          onEnded={() => setIsPlaying(false)}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Top Overlay */}
        <div className={`absolute top-0 left-0 w-full h-[120px] bg-gradient-to-b from-black/90 to-transparent z-20 transition-opacity duration-300 pointer-events-none ${(showControls || !isPlaying) ? 'opacity-100' : 'opacity-0'}`}></div>

        {/* Title & Back button */}
        <div className={`absolute top-4 sm:top-6 left-4 right-4 flex items-center gap-4 z-40 transition-opacity duration-300 ${(showControls || !isPlaying) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
           <button onClick={(e) => { 
               e.stopPropagation(); 
               try {
                 if (window.history.length > 1) {
                   navigate(-1);
                 } else {
                   navigate('/');
                 }
               } catch (err) {
                 navigate('/');
               }
             }} 
             className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors flex-shrink-0 cursor-pointer text-white z-50 pointer-events-auto"
             type="button"
             aria-label="Go back"
           >
             <ArrowLeft size={20} />
           </button>
           <h2 className="text-white text-lg sm:text-2xl font-medium drop-shadow-md truncate pr-4 pointer-events-auto">{title}</h2>
        </div>

        {/* Center Play Button */}
        {!isPlaying && !isLoading && (
          <div 
            onClick={(e) => { e.stopPropagation(); handlePlayPause(); setShowControls(true); }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-[80px] sm:h-[80px] rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex justify-center items-center text-white cursor-pointer z-30 transition-all hover:bg-[#e50914] animate-in zoom-in-75 duration-200"
          >
            <Play size={36} className="fill-current ml-2" />
          </div>
        )}

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 w-full p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-30 transition-opacity duration-300 ${(showControls || !isPlaying) ? 'opacity-100 pointer-events-auto' : 'opacity-0 bg-black/0 shadow-none pointer-events-none'}`}>
           
           {/* Progress Bar Container */}
           <div 
             ref={progressContainerRef}
             className="w-full py-3 cursor-pointer group/progress mb-2 sm:mb-4 relative"
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMoveProgress}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseLeaveProgress}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}
           >
             {/* Hover Time Tooltip */}
             {hoverPercent !== null && duration > 0 && (
               <div 
                 className="absolute bottom-full mb-3 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-[10px] sm:text-xs font-mono font-medium px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity duration-150 animate-in fade-in"
                 style={{ left: `${hoverPercent * 100}%` }}
               >
                 {formatTime(hoverPercent * duration)}
               </div>
             )}
             <div className="w-full h-[4px] sm:h-[5px] bg-white/30 rounded-full relative overflow-hidden group-hover/progress:h-[6px] transition-all">
                {/* Buffered / Background */}
                <div className="absolute top-0 left-0 h-full bg-white/20 w-full rounded-full"></div>
                {/* Current Progress */}
                <div 
                  className={`absolute top-0 left-0 h-full bg-[#e50914] rounded-full ${isDragging ? '' : 'transition-all duration-100'}`}
                  style={{ width: `${played * 100}%` }}
                ></div>
             </div>
             {/* Thumbnail / Thumb */}
             <div 
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#e50914] rounded-full shadow-md pointer-events-none transition-transform duration-150 ${isDragging ? 'scale-125' : 'scale-0 group-hover/progress:scale-100'}`}
                style={{ left: `calc(${played * 100}% - 8px)` }}
             ></div>
           </div>

           {/* Buttons */}
           <div className="flex justify-between items-center sm:px-2">
              <div className="flex items-center gap-4 sm:gap-6">
                 <button onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} className="text-white hover:text-[#e50914] transition-colors cursor-pointer p-1">
                    {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
                 </button>
                 
                 <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); skipTime(-10); }} className="text-white hover:text-white/70 transition-colors cursor-pointer p-1 hidden sm:block">
                      <RotateCcw size={20} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); skipTime(10); }} className="text-white hover:text-white/70 transition-colors cursor-pointer p-1 hidden sm:block">
                      <RotateCw size={20} />
                    </button>
                 </div>

                 <div className="flex items-center gap-1 sm:gap-2 group/volume relative rounded-full hover:bg-white/10 transition-colors p-1 sm:pr-2">
                   <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="text-white hover:text-[#e50914] transition-colors cursor-pointer flex-shrink-0 relative z-10">
                      {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                   </button>
                   {/* Volume Slider */}
                   <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ease-in-out hidden sm:flex items-center h-full opacity-0 group-hover/volume:opacity-100">
                     <input 
                       type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} 
                       onChange={(e) => { 
                         e.stopPropagation(); 
                         const val = parseFloat(e.target.value);
                         setVolume(val); 
                         if (val > 0) setIsMuted(false); 
                       }}
                       onClick={(e) => e.stopPropagation()}
                       className="w-full h-1 bg-white/30 rounded-full cursor-pointer accent-[#e50914]"
                     />
                   </div>
                 </div>
                 
                 <span className="text-white text-sm font-medium tracking-wide font-mono hidden sm:block">
                    {currentTime} <span className="text-white/50 mx-1">/</span> {durationTime}
                 </span>
              </div>
              
              <div className="flex items-center gap-4">
                 {/* Mobile compact time */}
                 <span className="text-white text-xs font-medium tracking-wide font-mono sm:hidden opacity-80">
                    {currentTime} / {durationTime}
                 </span>
                 
                 <div className="relative">
                   <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} className="text-white hover:text-[#e50914] transition-colors p-1 cursor-pointer">
                     <Settings size={20} />
                   </button>
                   {/* Settings Menu */}
                   {showSettings && (
                     <div className="absolute bottom-full right-0 mb-4 w-32 bg-black/90 backdrop-blur-md rounded-lg p-2 border border-white/10 shadow-2xl origin-bottom-right animate-in fade-in zoom-in-95 z-50">
                        <div className="text-[10px] text-white/50 mb-1 px-2 uppercase font-bold tracking-wider">Speed</div>
                        {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                          <button 
                            key={rate} 
                            onClick={(e) => { e.stopPropagation(); setPlaybackRate(rate); setShowSettings(false); }}
                            className={`w-full text-left px-3 py-1.5 rounded hover:bg-white/10 text-sm font-medium transition-colors ${playbackRate === rate ? 'text-[#e50914] bg-white/5' : 'text-white'}`}
                          >
                            {rate === 1 ? 'Normal' : `${rate}x`}
                          </button>
                        ))}
                     </div>
                   )}
                 </div>
                 
                 <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white hover:text-[#e50914] transition-colors p-1 cursor-pointer">
                    <Maximize size={20} />
                 </button>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
