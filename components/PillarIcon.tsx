import {
  GraduationCap,
  Brain,
  ClipboardCheck,
  School,
  Users,
  type LucideIcon,
} from "lucide-react";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";

const iconMap: Record<
  (typeof content.pillars.items)[number]["icon"],
  LucideIcon
> = {
  graduationCap: GraduationCap,
  brain: Brain,
  clipboardCheck: ClipboardCheck,
  school: School,
  users: Users,
};

type PillarIconProps = {
  name: (typeof content.pillars.items)[number]["icon"];
  className?: string;
};

export function PillarIcon({ name, className }: PillarIconProps) {
  const Icon = iconMap[name];
  return <Icon className={cn("size-6", className)} aria-hidden />;
}
