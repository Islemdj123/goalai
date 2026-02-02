"use client";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function WhyUs({ settings }: { settings: any }) {
  const why_us = settings?.why_us || {};

  return (
    <section id="about" className="py-24 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-black mb-8">{why_us.title || "Why Us?"}</h2>
            <div className="space-y-6">
              {(why_us.points || []).map((point: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4 text-xl font-medium text-gray-300"
                >
                  <CheckCircle2 className="text-blue-500" size={28} />
                  {point}
                </motion.div>
              ))}
            </div>
            <p className="mt-10 text-gray-400 leading-relaxed max-w-xl">
              {settings?.about_us}
            </p>
          </div>
          
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src="/ronaldovsmessi.jpg" alt="GoalAI Analysis" className="w-full grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 blur-[100px] rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/20 blur-[100px] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
