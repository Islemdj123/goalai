"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Plans({ settings }: { settings: any }) {
  const plans = settings?.plans || [];

  return (
    <section id="plans" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Pricing Plans</h2>
          <p className="text-gray-400">Select the plan that fits your betting strategy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan: any, idx: number) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className={`p-10 rounded-[3rem] border transition-all ${idx === 1 ? 'bg-blue-600 border-blue-400 shadow-2xl shadow-blue-600/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
            >
              <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black">{plan.price}</span>
                {plan.price !== "$0" && <span className="text-sm opacity-60">/month</span>}
              </div>
              
              <ul className="space-y-4 mb-10">
                {(plan.features || []).map((feat: string, fIdx: number) => (
                  <li key={fIdx} className="flex items-center gap-3 font-medium opacity-90 text-sm">
                    <Check size={18} />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`block w-full text-center py-4 rounded-2xl font-black text-sm transition-all ${idx === 1 ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                Choose {plan.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
