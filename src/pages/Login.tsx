import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Facebook,
  Linkedin,
  Github,
} from "lucide-react";

export function LoginPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);

      if (success) {
        if (rememberMe) {
          localStorage.setItem("rememberLogin", "true");
        } else {
          localStorage.removeItem("rememberLogin");
        }

        const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
        sessionStorage.removeItem("redirectAfterLogin");

        if (redirectUrl && redirectUrl !== "/login") {
          navigate(redirectUrl);
        } else {
          navigate("/");
        }
      } else {
        setError("Invalid email or password");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full bg-[#0a1720] flex items-center justify-center px-0 py-0 sm:px-4 sm:py-8",
        className,
      )}
      {...props}
    >
      {/* Box */}
      <div className="min-h-screen w-screen max-w-none overflow-hidden rounded-none border border-white/10 bg-[#0f1117] shadow-2xl shadow-black/40 sm:min-h-0 sm:w-full sm:max-w-sm sm:rounded-[36px]">
        {/* Top Blue Section */}
        <div className="relative overflow-hidden rounded-b-[36px] bg-gradient-to-r from-[#021c2b] via-[#063852] to-[#045b82] px-6 pt-8 pb-8 text-white">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Hello, Welcome
            </h1>

            <button
              type="button"
              className="mt-6 inline-flex h-12 min-w-[190px] items-center justify-center rounded-full border-2 border-white/80 bg-transparent px-8 text-lg font-semibold text-white transition hover:bg-white/10"
            >
              Login
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-[#f4f7fb] px-6 pb-8 text-[#111827] dark:bg-[#0f1117] dark:text-white">
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {successMessage && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="h-14 rounded-xl border-0 bg-[#e8edf3] pl-12 pr-5 text-base text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-[#10c4f4] dark:bg-[#1a2230] dark:text-white dark:placeholder:text-gray-400"
              />
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700 dark:text-gray-300" />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="h-14 rounded-xl border-0 bg-[#e8edf3] pl-12 pr-12 text-base text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-[#10c4f4] dark:bg-[#1a2230] dark:text-white dark:placeholder:text-gray-400"
              />
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700 dark:text-gray-300" />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 transition hover:text-black dark:text-gray-300 dark:hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-[#14c9f7] focus:ring-2 focus:ring-[#10c4f4] transition-transform duration-150 checked:scale-110 dark:border-gray-600"
                />
                Remember for 30 days
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white underline"
              >
                Forgot Password
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-14 w-full rounded-full border-0 bg-gradient-to-r from-[#021c2b] via-[#064664] to-[#14c9f7] text-lg font-bold text-white shadow-lg hover:opacity-95"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-gray-300 dark:bg-white/20"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Or Login With
              </span>
              <div className="h-px flex-1 bg-gray-300 dark:bg-white/20"></div>
            </div>

            {/* Social */}
            <div className="grid grid-cols-4 gap-4 pt-1">
              <button className="flex h-14 items-center justify-center rounded-xl border border-gray-300 bg-white text-black transition hover:bg-gray-100 dark:border-white/15 dark:bg-[#151c28] dark:text-white dark:hover:bg-[#1b2433]">
                <span className="text-3xl font-bold">G</span>
              </button>

              <button className="flex h-14 items-center justify-center rounded-xl border border-gray-300 bg-white dark:border-white/15 dark:bg-[#151c28]">
                <Facebook className="h-7 w-7" />
              </button>

              <button className="flex h-14 items-center justify-center rounded-xl border border-gray-300 bg-white dark:border-white/15 dark:bg-[#151c28]">
                <Github className="h-7 w-7" />
              </button>

              <button className="flex h-14 items-center justify-center rounded-xl border border-gray-300 bg-white dark:border-white/15 dark:bg-[#151c28]">
                <Linkedin className="h-7 w-7" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
