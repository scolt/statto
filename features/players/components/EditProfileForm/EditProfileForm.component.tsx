"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import {
  updateProfile,
  checkNicknameAvailability,
} from "../../actions/update-profile";

type EditProfileFormValues = {
  name: string;
  nickname: string;
};

type Props = {
  playerId: number;
  initialName: string;
  initialNickname: string;
};

export function EditProfileForm({
  playerId,
  initialName,
  initialNickname,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  // Nickname availability state
  const [nicknameStatus, setNicknameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<EditProfileFormValues>({
    defaultValues: {
      name: initialName,
      nickname: initialNickname,
    },
  });

  const watchedNickname = form.watch("nickname");

  // Debounced nickname availability check
  const checkNickname = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const trimmed = value.trim();

      // If unchanged from initial, no need to check
      if (trimmed === initialNickname) {
        setNicknameStatus("idle");
        return;
      }

      if (!trimmed || trimmed.length === 0) {
        setNicknameStatus("idle");
        return;
      }

      // Basic format validation before checking server
      if (!/^[a-zA-Z0-9_\-. ]+$/.test(trimmed)) {
        setNicknameStatus("idle");
        return;
      }

      setNicknameStatus("checking");

      debounceRef.current = setTimeout(async () => {
        try {
          const available = await checkNicknameAvailability(trimmed, playerId);
          setNicknameStatus(available ? "available" : "taken");
        } catch {
          setNicknameStatus("idle");
        }
      }, 500);
    },
    [initialNickname, playerId]
  );

  useEffect(() => {
    checkNickname(watchedNickname);
  }, [watchedNickname, checkNickname]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function onSubmit(values: EditProfileFormValues) {
    setServerError(undefined);
    setSuccessMessage(undefined);

    startTransition(async () => {
      const result = await updateProfile({
        name: values.name,
        nickname: values.nickname,
      });

      if (result.error) {
        setServerError(result.error);
      } else if (result.fieldErrors) {
        if (result.fieldErrors.name) {
          form.setError("name", { message: result.fieldErrors.name });
        }
        if (result.fieldErrors.nickname) {
          form.setError("nickname", { message: result.fieldErrors.nickname });
        }
      } else if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        setNicknameStatus("idle");
        router.refresh();
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          rules={{
            required: "Name is required",
            maxLength: {
              value: 255,
              message: "Name must be 255 characters or fewer",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Your display name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nickname"
          rules={{
            required: "Nickname is required",
            maxLength: {
              value: 100,
              message: "Nickname must be 100 characters or fewer",
            },
            pattern: {
              value: /^[a-zA-Z0-9_\-. ]+$/,
              message:
                "Only letters, numbers, spaces, dots, hyphens and underscores",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nickname <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Your unique nickname"
                    {...field}
                    className="pr-8"
                  />
                  {nicknameStatus === "checking" && (
                    <Loader2 className="text-muted-foreground absolute top-2.5 right-2.5 size-4 animate-spin" />
                  )}
                  {nicknameStatus === "available" && (
                    <Check className="text-green-600 absolute top-2.5 right-2.5 size-4" />
                  )}
                  {nicknameStatus === "taken" && (
                    <X className="text-destructive absolute top-2.5 right-2.5 size-4" />
                  )}
                </div>
              </FormControl>
              {nicknameStatus === "taken" && (
                <p className="text-destructive text-sm">
                  This nickname is already taken
                </p>
              )}
              {nicknameStatus === "available" && (
                <p className="text-sm text-green-600">
                  Nickname is available!
                </p>
              )}
              <FormDescription>
                Must be unique across the app. Others will see this in matches and groups.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-destructive text-sm font-medium">{serverError}</p>
        )}

        {successMessage && (
          <p className="text-sm font-medium text-green-600">{successMessage}</p>
        )}

        <Button
          type="submit"
          disabled={isPending || nicknameStatus === "taken"}
        >
          {isPending && <Loader2 className="animate-spin" />}
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
