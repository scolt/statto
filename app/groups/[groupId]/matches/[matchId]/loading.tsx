export default function MatchLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 sm:px-6">
          <div className="size-9 animate-pulse rounded-md bg-muted" />
          <div className="flex flex-1 items-center gap-2">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="size-9 animate-pulse rounded-md bg-muted" />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Date */}
        <div className="mb-4 h-4 w-48 animate-pulse rounded bg-muted" />

        {/* Timer */}
        <div className="mb-6 h-16 animate-pulse rounded-2xl bg-muted" />

        {/* Player stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-9 w-32 animate-pulse rounded-md bg-muted" />
          ))}
        </div>

        {/* Games */}
        <div className="mb-3 h-6 w-20 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}
