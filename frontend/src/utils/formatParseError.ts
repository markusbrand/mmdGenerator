/**
 * Converts raw Mermaid/parser error messages into user-friendly text.
 */
export function formatParseError(rawMessage: string, line?: number): string {
  const msg = rawMessage.trim();
  if (!msg) return "Something went wrong while parsing the diagram.";

  const lower = msg.toLowerCase();

  // Line reference to append when we have a line number
  const lineHint = line != null && line > 0 ? ` (See line ${line}.)` : "";

  if (lower.includes("lexical error") || lower.includes("invalid character")) {
    return `Invalid character or word in the diagram. Please check the syntax.${lineHint}`;
  }
  if (lower.includes("no diagram type detected") || lower.includes("diagram type")) {
    return "Could not detect diagram type. Start with a keyword like flowchart, sequenceDiagram, or classDiagram.";
  }
  if (lower.includes("unexpected token") || lower.includes("unexpected '")) {
    return `Unexpected syntax at this position. Check brackets, arrows, and keywords.${lineHint}`;
  }
  if (lower.includes("parse error") && lower.includes("line")) {
    return `Syntax error in the diagram.${lineHint}`;
  }
  if (lower.includes("ambiguous") || lower.includes("ambiguity")) {
    return `The diagram has ambiguous syntax. Try rephrasing or adding parentheses.${lineHint}`;
  }
  if (lower.includes("invalid") && (lower.includes("link") || lower.includes("arrow"))) {
    return `Invalid connection or arrow. Check the format of your links.${lineHint}`;
  }
  if (lower.includes("security")) {
    return "This diagram uses a feature that is not allowed in the current security setting.";
  }

  // Fallback: shorten and soften technical jargon
  const shortened = msg.length > 200 ? msg.slice(0, 197) + "…" : msg;
  return `Diagram syntax error: ${shortened}${lineHint}`;
}
