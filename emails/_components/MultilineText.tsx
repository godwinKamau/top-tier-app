import { Text } from "@react-email/components";
import type { CSSProperties } from "react";

type MultilineTextProps = {
  value: string;
  style?: CSSProperties;
};

/**
 * Renders newlines in free-text fields as real <br/> elements.
 *
 * `white-space: pre-line` is the obvious fix and the wrong one — Outlook's Word
 * renderer drops it. Emitting <br/> works everywhere, and React still escapes
 * each line's text, so nothing in a submitted message is interpolated as markup.
 */
export function MultilineText({ value, style }: MultilineTextProps) {
  const lines = value.split("\n");

  return (
    <Text style={style}>
      {lines.map((line, index) => (
        <span key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </span>
      ))}
    </Text>
  );
}
