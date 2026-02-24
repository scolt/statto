export default function EditGroupLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4 sm:px-6">
          <div className="size-9 animate-pulse rounded-md bg-muted" />
          <div className="ml-2 h-5 w-24 animate-pulse rounded bg-muted" />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            <div className="mt-2 flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-7 w-24 animate-pulse rounded-full bg-muted"
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
