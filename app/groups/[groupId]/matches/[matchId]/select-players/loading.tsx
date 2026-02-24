export default function SelectPlayersLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center gap-4">
        <div className="bg-muted size-9 animate-pulse rounded" />
        <div>
          <div className="bg-muted h-7 w-36 animate-pulse rounded" />
          <div className="bg-muted mt-1 h-4 w-60 animate-pulse rounded" />
        </div>
      </div>

      {/* Player checkboxes skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="bg-muted size-5 animate-pulse rounded" />
            <div className="bg-muted h-5 w-32 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <div className="mt-6">
        <div className="bg-muted h-10 w-40 animate-pulse rounded" />
      </div>
    </main>
  );
}
