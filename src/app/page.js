import Link from 'next/link';
import { ArrowRight, BookOpen, Video, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate pt-14 text-center">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}} />
        </div>
        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Master New Skills with Built-in Progression
              </h1>
              <p className="mt-6 text-lg tracking-tight text-gray-600 sm:text-xl/8">
                Explore a premium catalog of curated video content. Watch, learn, and unlock your path to mastery step-by-step. Let ElevateLMS be your companion to success.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/courses"
                  className="rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all flex items-center gap-2"
                >
                  Explore Courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/register" className="text-sm/6 font-semibold text-gray-900 transition-colors hover:text-blue-600">
                  Become a Teacher <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-blue-600">Learn Faster</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
            Everything you need to succeed
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            A dynamic pipeline ensuring focus. Don't skip ahead—prove you understand by completing each video before the next unlocks.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {[
              {
                name: 'Curated Playlists',
                description: 'Expert teachers meticulously organize YouTube videos into logical learning paths.',
                icon: BookOpen,
              },
              {
                name: 'Progressive Unlocking',
                description: 'Stay focused. The next lesson remains locked until you complete the current one.',
                icon: Video,
              },
              {
                name: 'Track Your Mastery',
                description: 'View your progress on the dashboard and pick up exactly where you left off.',
                icon: Award,
              },
            ].map((feature) => (
              <div key={feature.name} className="flex flex-col items-center text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-blue-600/10">
                  <feature.icon aria-hidden="true" className="size-8 text-blue-600" />
                </div>
                <dt className="text-xl font-semibold text-gray-900">{feature.name}</dt>
                <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
