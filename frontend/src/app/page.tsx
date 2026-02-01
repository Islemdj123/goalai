"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

export default function Splash() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    // Attempt auto-play
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        console.log("Autoplay blocked by browser");
      });
    }

    const timer = setTimeout(() => {
      if (token) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }, 15000); 
    return () => clearTimeout(timer);
  }, [router]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setMuted(audioRef.current.muted);
    }
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        src="https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptoken=646002f1-6899-4d76-8f2e-43615456f932" 
        autoPlay 
        loop
      />

      {/* Audio Toggle Button */}
      <button 
        onClick={toggleMute}
        className="absolute top-10 right-10 z-30 p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all"
      >
        {muted ? <VolumeX className="text-white" size={24} /> : <Volume2 className="text-white" size={24} />}
      </button>

      {/* Background Splash Wallpaper */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/ronaldovsmessi.jpg" 
          alt="Messi vs Ronaldo Splash" 
          className="w-full h-full object-cover object-top opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="z-20 text-center"
      >
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-4">
          GOAL<span className="text-blue-500">AI</span>
        </h1>
        <p className="text-white text-sm animate-pulse mb-4">LOADING EXPERIENCE...</p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-xl md:text-2xl font-light text-gray-400"
        >
          The Future of Football Predictions
        </motion.p>
      </motion.div>

      <div className="absolute bottom-10 z-20">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-1 h-12 bg-blue-500 rounded-full mx-auto"
        />
      </div>
    </div>
  );
}
