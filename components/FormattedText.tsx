import { cn } from "@/lib/utils";

type FormattedTextProps = {
  children: string;
  className?: string;
  as?: "span" | "p";
};

/** Renders `**bold**` and `*italic*` markers in shared copy strings. */
export function FormattedText({
  children,
  className,
  as: Tag = "span",
}: FormattedTextProps) {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(children)) !== null) {
    if (match.index > lastIndex) {
      parts.push(children.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <strong key={key++} className="font-semibold text-inherit">
          {match[1]}
        </strong>
      );
    } else if (match[2]) {
      parts.push(
        <em key={key++} className="italic text-inherit">
          {match[2]}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < children.length) {
    parts.push(children.slice(lastIndex));
  }

  return <Tag className={cn(className)}>{parts}</Tag>;
}
