import Link from 'next/link';
import {
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import JoinRequestForm from '@/components/landing/JoinRequestForm';
import { listPublishedCourses } from '@/lib/db/courses';
import { getSiteInfo } from '@/lib/wordpress';
import { APP_NAME, resolveLogoUrl } from '@/lib/branding';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const [siteInfo, courses] = await Promise.all([getSiteInfo(), listPublishedCourses().catch(() => [])]);
  const siteName = siteInfo.site_name || APP_NAME;
  const logoUrl = resolveLogoUrl(siteInfo.logo_url);
  const courseOptions = courses.map((c) => ({ id: c.id, title: c.title }));

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative px-4 sm:px-6 pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background" />
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <img
            src={logoUrl}
            alt={siteName}
            width={240}
            height={72}
            className="h-16 sm:h-20 w-auto object-contain mx-auto"
          />
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="pill mx-auto inline-flex items-center gap-2">
              <SparklesIcon className="w-3.5 h-3.5" />
              Evidence-based bodybuilding coaching
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Train smarter. Prep harder.{' '}
              <span className="text-accent">Build your best physique.</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              {siteInfo.site_description ||
                `${siteName} combines clinical insight with real-world bodybuilding experience — online courses, 1-on-1 mentorship, and exclusive member content for serious athletes.`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#apply"
              className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-soft-glow hover:opacity-90 transition"
            >
              Request mentorship or courses
            </a>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-8 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800/80 transition"
            >
              Member login
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-4 sm:px-6 py-16 sm:py-20 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="pill w-fit">About</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              The Bodybuilding Doctor approach
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Whether you&apos;re stepping on stage for the first time or refining your off-season,
              you get programming and guidance grounded in physiology — not bro-science. We focus on
              sustainable hypertrophy, intelligent prep, and long-term health.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Members get access to structured video courses, in-depth articles, and optional
              direct mentorship for athletes who want a coach in their corner.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: FireIcon, title: 'Training systems', desc: 'Periodized hypertrophy & strength blocks' },
              { icon: TrophyIcon, title: 'Contest prep', desc: 'Peak week strategy & posing fundamentals' },
              { icon: SparklesIcon, title: 'Nutrition', desc: 'Macro frameworks that fit your lifestyle' },
              { icon: UserGroupIcon, title: 'Community', desc: 'Articles & updates for active members' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-surface p-5">
                <Icon className="w-7 h-7 text-accent mb-3" />
                <h3 className="font-semibold text-slate-100 text-sm">{title}</h3>
                <p className="text-xs text-slate-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section id="offerings" className="px-4 sm:px-6 py-16 sm:py-20 bg-slate-950/40">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="pill mx-auto">Programs</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">How we work with you</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Choose the level of support that matches where you are in your journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-surface p-6 sm:p-8 space-y-4">
              <ChatBubbleLeftRightIcon className="w-9 h-9 text-accent" />
              <h3 className="text-xl font-semibold text-slate-100">1-on-1 mentorship</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Direct coaching for competitors and advanced lifters. Custom training, nutrition
                check-ins, prep adjustments, and accountability — built around your schedule and
                response to training.
              </p>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Personalized programming &amp; macro guidance</li>
                <li>• Regular check-ins and progress reviews</li>
                <li>• Contest prep &amp; peak-week support</li>
              </ul>
            </div>
            <div className="card-surface p-6 sm:p-8 space-y-4">
              <AcademicCapIcon className="w-9 h-9 text-accent" />
              <h3 className="text-xl font-semibold text-slate-100">Online courses</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Self-paced video courses covering hypertrophy fundamentals, advanced techniques, and
                specialized topics. Watch on your phone or desktop through our member app.
              </p>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Structured lesson modules with video content</li>
                <li>• Learn at your own pace</li>
                <li>• Enrollment granted by your administrator after approval</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Courses preview */}
      {courses.length > 0 && (
        <section id="courses" className="px-4 sm:px-6 py-16 sm:py-20 border-t border-slate-800/60">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="pill mx-auto">Course catalog</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Available courses</h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Request access below — we&apos;ll enroll you after reviewing your application.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.slice(0, 6).map((course) => (
                <article key={course.id} className="card-surface overflow-hidden flex flex-col">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt=""
                      className="w-full aspect-video object-cover border-b border-slate-800"
                    />
                  ) : (
                    <div className="aspect-video bg-slate-900 border-b border-slate-800 flex items-center justify-center">
                      <AcademicCapIcon className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col gap-2">
                    <span className="pill w-fit text-[10px] capitalize">{course.level}</span>
                    <h3 className="font-semibold text-slate-100">{course.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 flex-1">{course.description}</p>
                    <p className="text-xs text-slate-500">
                      {course.lessonCount} lessons · {course.category}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Apply */}
      <section id="apply" className="px-4 sm:px-6 py-16 sm:py-24 bg-slate-950/40">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="pill mx-auto">Get started</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Request mentorship or course access
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Fill out the form and we&apos;ll reach out to discuss the best fit for your goals.
            </p>
          </div>
          <JoinRequestForm courses={courseOptions} />
        </div>
      </section>
    </div>
  );
}
