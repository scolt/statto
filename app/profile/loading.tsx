export default function ProfileLoading() {
  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center">
      <main className="mx-auto w-full max-w-lg px-8 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="bg-muted h-7 w-32 animate-pulse rounded" />
          <div className="bg-muted h-8 w-28 animate-pulse rounded" />
        </div>

        <div className="rounded-lg border p-6 space-y-6">
          {/* Account section */}
          <div className="space-y-3">
            <div className="bg-muted h-4 w-20 animate-pulse rounded" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              </div>
            ))}
          </div>

          <div className="bg-border h-px" />

          {/* Player section */}
          <div className="space-y-3">
            <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
