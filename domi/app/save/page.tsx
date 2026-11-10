"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Domi from "@/components/Domi";
import Button from "@/components/Button";
import { Clouds, Sparkles } from "@/components/Scenery";
import { AppleIcon, GoogleIcon, MailIcon } from "@/components/Icons";
import { getDomiBySlug } from "@/lib/data";
import { update, useLocal } from "@/lib/store";
import type { Guest } from "@/lib/types";

export default function SavePage() {
  return <Suspense><Save /></Suspense>;
}

function Save() {
  const router = useRouter();
  const params = useSearchParams();
  const local = useLocal();
  // Two modes: new here (save your Domis) or already have an account on another phone (sign in).
  const [login, setLogin] = useState(params.get("mode") === "login");
  const next = params.get("next") ?? "/explore";
  const [restored, setRestored] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const count = local?.collection.length ?? 0;

  // Prototype only: pretend auth succeeded. Supabase Auth plugs in here (see README).
  const signIn = (provider: Guest["provider"]) => {
    update((s) => ({ ...s, savePromptSeen: true, welcomed: true, guest: { ...s.guest, provider, nickname: "Explorer" } }));
    // User flow: "Domis restored · back where they were" (returning visitor) or "Domis saved to account".
    setRestored(true);
    setTimeout(() => router.push(next), 1400);
  };
  const later = () => {
    update((s) => ({ ...s, savePromptSeen: true, welcomed: true }));
    router.push(next);
  };

  if (restored) {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-clip bg-gradient-to-b from-purple to-[#B35BCB] px-8 text-center text-white">
        <Sparkles count={10} color="#FED602" seed={12} />
        <motion.div initial={{ scale: 0.5, y: 40 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 12 }}>
          <Domi domi={getDomiBySlug("happy")} size={150} pose="wave" />
        </motion.div>
        <h1 className="display mt-4 text-[34px] leading-tight">{login ? "Welcome back!" : "Domis saved!"}</h1>
        <p className="mt-2 text-lg font-bold text-white/85">{login ? "Your Domis are back." : "They're safe now."}</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-clip bg-gradient-to-b from-purple to-[#B35BCB] text-white md:px-[max(0px,calc(50%-300px))]">
      <Clouds count={2} top={330} spread={90} />
      <Sparkles count={8} color="#FED602" seed={11} />

      {/* Domi peeking in from the right edge */}
      <motion.div
        className="absolute right-0 top-[27%] z-10"
        initial={{ x: 200, rotate: -40 }}
        animate={{ x: 52, rotate: -24 }}
        transition={{ type: "spring", stiffness: 120, damping: 11, delay: 0.3 }}
      >
        <Domi domi={getDomiBySlug("heart")} size={170} shadow={false} pose="idle" />
      </motion.div>

      <div className="pt-safe relative z-10 flex-1 px-6 pt-24">
        <h1 className="display max-w-[240px] text-[42px] leading-[1.02]">{login ? "Welcome back!" : "Save your Domis"}</h1>
        <p className="mt-3 max-w-[250px] text-lg font-bold text-white/85">
          {login ? "Sign in to get your Domis back." : count ? `Don't lose your ${count} Domi${count === 1 ? "" : "s"}.` : "So they're never lost."}
        </p>
      </div>

      <div className="pb-safe relative z-10 space-y-3 rounded-t-[32px] bg-white px-5 pb-6 pt-6 text-navy">
        <AuthButton onClick={() => signIn("google")} icon={<GoogleIcon />} label="Continue with Google" />
        <AuthButton onClick={() => signIn("apple")} icon={<AppleIcon />} label="Continue with Apple" dark />
        <AnimatePresence initial={false} mode="wait">
          {email === null ? (
            <motion.div key="btn" exit={{ opacity: 0 }}>
              <AuthButton onClick={() => setEmail("")} icon={<MailIcon />} label="Continue with email" />
            </motion.div>
          ) : sent ? (
            <motion.p key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-green/15 p-4 text-center font-bold">
              Check your inbox for a magic link!
              <button onClick={() => signIn("email")} className="mt-2 block w-full text-sm font-black text-purple underline">(Prototype: pretend I clicked it)</button>
            </motion.p>
          ) : (
            <motion.form key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <input
                type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" aria-label="Email"
                className="h-[54px] min-w-0 flex-1 rounded-2xl border-[3px] border-purple-light px-4 text-lg font-bold outline-none focus:border-purple"
              />
              <Button type="submit" color="purple" full={false}>Send</Button>
            </motion.form>
          )}
        </AnimatePresence>
        <p className="pt-1 text-center text-[16px] font-bold text-navy/60">
          {login ? "New here? " : "Already have an account? "}
          <button onClick={() => { setLogin(!login); setEmail(null); setSent(false); }} className="font-black text-purple underline">
            {login ? "Create one" : "Sign in"}
          </button>
        </p>
        <Button onClick={later} variant="secondary" color="grey">{login ? "Not now" : "Maybe later"}</Button>
      </div>
    </main>
  );
}

function AuthButton({ onClick, icon, label, dark }: { onClick: () => void; icon: React.ReactNode; label: string; dark?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`chunky flex h-[54px] w-full items-center justify-center gap-3 text-[18px] ${dark ? "bg-black text-white" : "border-2 border-[#DCDFE2] bg-white text-navy"}`}
      style={{ ["--btn-edge" as string]: dark ? "#3B4650" : "#DCDFE2" }}
    >
      {icon}
      {label}
    </button>
  );
}
