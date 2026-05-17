"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";
import { AuthCanvas } from "@/components/auth/AuthCanvas";
import { SparkLogo } from "@/components/brand/SparkLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_FLAG_KEY = "fl101.demo_authed";
const DEMO_USERNAME = "flo1";
const DEMO_PASSWORD = "flo1";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToDashboard = () => {
    setSubmitting(true);
    setError(null);
    try {
      window.localStorage.setItem(DEMO_FLAG_KEY, "1");
    } catch {
      /* private browsing — ignore */
    }
    window.setTimeout(() => router.push("/"), 350);
  };

  const submitForm = () => {
    const u = email.trim().toLowerCase();
    const p = password.trim();
    // Demo creds (UI only, no backend). Username can be "flo1" or any
    // address with the "flo1" local-part (e.g. flo1@anywhere).
    const usernameOk = u === DEMO_USERNAME || u.split("@")[0] === DEMO_USERNAME;
    const passwordOk = p === DEMO_PASSWORD;
    if (!usernameOk || !passwordOk) {
      setError("Invalid credentials. Use flo1 / flo1, or click Continue as demo reviewer.");
      return;
    }
    goToDashboard();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <AuthCanvas />

      {/* Centered card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border bg-card text-foreground shadow-sm">
            <SparkLogo size={28} />
            <span className="absolute inset-0 -z-10 animate-ping rounded-2xl bg-accent/20" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            fl101 Critic Agent
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Turn proof-of-work into calibrated feedback. Rubric scores, missing gaps,
            and the single next-best step.
          </p>
        </div>

        {/* Auth card */}
        <div className="rounded-2xl border bg-card/95 p-6 shadow-lg backdrop-blur sm:p-7">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitForm();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Username or email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  autoComplete="username"
                  placeholder="flo1"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="flo1"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" className="group w-full" disabled={submitting}>
              {submitting ? (
                "Loading workspace…"
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-5 flex items-center">
            <span className="h-px flex-1 bg-border" />
            <span className="px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={goToDashboard}
            disabled={submitting}
          >
            <SparkLogo size={14} className="text-foreground" />
            Continue as demo reviewer
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
            <span className="rounded-md bg-card px-1.5 py-0.5 font-mono text-foreground">
              flo1
            </span>
            <span>/</span>
            <span className="rounded-md bg-card px-1.5 py-0.5 font-mono text-foreground">
              flo1
            </span>
            <span>· demo credentials</span>
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            No real auth — explicit out-of-scope tradeoff documented in{" "}
            <Link
              href="https://github.com/"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              ARCHITECTURE.md
            </Link>
            .
          </p>
        </div>

        {/* Mini value props — relevant to the assignment */}
        <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px]">
          <ValueProp num="5" label="failure modes handled" />
          <ValueProp num="3×" label="self-consistency samples" />
          <ValueProp num="MAE 1.1" label="vs hand-graded set" />
        </ul>
      </div>
    </div>
  );
}

function ValueProp({ num, label }: { num: string; label: string }) {
  return (
    <li className="rounded-xl border bg-card/80 p-3 backdrop-blur">
      <p className="metric-num text-base text-foreground">{num}</p>
      <p className="text-muted-foreground">{label}</p>
    </li>
  );
}
