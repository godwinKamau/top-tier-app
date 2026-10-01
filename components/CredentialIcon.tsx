import {
  BookOpen,
  Users,
  NotebookPen,
  FileCheck,
  type LucideIcon,
} from "lucide-react";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";

const iconMap: Record<
  (typeof content.founder.credentials)[number]["icon"],
  LucideIcon
> = {
  bookOpen: BookOpen,
  users: Users,
  notebookPen: NotebookPen,
  fileCheck: FileCheck,
};

type CredentialIconProps = {
  name: (typeof content.founder.credentials)[number]["icon"];
  className?: string;
};

export function CredentialIcon({ name, className }: CredentialIconProps) {
  const Icon = iconMap[name];
  return <Icon className={cn("size-6", className)} aria-hidden />;
}
