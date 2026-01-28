import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full space-y-8 text-center">
        <div className="pill mx-auto">Members Only Media Channel</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Elite bodybuilding content, exclusively for club members.
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Log in to access high-level training breakdowns, posing tutorials, and prep
          insights powered by our WordPress media channel.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-soft-glow hover:bg-accent/90 transition"
          >
            Login to view content
          </Link>
          <Link
            href="/register"
            className="inline-flex justify-center rounded-full border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900/80 transition"
          >
            Join the club
          </Link>
        </div>
      </div>
    </div>
  );
}

