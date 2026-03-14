import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) navigate("/");
    else toast.error("Login failed");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 overflow-hidden">
  
      {/* Background glow blobs */}
      <div className="absolute w-[700px] h-[700px] bg-purple-300/60 blur-[120px] rounded-full -top-40 -left-40"></div>
      <div className="absolute w-[600px] h-[600px] bg-blue-300/60 blur-[120px] rounded-full -bottom-40 -right-40"></div>
  
      <div className="relative w-full max-w-sm bg-white p-10 rounded-2xl shadow-2xl border border-gray-200 backdrop-blur-md animate-in fade-in zoom-in duration-300">
  
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 mb-4 shadow-md">
            <Package className="h-6 w-6 text-white" />
          </div>
  
          <h1 className="text-2xl font-semibold text-gray-900">
            Sign in to StockVerse
          </h1>
  
          <p className="text-sm text-gray-500 mt-2">
            Enter your credentials to continue
          </p>
        </div>
  
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              maxLength={254}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              maxLength={128}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-[1.04] text-white"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

        </form>

        <div className="mt-5 text-center text-sm">
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-2 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;