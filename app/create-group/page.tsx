import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateGroupForm } from "@/features/groups";

export default async function CreateGroupPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 glass border-b safe-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4 sm:px-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Back to Home">
              <ArrowLeft className="size-[18px]" />
            </Link>
          </Button>
          <h1 className="ml-2 text-lg font-semibold">Create Group</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <CreateGroupForm />
      </div>
    </main>
  );
}
