"use client";
import { motion } from "framer-motion";
import { Brain, TrendingUp, ShieldCheck } from "lucide-react";

export default function Features({ settings }: { settings: any }) {
  const features = settings?.features || [];
  const icons = [<TrendingUp key="0" />, <ShieldCheck key="1" />, <Brain key="2" />];

  return (
    <section id="features" className="py-24 bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-4">What we offer</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature: any, idx: number) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-sm hover:border-blue-500/50 transition-all group"
            >
              <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {icons[idx] || <TrendingUp />}
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
