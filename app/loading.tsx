export default function HomeLoading() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Header skeleton */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          <div className="flex gap-1">
            <div className="size-9 animate-pulse rounded-md bg-muted" />
            <div className="size-9 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Welcome skeleton */}
        <section className="mb-8">
          <div className="mb-1 h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-44 animate-pulse rounded bg-muted" />
        </section>

        {/* Groups skeleton */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-28 animate-pulse rounded bg-muted" />
            <div className="size-9 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
