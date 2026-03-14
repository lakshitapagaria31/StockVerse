import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Enter your email"); return; }
    toast.success("OTP sent to your email");
    setStep("otp");
  };

  const handleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) { toast.error("Enter the OTP"); return; }
    setStep("reset");
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }
    toast.success("Password reset successfully");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary mb-3">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Reset Password</h1>
        </div>

        {step === "email" && (
          <form onSubmit={handleEmail} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" maxLength={254} />
            </div>
            <Button type="submit" className="w-full">Send OTP</Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtp} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Enter the code sent to {email}</p>
            <div className="space-y-2">
              <Label>OTP Code</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="Enter 6-digit code" maxLength={6} />
            </div>
            <Button type="submit" className="w-full">Verify</Button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 8 characters" maxLength={128} />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" maxLength={128} />
            </div>
            <Button type="submit" className="w-full">Reset Password</Button>
          </form>
        )}

        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
