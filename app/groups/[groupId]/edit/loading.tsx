export default function EditGroupLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="bg-muted size-9 animate-pulse rounded" />
        <div className="bg-muted h-7 w-32 animate-pulse rounded" />
      </div>

      {/* Form skeleton */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="bg-muted h-4 w-20 animate-pulse rounded" />
          <div className="bg-muted h-10 w-full animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted h-24 w-full animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="bg-muted h-4 w-28 animate-pulse rounded" />
          <div className="bg-muted h-10 w-full animate-pulse rounded" />
          {/* Member list skeleton */}
          <div className="mt-2 flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-muted h-7 w-24 animate-pulse rounded-full"
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-muted h-10 w-32 animate-pulse rounded" />
          <div className="bg-muted h-10 w-20 animate-pulse rounded" />
        </div>
      </div>
    </main>
  );
}
