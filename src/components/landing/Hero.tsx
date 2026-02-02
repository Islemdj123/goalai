"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/api";
import Link from "next/link";

export default function Hero({ settings }: { settings: any }) {
  const hero = settings?.hero || {};
  const [currentImage, setCurrentImage] = useState(0);

  const images = hero.image_urls || [];
  const videoSrc = hero.video_url?.startsWith("/") ? `${API_BASE}${hero.video_url}` : hero.video_url;

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const getImageUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("/") ? `${API_BASE}${url}` : url;
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {/* Images Slider */}
        {images.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              <img 
                src={getImageUrl(images[currentImage])} 
                className="w-full h-full object-cover grayscale"
                alt="Background"
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Video Overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          key={videoSrc}
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
      </div>

      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-white mb-6">
            {hero.title || "GOAL"}<span className="text-blue-500">AI</span>
          </h1>
          <p className="text-xl md:text-3xl text-gray-300 mb-10 font-light max-w-3xl mx-auto leading-relaxed">
            {hero.subtitle || "The Future of Football Predictions"}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/splash"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95"
            >
              Get Started Now
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95"
            >
              Login to App
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-white/30 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to Explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-blue-500 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
