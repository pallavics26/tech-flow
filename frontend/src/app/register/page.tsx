"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex bg-white dark:bg-canvas-dark">
      {/* Form panel (left this time, for variety) */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 order-2 lg:order-1">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">
              T
            </div>
            <Link href="/" className="text-2xl font-bold dark:text-gray-100">
              Tech-Flow
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold dark:text-gray-100">
              Create your account
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Start organizing your work in minutes.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm dark:shadow-none space-y-4"
          >
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Pallavi Sharma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-60 shadow-sm"
            >
              {submitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right branding panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-bl from-violet-600 via-brand-600 to-brand-500 items-center justify-center p-12 order-1 lg:order-2">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-white max-w-md">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl font-bold mb-6">
            T
          </div>
          <h1 className="text-3xl font-bold mb-3">
            Join thousands organizing smarter.
          </h1>
          <p className="text-white/80 leading-relaxed">
            Create boards, invite your team, and watch tasks move in real time
            — no setup, no friction.
          </p>
        </div>
      </div>
    </main>
  );
}