"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
            T
          </div>
          <span className="text-2xl font-bold">Tech-Flow</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Organize your work, visually.
        </h1>
        <p className="text-gray-600 mb-8">
          A simple Trello-style task board — create boards, lists, and cards,
          then drag and drop to stay organized.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg border border-gray-300 font-medium hover:bg-gray-100 transition"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
