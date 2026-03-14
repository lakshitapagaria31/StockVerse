import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/services/api";
import { BrandLogo } from "@/components/BrandLogo";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const isValidEmail = (value: string) => /^(?!\.)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, secondsLeft]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Enter your email"); return; }
    if (!isValidEmail(email.trim())) { toast.error("Please enter a valid email address"); return; }
    setIsSubmitting(true);
    try {
      const response = await api.auth.requestPasswordResetOtp({ email: email.trim() });
      setSecondsLeft(response.expires_in_seconds ?? 30);
      setDevOtp(response.otp ?? null);
      toast.success(response.message || "OTP sent to your email");
      setStep("otp");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedOtp = otp.trim();
    if (!normalizedOtp) { toast.error("Enter the OTP"); return; }
    if (!/^\d{6}$/.test(normalizedOtp)) { toast.error("OTP must be a 6-digit code"); return; }
    if (secondsLeft === 0) { toast.error("OTP expired. Request a new OTP."); return; }

    setIsSubmitting(true);
    try {
      await api.auth.verifyPasswordResetOtp({ email: email.trim(), otp: normalizedOtp });
      toast.success("OTP verified");
      setStep("reset");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if (secondsLeft === 0) { toast.error("OTP expired. Request a new OTP."); return; }

    setIsSubmitting(true);
    try {
      await api.auth.confirmPasswordReset({
        email: email.trim(),
        otp: otp.trim(),
        new_password: password,
      });
      toast.success("Password reset successfully");
      setStep("email");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      setDevOtp(null);
      setSecondsLeft(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim() || !isValidEmail(email.trim())) {
      toast.error("Enter a valid email first");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.auth.requestPasswordResetOtp({ email: email.trim() });
      setSecondsLeft(response.expires_in_seconds ?? 30);
      setDevOtp(response.otp ?? null);
      toast.success("A new OTP has been sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <BrandLogo className="mb-3" compact />
          <h1 className="text-xl font-semibold text-foreground">Reset Password</h1>
        </div>

        {step === "email" && (
          <form onSubmit={handleEmail} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" maxLength={254} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtp} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Enter the code sent to {email}</p>
            <div className="space-y-2">
              <Label>OTP Code</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="Enter 6-digit code" maxLength={6} />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {secondsLeft > 0 ? `OTP expires in ${secondsLeft}s` : "OTP expired"}
            </p>
            {devOtp && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                Dev OTP: <span className="font-semibold">{devOtp}</span>
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
            <Button type="button" variant="outline" className="w-full" disabled={isSubmitting || secondsLeft > 0} onClick={handleResendOtp}>
              {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend OTP"}
            </Button>
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
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
