export default function SelectPlayersLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4 sm:px-6">
          <div className="size-9 animate-pulse rounded-md bg-muted" />
          <div className="ml-2 h-5 w-28 animate-pulse rounded bg-muted" />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 h-4 w-52 animate-pulse rounded bg-muted" />

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-5 animate-pulse rounded bg-muted" />
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </main>
  );
}
