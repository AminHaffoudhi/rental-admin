import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { PlatformLogo } from "@/components/brand/PlatformLogo";
import { PLATFORM_NAME } from "@/config/brand";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

type FormValues = z.infer<typeof schema>;

export function Login(): ReactElement {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await login(values.email, values.password);
      toast.success("Signed in");
      navigate("/", { replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-stone-100 p-4">
      <div className="flex w-full max-w-[820px] flex-col overflow-hidden rounded-2xl bg-white shadow-lg md:flex-row">
        <div className="relative hidden w-80 shrink-0 flex-col items-center justify-center bg-stone-900 p-10 text-center md:flex">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex justify-center">
              <PlatformLogo size="2xl" linkTo={false} className="brightness-0 invert" />
            </div>
            <h1 className="font-display mb-2 text-2xl font-semibold text-white">{PLATFORM_NAME}</h1>
            <p className="mb-8 text-sm text-stone-400">Admin Control Panel</p>
            <div className="space-y-3 text-left">
              {[
                "Manage all users & KYC",
                "Approve bookings & payments",
                "Resolve disputes",
                "Monitor platform health",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-stone-400">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center p-8 sm:p-10">
          <div className="mb-8">
            <PlatformLogo size="md" className="mb-6 md:hidden" />
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              <span className="text-xs font-semibold text-brand-700">Admin Access Only</span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-stone-900">Sign in</h2>
            <p className="mt-1 text-sm text-stone-500">Enter your admin credentials to continue</p>
          </div>

          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-700" htmlFor="admin-email">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="admin-2@email.com"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-700" htmlFor="admin-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  className="input pr-10"
                  placeholder="••••••••"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.formState.errors.password ? (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            {error ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                <AlertCircle size={15} className="shrink-0 text-red-500" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="btn btn-primary btn-lg mt-2 w-full min-h-[44px]"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in to Admin Panel"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
