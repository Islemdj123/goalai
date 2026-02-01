"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    console.log("Splash page mounted");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    const timer = setTimeout(() => {
      console.log("Redirecting from splash...");
      if (token) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }, 15000); 
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden bg-black">
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
