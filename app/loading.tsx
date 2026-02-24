export default function HomeLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-muted h-8 w-16 animate-pulse rounded" />
          <div className="bg-muted h-8 w-16 animate-pulse rounded" />
        </div>
      </div>

      {/* Groups section skeleton */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-muted h-6 w-32 animate-pulse rounded" />
          <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted h-20 animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    </main>
  );
}
