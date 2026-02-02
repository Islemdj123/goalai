"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import { API_BASE } from "@/lib/api";
import Features from "@/components/landing/Features";
import WhyUs from "@/components/landing/WhyUs";
import Plans from "@/components/landing/Plans";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/landing/settings`)
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error("Failed to load landing settings", err));
  }, []);

  if (!settings) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      <Hero settings={settings} />
      <Features settings={settings} />
      <WhyUs settings={settings} />
      <Plans settings={settings} />
      <Footer settings={settings} />
    </main>
  );
}
