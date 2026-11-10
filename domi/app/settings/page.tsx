"use client";
/**
 * Settings: opened from the gear in the header (replaces the old "Saved" chip once signed in).
 * Profile, game preferences, privacy, help and account (sign out / delete).
 * Prototype: everything is stored on the device; Supabase would mirror it to the account.
 */
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Button from "@/components/Button";
import Domi from "@/components/Domi";
import Sheet from "@/components/Sheet";
import { BackIcon, ChevronRight } from "@/components/Icons";
import { getDomiById, getDomiBySlug } from "@/lib/data";
import { deleteEverything, getSettings, isLoggedIn, setSetting, signOut, update, useLocal, type Settings } from "@/lib/store";

export default function SettingsPage() {
  return <Suspense><SettingsScreen /></Suspense>;
}

const PROVIDER: Record<string, string> = { google: "Google", apple: "Apple", email: "email" };

function SettingsScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const back = params.get("back") ?? "/my-domis";
  const local = useLocal();
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState<"signout" | "delete" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  if (!local) return <main className="h-dvh bg-offwhite" />;

  const settings = getSettings(local);
  const loggedIn = isLoggedIn(local);
  const owned = local.collection.map((c) => getDomiById(c.domi_id)).filter(Boolean);
  const avatar = (settings.avatar && getDomiBySlug(settings.avatar)) || owned[owned.length - 1] || getDomiBySlug("classic");
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 1800); };
  const toggle = (k: keyof Settings, label: string) => (v: boolean) => { setSetting(k, v as never); flash(`${label} ${v ? "on" : "off"}`); };

  const download = () => {
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), ...local }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-domi-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-offwhite">
      <div className="h-full overflow-y-auto pb-10">
        <header className="pt-safe flex items-center gap-3 bg-gradient-to-b from-[#3FB2EC] to-[#7FCDF3] px-4 pb-5">
          <button onClick={() => router.push(back)} aria-label="Back" className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-navy shadow-[0_3px_0_rgba(0,0,0,.12)]">
            <BackIcon />
          </button>
          <h1 className="display text-[30px] text-white drop-shadow-[0_3px_0_rgba(0,80,130,.35)]">Settings</h1>
        </header>

        {/* Profile */}
        <section className="mx-4 -mt-1 flex items-center gap-3 rounded-[24px] bg-white p-4 shadow-[0_4px_0_#DCE3EA]">
          <div className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-purple-light/60">
            <Domi domi={avatar} size={52} tappable={false} shadow={false} pose="still" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="display truncate text-[20px] leading-tight">{local.guest.nickname}</p>
            <p className="text-[13px] font-bold text-navy/60">
              {loggedIn ? `Signed in with ${PROVIDER[local.guest.provider] ?? "email"}` : "Not signed in · saved on this phone"}
            </p>
            <p className="text-[13px] font-bold text-navy/60">{local.collection.length} Domis collected</p>
          </div>
          {loggedIn ? (
            <button onClick={() => setEdit(true)} className="chunky h-10 shrink-0 rounded-full bg-white px-4 text-[14px] font-black text-purple ring-2 ring-purple-light" style={{ ["--btn-edge" as string]: "#EBD3F2", borderRadius: 999 }}>Edit</button>
          ) : (
            <Link href={`/save?mode=login&next=${encodeURIComponent("/settings")}`} className="chunky h-10 shrink-0 rounded-full bg-purple px-4 py-2.5 text-[14px] font-black text-white" style={{ ["--btn-edge" as string]: "#5C2470", borderRadius: 999 }}>Sign in</Link>
          )}
        </section>

        <Group title="Game">
          <Toggle label="Sound effects" on={settings.sound} onChange={toggle("sound", "Sound")} />
          <Toggle label="Reduce motion" sub="Fewer bounces and animations" on={settings.reduceMotion} onChange={toggle("reduceMotion", "Reduce motion")} />
        </Group>

        <Group title="Privacy">
          <Row label="Camera" value="Only for Domi QR codes" />
          <Row label="Download my data" chevron onClick={download} />
          <Row label="Privacy policy" chevron onClick={() => flash("Coming soon")} />
        </Group>

        <Group title="Help">
          <Row label="Replay the walkthrough" chevron onClick={() => { update((s) => ({ ...s, coachSeen: false })); router.push("/my-domis"); }} />
          <Row label="Contact The Tech" chevron onClick={() => flash("Coming soon")} />
        </Group>

        {loggedIn ? (
          <Group title="Account">
            <Row label="Sign out" chevron onClick={() => setConfirm("signout")} />
            <Row label="Delete account" danger chevron onClick={() => setConfirm("delete")} />
          </Group>
        ) : (
          <Group title="This phone">
            <Row label="Erase my Domis on this phone" danger chevron onClick={() => setConfirm("delete")} />
          </Group>
        )}

        <p className="mt-6 text-center text-[12px] font-bold text-navy/40">Domi prototype · The Tech Interactive</p>
      </div>

      <EditProfile open={edit} onClose={() => setEdit(false)} nickname={local.guest.nickname} avatar={avatar?.slug} owned={owned.map((d) => d!.slug)} onSaved={() => flash("Profile saved")} />

      <Sheet open={confirm !== null} onClose={() => setConfirm(null)} title={confirm === "signout" ? "Sign out?" : loggedIn ? "Delete account?" : "Erase your Domis?"}>
        <div className="space-y-3 pb-4">
          <p className="font-bold text-navy/70">
            {confirm === "signout" ? "Your Domis stay safe in your account. Sign in again any time." : "This removes all your Domis and progress. You can't undo it."}
          </p>
          {confirm === "signout" ? (
            <Button color="purple" onClick={() => { signOut(); setConfirm(null); router.push(back); }}>Sign out</Button>
          ) : (
            <Button color="pink" onClick={() => { deleteEverything(); setConfirm(null); router.push("/explore"); }}>{loggedIn ? "Delete account" : "Erase"}</Button>
          )}
          <Button color="grey" variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
        </div>
      </Sheet>

      <AnimatePresence>
        {toast && (
          <motion.p
            className="pointer-events-none absolute inset-x-0 bottom-8 z-50 mx-auto w-fit rounded-full bg-navy px-4 py-2 text-sm font-black text-white shadow-lg"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-4 mt-6">
      <h2 className="px-1 pb-2 text-xs font-black uppercase tracking-[0.14em] text-navy/50">{title}</h2>
      <div className="divide-y-2 divide-offwhite overflow-hidden rounded-[22px] bg-white shadow-[0_4px_0_#DCE3EA]">{children}</div>
    </section>
  );
}

