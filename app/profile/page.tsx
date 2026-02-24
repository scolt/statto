import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth0";
import { getProfile, EditProfileForm } from "@/features/players";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const auth0User = await getCurrentUser();

  if (!auth0User) {
    redirect("/auth/login");
  }

  const profile = await getProfile(auth0User.sub);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">
          Failed to load profile. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center">
      <main className="mx-auto w-full max-w-lg px-8 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm uppercase tracking-wide">
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EditProfileForm
              playerId={profile.playerId}
              initialName={profile.name}
              initialNickname={profile.nickname}
            />
          </CardContent>

          <div className="px-6">
            <Separator />
          </div>

          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm uppercase tracking-wide">
              Account Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">{profile.provider ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </CardContent>

          {profile.favouriteSports.length > 0 && (
            <>
              <div className="px-6">
                <Separator />
              </div>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm uppercase tracking-wide">
                  Favourite Sports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.favouriteSports.map((sport: string) => (
                    <Badge key={sport} variant="secondary">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" className="text-destructive" asChild>
            <a href="/auth/logout">
              <LogOut className="size-4" />
              Log Out
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
