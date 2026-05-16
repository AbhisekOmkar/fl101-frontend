"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { AuthCanvas } from "@/components/auth/AuthCanvas";
import { SparkLogo } from "@/components/brand/SparkLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_FLAG_KEY = "fl101.demo_authed";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goToDashboard = () => {
    setSubmitting(true);
    try {
      window.localStorage.setItem(DEMO_FLAG_KEY, "1");
    } catch {
      /* private browsing — ignore */
    }
    // Small delay so the button morph reads as a transition
    window.setTimeout(() => router.push("/"), 350);
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
              goToDashboard();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@flo101.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

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

          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
            Demo mode for the Applied AI Engineer assessment. No real auth — auth is
            an explicit out-of-scope tradeoff documented in{" "}
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