function Toggle({ label, sub, on, onChange }: { label: string; sub?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left">
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-black">{label}</span>
        {sub && <span className="block text-[13px] font-bold text-navy/55">{sub}</span>}
      </span>
      <span className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors ${on ? "bg-green" : "bg-navy/20"}`}>
        <motion.span className="absolute top-1 h-6 w-6 rounded-full bg-white shadow" animate={{ left: on ? 24 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      </span>
    </button>
  );
}

function Row({ label, value, chevron, danger, onClick }: { label: string; value?: string; chevron?: boolean; danger?: boolean; onClick?: () => void }) {
  const inner = (
    <>
      <span className={`min-w-0 flex-1 text-[16px] font-black ${danger ? "text-pink" : ""}`}>{label}</span>
      {value && <span className="text-[13px] font-bold text-navy/55">{value}</span>}
      {chevron && <ChevronRight size={18} className="text-navy/30" />}
    </>
  );
  return onClick ? (
    <button onClick={onClick} className="flex min-h-[56px] w-full items-center gap-3 px-4 text-left">{inner}</button>
  ) : (
    <div className="flex min-h-[56px] items-center gap-3 px-4">{inner}</div>
  );
}

function EditProfile({ open, onClose, nickname, avatar, owned, onSaved }: { open: boolean; onClose: () => void; nickname: string; avatar?: string; owned: string[]; onSaved: () => void }) {
  const [name, setName] = useState(nickname);
  const [pick, setPick] = useState(avatar);
  return (
    <Sheet open={open} onClose={onClose} title="Edit profile">
      <form
        className="space-y-4 pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          update((s) => ({ ...s, guest: { ...s.guest, nickname: name.trim() || s.guest.nickname }, settings: { ...getSettings(s), avatar: pick } }));
          onSaved();
          onClose();
        }}
      >
        <label className="block">
          <span className="text-sm font-black text-navy/60">Nickname</span>
          <input
            value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} maxLength={20}
            className="mt-1 h-14 w-full rounded-2xl border-[3px] border-purple-light px-4 text-lg font-bold outline-none focus:border-purple"
          />
        </label>
        <div>
          <span className="text-sm font-black text-navy/60">Profile Domi</span>
          <div className="scroll-x -mx-5 mt-2 flex gap-2 px-5 pb-1">
            {owned.map((slug) => (
              <button
                type="button" key={slug} onClick={() => setPick(slug)} aria-pressed={pick === slug} aria-label={getDomiBySlug(slug)?.name}
                className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${pick === slug ? "bg-purple-light ring-[3px] ring-purple" : "bg-offwhite"}`}
              >
                <Domi domi={getDomiBySlug(slug)} size={44} tappable={false} shadow={false} pose="still" />
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" color="purple">Save</Button>
      </form>
    </Sheet>
  );
}
