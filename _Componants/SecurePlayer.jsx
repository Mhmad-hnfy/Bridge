"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function SecurePlayer({ videoUrl, studentName = "Ahmed Yassin", studentPhone = "01012345678", maxViews = 3 }) {
    const [isBlocked, setIsBlocked] = useState(false);
    const [watermarkPos, setWatermarkPos] = useState({ top: '20%', left: '20%' });
    const [isPlaying, setIsPlaying] = useState(false);
    const [player, setPlayer] = useState(null);
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    
    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYoutubeId(videoUrl);

    const [usedViews, setUsedViews] = useState(0);

    useEffect(() => {
        // Load YouTube API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            initPlayer();
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        }

        // View tracking is now handled at the page level via API

        const interval = setInterval(() => {
            setWatermarkPos({
                top: `${Math.floor(Math.random() * 70 + 15)}%`,
                left: `${Math.floor(Math.random() * 60 + 10)}%`
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [videoId]);

    const initPlayer = () => {
        const newPlayer = new window.YT.Player(playerRef.current, {
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                disablekb: 1,
                iv_load_policy: 3
            },
            events: {
                onReady: (event) => setPlayer(event.target),
                onStateChange: (event) => {
                    if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
                    else setIsPlaying(false);
                }
            }
        });
    };

    const handlePlayPause = () => {
        if (!player) return;
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    const handleSpeedChange = (speed) => {
        if (player && player.setPlaybackRate) {
            player.setPlaybackRate(parseFloat(speed));
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen?.() || containerRef.current.webkitRequestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            if (player && player.getCurrentTime) {
                setCurrentTime(player.getCurrentTime());
                setDuration(player.getDuration());
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [player]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (e) => {
        if (!player) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = x / width;
        player.seekTo(percentage * duration);
    };



    return (
        <div 
            ref={containerRef}
            className="relative group aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl transition-all duration-500"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* The Video Wrapper (Clicks Blocked) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div ref={playerRef} className="w-full h-full scale-[1.05]"></div>
            </div>

            {/* Total Lockdown Shield */}
            <div className="absolute inset-0 z-10 cursor-default" onClick={handlePlayPause}></div>

            {/* View Count Badge */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black text-white/80 uppercase tracking-widest">
                    Views: <span className={usedViews >= maxViews - 1 ? "text-red-400" : "text-blue-400"}>{usedViews}</span> / {maxViews}
                </div>
            </div>

            {/* Play Overlay */}
            {!isPlaying && (
                <div 
                    className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer group-hover:bg-black/40 transition-all"
                    onClick={handlePlayPause}
                >
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl shadow-2xl group-hover:scale-110 transition-all">
                        {player ? '▶️' : '⌛'}
                    </div>
                </div>
            )}

            {/* Custom Control UI Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 z-50 bg-linear-to-t from-black/90 via-black/40 to-transparent p-4 md:p-6 transition-opacity pointer-events-none ${isPlaying ? 'opacity-0 group-hover:opacity-100 group-active:opacity-100' : 'opacity-100'}`}>
                {/* Progress Bar */}
                <div 
                    className="w-full h-2 md:h-1.5 bg-white/20 rounded-full mb-4 md:mb-6 cursor-pointer pointer-events-auto group/bar relative"
                    onClick={handleSeek}
                >
                    <div 
                        className="h-full bg-blue-600 rounded-full relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl scale-100 md:scale-0 group-hover/bar:scale-100 transition-transform"></div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-6 pointer-events-auto">
                        <button 
                            onClick={handlePlayPause}
                            className="text-white text-2xl md:text-2xl hover:text-blue-400 transition-colors"
                        >
                            {isPlaying ? '⏸️' : '▶️'}
                        </button>

                        <div className="text-white font-mono text-[10px] md:text-xs opacity-80">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        <select 
                            onChange={(e) => handleSpeedChange(e.target.value)}
                            className="bg-white/10 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1.5 md:px-3 md:py-2 rounded-lg border border-white/10 outline-none hover:bg-blue-600 transition-all cursor-pointer"
                        >
                            <option value="1">1.0x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2.0x</option>
                        </select>

                        <select 
                            onChange={(e) => player && player.setPlaybackQuality && player.setPlaybackQuality(e.target.value)}
                            className="bg-white/10 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1.5 md:px-3 md:py-2 rounded-lg border border-white/10 outline-none hover:bg-blue-600 transition-all cursor-pointer"
                        >
                            <option value="default">Auto</option>
                            <option value="hd1080">1080p</option>
                            <option value="hd720">720p</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4 pointer-events-auto">
                        <button 
                            onClick={toggleFullscreen}
                            className="text-white text-xl hover:text-blue-400 transition-colors px-2"
                        >
                            ⛶
                        </button>
                    </div>
                </div>
            </div>

            {/* Dynamic Watermark - Responsive Size */}
            <div 
                className="absolute z-30 pointer-events-none transition-all duration-[3000ms] ease-in-out"
                style={{ 
                    top: watermarkPos.top, 
                    left: watermarkPos.left, 
                    transform: 'translate(-50%, -50%)' 
                }}
            >
                <div className="bg-black/20 backdrop-blur-[2px] border border-white/10 p-2 md:p-3 rounded-lg md:rounded-xl text-[8px] md:text-[11px] font-black text-white/40 uppercase tracking-[0.2em] md:tracking-[0.25em] rotate-12 shadow-2xl">
                    {studentName} <br/> 
                    <span className="text-blue-400/50">{studentPhone}</span>
                </div>
            </div>
        </div>
    );
}
