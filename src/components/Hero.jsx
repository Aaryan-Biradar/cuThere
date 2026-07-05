import { DEFAULT_EVENT_IMAGE } from '@/lib/client/copy';

export default function Hero() {
  return (
    <section className="relative h-[33dvh] min-h-[200px] w-full overflow-hidden sm:min-h-[95dvh] sm:h-[100dvh] sm:overflow-visible">
      {/* 1. Base Image — cover fills frame; sm+: tall hero band (95dvh) */}
      <img
        src={DEFAULT_EVENT_IMAGE}
        alt="Carleton University campus"
        className="absolute inset-0 z-0 h-full w-full object-cover object-[center_35%] sm:object-center"
      />

      {/* Mobile: copy toward bottom; sm+: black box nudged slightly up vs prior translate */}
      <div className="relative z-10 mx-auto flex h-full min-h-0 max-w-7xl flex-col px-4 pt-[calc(env(safe-area-inset-top)+4rem)] pb-4 sm:px-6 sm:pb-14 sm:pt-28 md:px-10 md:pb-16 md:pt-36">
        <div className="flex min-h-0 flex-1 flex-col items-start justify-end text-left">
          <div className="w-full max-w-xl -translate-y-4 rounded-2xl bg-black/50 px-6 py-7 shadow-lg backdrop-blur-[1px] sm:max-w-2xl sm:translate-y-5 sm:px-10 sm:py-10 md:translate-y-6 md:px-12 md:py-12">
            <h1 className="text-2xl font-bold leading-tight tracking-[-0.01em] text-white sm:text-5xl sm:leading-[1.1] md:text-6xl lg:text-5xl">
              Discover the Best{' '}
              <br className="hidden sm:block" />
              of Carleton.
            </h1>

            <p className="mt-3 max-w-lg line-clamp-3 text-sm font-medium leading-snug text-white/95 sm:mt-6 sm:line-clamp-none sm:text-lg md:text-xl">
              From the tunnels to the quad, stay in the loop <br className="sm:hidden" /> with everything happening across campus.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
