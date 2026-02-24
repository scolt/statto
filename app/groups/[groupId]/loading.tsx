export default function GroupLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 sm:px-6">
          <div className="size-9 animate-pulse rounded-md bg-muted" />
          <div className="flex-1">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="size-9 animate-pulse rounded-md bg-muted" />
          <div className="size-9 animate-pulse rounded-md bg-muted" />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Description */}
        <div className="mb-6 h-4 w-3/4 animate-pulse rounded bg-muted" />

        {/* Stats skeleton */}
        <div className="mb-8 space-y-1">
          <div className="h-10 w-full animate-pulse rounded-t-xl bg-muted" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 w-full animate-pulse rounded bg-muted/60"
            />
          ))}
        </div>

        {/* Matches skeleton */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-20 animate-pulse rounded bg-muted" />
            <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
