import {
  GraduationCap,
  Brain,
  ClipboardCheck,
  School,
  type LucideIcon,
} from "lucide-react";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";

const iconMap: Record<
  (typeof content.soarSystem.items)[number]["icon"],
  LucideIcon
> = {
  graduationCap: GraduationCap,
  brain: Brain,
  clipboardCheck: ClipboardCheck,
  school: School,
};

type PillarIconProps = {
  name: (typeof content.soarSystem.items)[number]["icon"];
  className?: string;
};

export function PillarIcon({ name, className }: PillarIconProps) {
  const Icon = iconMap[name];
  return <Icon className={cn("size-6", className)} aria-hidden />;
}
