'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { useEffect } from 'react';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '/modules';
  const { signup, loading, user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // if (!loading && user) {
  //   router.replace('/login')
  //   // router.replace(next);
  // }

  useEffect(() => {
  if (!loading && user) {
    router.replace('/login');
  }
}, [loading, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(email.trim(), password, fullName.trim() || undefined);
      router.replace('/login');
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex"
        style={{ height: '600px' }}
      >
        {/* LEFT SIDE - Blue Panel with Image */}
        <div className="w-1/2 bg-blue-600 text-white flex flex-col items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <div className="relative w-full max-w-md">
              <Image
                src="/images/login_signup_img.png"
                alt="Skillentia - The Future of Learning Has a Face"
                width={400}
                height={320}
                className="w-full h-auto object-contain rounded-3xl"
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE - Signup Form */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign up</h1>
            <p className="text-gray-600 mb-8">Create your account to get started</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Full Name Field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name (optional)"
                  className="w-full rounded-full bg-gray-100 pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-300"
                />
              </div>

              {/* Email Field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-full bg-gray-100 pl-12 pr-4 py-3.5 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-300"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (at least 8 characters)"
                  className="w-full rounded-full bg-gray-100 pl-12 pr-12 py-3.5 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border-0 transition-all duration-300"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Sign Up Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white rounded-full py-3.5 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
              >
                {submitting ? 'Creating account...' : 'Sign up'}
              </motion.button>

              {/* Divider */}
              <div className="relative flex items-center gap-4 py-2">
                <div className="flex-1 border-t border-gray-300" />
                <span className="text-sm text-gray-500">Or</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href={`/login?next=${encodeURIComponent(next)}`}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}