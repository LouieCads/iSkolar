"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

export default function Welcome(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Check user profile for role
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const user = response.data.user;
          if (!user.role) {
            router.replace('/auth/welcome');
          } else {
            // Redirect to respective dashboard
            if (user.role === 'student') router.replace('/student');
            else if (user.role === 'sponsor') router.replace('/sponsor');
            else if (user.role === 'school') router.replace('/school');
            else if (user.role === 'admin') router.replace('/admin');
            else router.replace('/auth/welcome');
          }
        }
      } catch (e) {
        // Ignore errors, stay on sign-in
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center w-full max-w-xl px-4">
        <motion.img
          src="/iSkolar_logo.png"
          alt="iSkolar Logo"
          className="mb-6 w-21 h-22 drop-shadow-lg animate-fade-in"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
        />
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold mb-4 text-indigo-900 tracking-tight animate-fade-in text-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          Welcome to iSkolar
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-indigo-700 mb-8 font-medium animate-fade-in text-center w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Connecting Students, Sponsors, and Schools
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full flex justify-center"
        >
          <Button
            onClick={() => router.push('/auth/role-selection')}
            size="lg"
            variant="outline"
            className="px-10 py-3 text-lg font-semibold rounded-full border-2 border-yellow-500 text-yellow-700 bg-transparent hover:bg-[#efa508] hover:text-white transition-all duration-300 ease-in-out shadow-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none cursor-pointer"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  );
}