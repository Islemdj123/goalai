"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirm: "" });
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        alert("Account created successfully!");
        router.push("/dashboard");
      } else {
        const err = await res.json();
        alert(err.detail || "Registration failed");
      }
    } catch (err) {
      alert("Could not connect to server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6">
      <div className="absolute inset-0 z-0">
        <img 
          src="/auth_bg.jpg" 
          alt="Stadium" 
          className="w-full h-full object-cover object-top opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="z-10 w-full max-w-md glass-morphism p-8 rounded-3xl"
      >
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-gray-400 mb-8">Join the elite betting circle.</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" 
            placeholder="Username" 
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" 
            placeholder="Email" 
            type="email"
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" 
            placeholder="Password" 
            type="password"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" 
            placeholder="Confirm Password" 
            type="password"
            onChange={e => setFormData({...formData, confirm: e.target.value})}
          />

          <button 
            type="submit"
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors mt-4"
          >
            Get Started
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
