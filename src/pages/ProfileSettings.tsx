import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";
import { AdminAvatarUpload } from "@/components/profile/AdminAvatarUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorDetail } from "@/services/api";
import * as profileService from "@/services/profile.service";
import { useAuthStore } from "@/store/authStore";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;
type SettingsTab = "profile" | "password";

export function ProfileSettings(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: SettingsTab = tabParam === "password" ? "password" : "profile";

  const admin = useAuthStore((s) => s.admin);
  const setAdmin = useAuthStore((s) => s.setAdmin);
  const [imageUrl, setImageUrl] = useState<string | null | undefined>(admin?.image);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: admin?.name ?? "" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    void profileService
      .getMe()
      .then((user) => {
        setAdmin(user);
        setImageUrl(user.image);
        profileForm.reset({ name: user.name });
      })
      .catch(() => {
        toast.error("Could not load profile");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  function setTab(tab: SettingsTab) {
    setSearchParams(tab === "profile" ? {} : { tab }, { replace: true });
  }

  async function onProfileSubmit(values: ProfileValues) {
    setSavingProfile(true);
    try {
      const updated = await profileService.updateProfile({
        name: values.name,
        image: imageUrl ?? undefined,
      });
      setAdmin(updated);
      setImageUrl(updated.image);
      toast.success("Profile saved");
    } catch (e) {
      toast.error(getApiErrorDetail(e).message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function onPasswordSubmit(values: PasswordValues) {
    setSavingPassword(true);
    try {
      await profileService.changePassword(values);
      passwordForm.reset();
      toast.success("Password updated");
    } catch (e) {
      const { message, fields } = getApiErrorDetail(e);
      if (fields?.currentPassword) {
        passwordForm.setError("currentPassword", { message: fields.currentPassword });
      } else {
        toast.error(message);
      }
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleAvatarUploaded(url: string) {
    setImageUrl(url);
    try {
      const updated = await profileService.updateProfile({ image: url });
      setAdmin(updated);
      toast.success("Profile photo saved");
    } catch (e) {
      toast.error(getApiErrorDetail(e).message);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-stone-900 dark:text-stone-100">
          Account settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeTab === "password"
            ? "Change your sign-in password."
            : "Update your display name and profile photo."}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setTab(v as SettingsTab)}
        className="w-full"
      >
        <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1 bg-muted/60 p-1">
          <TabsTrigger value="profile" className="gap-2 text-xs sm:text-sm">
            <UserRound className="h-4 w-4 shrink-0" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2 text-xs sm:text-sm">
            <KeyRound className="h-4 w-4 shrink-0" />
            Password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 focus-visible:outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Visible in the admin panel and notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AdminAvatarUpload
                name={profileForm.watch("name") || admin?.name || "Admin"}
                imageUrl={imageUrl}
                onUploaded={(url) => void handleAvatarUploaded(url)}
                disabled={savingProfile}
              />

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display name</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="name" className="max-w-md" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      value={admin?.email ?? ""}
                      disabled
                      className="max-w-md bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                  </div>
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? "Saving…" : "Save profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-4 focus-visible:outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Password</CardTitle>
              <CardDescription>Use a strong password you do not use elsewhere.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="max-w-md space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current password</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="current-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm new password</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={savingPassword}>
                    {savingPassword ? "Updating…" : "Update password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
