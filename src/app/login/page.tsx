 "use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

const supabase = createClient();

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          router.push(callbackUrl);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, callbackUrl]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setError(error.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bebas-neue text-text mb-2">NexSleek</h1>
          <p className="text-muted">Watch movies the cinematic way</p>
        </div>

        <div className="bg-surface rounded-xl p-8 border border-surface">
          <h2 className="text-2xl font-bebas-neue text-text mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-6 p-4 bg-destructive/20 border border-destructive/50 rounded-lg" role="alert">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Email Login */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-surface rounded-lg py-3 pl-10 pr-4 text-text focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter your email"
                  aria-label="Email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-surface rounded-lg py-3 pl-10 pr-12 text-text focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter your password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors focus:outline-none focus:text-accent"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-text font-medium rounded-lg py-3 px-4 hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Sign in with email"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center mb-6">
            <div className="flex-1 border-t border-surface" />
            <span className="px-4 text-sm text-muted">or continue with</span>
            <div className="flex-1 border-t border-surface" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-surface/80 border border-surface rounded-lg py-3 px-4 hover:bg-surface hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            aria-label="Sign in with Google"
          >
            {googleLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span className="font-medium">Google</span>
          </button>

          <p className="mt-6 text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-accent hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
