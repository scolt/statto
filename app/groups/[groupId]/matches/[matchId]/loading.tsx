export default function MatchLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center gap-4">
        <div className="bg-muted size-9 animate-pulse rounded" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="bg-muted h-7 w-32 animate-pulse rounded" />
            <div className="bg-muted h-5 w-20 animate-pulse rounded-full" />
          </div>
          <div className="bg-muted mt-1 h-4 w-48 animate-pulse rounded" />
        </div>
        <div className="bg-muted size-9 animate-pulse rounded" />
      </div>

      {/* Timer skeleton */}
      <div className="bg-muted mb-6 h-12 w-full animate-pulse rounded-lg" />

      {/* Player stats skeleton */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-muted h-16 animate-pulse rounded-lg"
          />
        ))}
      </div>

      {/* Actions skeleton */}
      <div className="mb-6 flex gap-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-muted h-10 w-28 animate-pulse rounded"
          />
        ))}
      </div>

      {/* Games skeleton */}
      <section>
        <div className="bg-muted mb-3 h-6 w-24 animate-pulse rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted h-16 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
