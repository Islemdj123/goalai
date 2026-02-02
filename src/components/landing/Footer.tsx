"use client";
import { Github, Twitter, Instagram } from "lucide-react";

export default function Footer({ settings }: { settings: any }) {
  return (
    <footer id="support" className="bg-[#050505] border-t border-white/10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-black italic text-blue-500 mb-6">GOALAI</h2>
            <p className="text-gray-400 max-w-sm mb-8">
              {settings?.about_us}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"><Github size={20} /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#home" className="hover:text-blue-500 transition-colors">Home</a></li>
              <li><a href="#features" className="hover:text-blue-500 transition-colors">Features</a></li>
              <li><a href="#plans" className="hover:text-blue-500 transition-colors">Plans</a></li>
              <li><a href="/login" className="hover:text-blue-500 transition-colors">Login</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-6">Support</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>Contact: {settings?.support_email}</li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 text-center text-gray-500 text-[10px] uppercase tracking-widest">
          &copy; {new Date().getFullYear()} GOALAI PREDICTIONS. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
