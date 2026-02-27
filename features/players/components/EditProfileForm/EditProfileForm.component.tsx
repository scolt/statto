"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

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

  const checkNickname = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const trimmed = value.trim();

      if (trimmed === initialNickname) {
        setNicknameStatus("idle");
        return;
      }

      if (!trimmed || trimmed.length === 0) {
        setNicknameStatus("idle");
        return;
      }

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
        setSuccessMessage("Profile updated!");
        setNicknameStatus("idle");
        router.refresh();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          rules={{
            required: t('profile.nameRequired'),
            maxLength: {
              value: 255,
              message: "Name must be 255 characters or fewer",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('profile.name')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder={t('profile.namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="nickname"
          rules={{
            required: t('profile.nicknameRequired'),
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
                {t('profile.nickname')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder={t('profile.nicknamePlaceholder')}
                    {...field}
                    className="pr-9"
                  />
                  {nicknameStatus === "checking" && (
                    <Loader2 className="absolute right-3 top-2.5 size-4 animate-spin text-muted-foreground" />
                  )}
                  {nicknameStatus === "available" && (
                    <Check className="absolute right-3 top-2.5 size-4 text-green-600" />
                  )}
                  {nicknameStatus === "taken" && (
                    <X className="absolute right-3 top-2.5 size-4 text-destructive" />
                  )}
                </div>
              </FormControl>
              {nicknameStatus === "taken" && (
                <p className="text-sm text-destructive">
                  {t('profile.nicknameTaken')}
                </p>
              )}
              {nicknameStatus === "available" && (
                <p className="text-sm text-green-600">{t('profile.nicknameAvailable')}</p>
              )}
              <FormDescription>
                {t('profile.nicknameHint')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-sm font-medium text-destructive">{serverError}</p>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            <Check className="size-4" />
            {successMessage}
          </div>
        )}
        
        <Button
          type="submit"
          disabled={isPending || nicknameStatus === "taken"}
          className="w-full sm:w-auto"
        >
          {isPending && <Loader2 className="animate-spin" />}
          {isPending ? t('common.saving') : t('profile.saveChanges')}
        </Button>
      </form>
    </Form>
  );
}
