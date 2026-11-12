import { SignOutButton } from "@clerk/nextjs";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

/** What a signed-in account without access sees on any staff or student page. */
export function NotAuthorized({
  title = "This account does not have access.",
  children = (
    <>
      You are signed in, but not as an administrator. If you should have access, ask the site
      owner to add you.
    </>
  ),
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="portal-root flex min-h-dvh flex-1 items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-[10px] border-[1.5px] border-t-[5px] border-gold bg-card px-8 py-8 text-center shadow-[0_2px_10px_rgba(23,39,79,0.07)]">
        <LockKeyhole className="mx-auto mb-4 size-8 text-gold" aria-hidden />
        <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-subtle text-pretty">{children}</p>
        <SignOutButton>
          <Button variant="line" size="portal" className="mt-6">
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </main>
  );
}
