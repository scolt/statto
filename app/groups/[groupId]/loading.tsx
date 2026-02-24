export default function GroupLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center gap-4">
        <div className="bg-muted size-9 animate-pulse rounded" />
        <div className="flex-1">
          <div className="bg-muted h-7 w-40 animate-pulse rounded" />
          <div className="bg-muted mt-1 h-4 w-64 animate-pulse rounded" />
        </div>
        <div className="bg-muted size-9 animate-pulse rounded" />
        <div className="bg-muted size-9 animate-pulse rounded" />
      </div>

      {/* Stats leaderboard skeleton */}
      <div className="mb-8">
        <div className="bg-muted h-10 w-full animate-pulse rounded-t-lg" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-muted/50 h-12 w-full animate-pulse border-t"
          />
        ))}
      </div>

      {/* Matches section skeleton */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-6 w-24 animate-pulse rounded" />
          <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted h-24 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
