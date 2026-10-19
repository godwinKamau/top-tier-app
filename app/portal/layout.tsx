import type { Metadata } from "next";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { getStudentAccess } from "@/lib/auth/student";

export const metadata: Metadata = {
  title: { default: "Your week", template: "%s · Top-Tier Scholar Systems" },
  robots: { index: false, follow: false },
};

/**
 * The student's shell, the same header as the admin area so the two read as one
 * product. Only a linked student gets the tabs; anyone else sees the page's own
 * "no profile" or sign-in state without navigation into pages they cannot use.
 * Each page still checks access itself.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const access = await getStudentAccess();
  return (
    <div className="portal-root flex min-h-dvh flex-col">
      {access.status === "student" && (
        <PortalHeader
          area="STUDENT PORTAL"
          tabsLabel="Portal"
          userName={access.student.name}
          userRole={access.student.grade ? `Student · ${access.student.grade}` : "Student"}
          tabs={[
            { href: "/portal", label: "This week", exact: true },
            { href: "/portal/focus", label: "Focus" },
            { href: "/portal/log", label: "Study log" },
          ]}
        />
      )}
      {children}
    </div>
  );
}
