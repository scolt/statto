export default function ProfileLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4 sm:px-6">
          <div className="size-9 animate-pulse rounded-md bg-muted" />
          <div className="ml-2 h-5 w-16 animate-pulse rounded bg-muted" />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Avatar + name */}
        <section className="mb-8 flex items-center gap-4">
          <div className="size-16 animate-pulse rounded-full bg-muted sm:size-20" />
          <div>
            <div className="mb-2 h-6 w-36 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        </section>

        {/* Edit profile card */}
        <section className="mb-6 rounded-2xl border p-5 sm:p-6">
          <div className="mb-4 h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          </div>
        </section>

        {/* Account info card */}
        <section className="mb-6 rounded-2xl border p-5 sm:p-6">
          <div className="mb-4 h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-9 animate-pulse rounded-lg bg-muted" />
                <div>
                  <div className="mb-1 h-3 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
