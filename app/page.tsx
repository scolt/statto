import Image from "next/image";
import { auth0 } from '@/lib/auth0';

export default async function Home() {
  const session = await auth0.getSession();
  console.log(session);


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div>
          <a href="/auth/login?screen_hint=signup">Signup</a>
          <br />
          <a href="/auth/login">Login</a>
        </div>
      </main>
    </div>
  );
}
