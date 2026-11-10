import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-b from-[#3FB2EC] to-[#CDEFFF] p-8 text-center">
      <div>
        <h1 className="display text-4xl text-white">Nothing hiding here!</h1>
        <Link href="/explore" className="mt-4 inline-block font-black text-purple underline">Back to Explore</Link>
      </div>
    </main>
  );
}
