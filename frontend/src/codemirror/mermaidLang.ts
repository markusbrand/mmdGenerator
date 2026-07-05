import { LanguageSupport, StreamLanguage } from "@codemirror/language";

/**
 * Super basic Mermaid flowchart highlighting for CodeMirror 6.
 */
const mermaidStream = {
  token(stream: any) {
    if (stream.match(/^%%/)) {
      stream.skipToEnd();
      return "comment";
    }
    if (stream.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap|timeline|quadrantChart|requirementDiagram|block-beta|architecture)/)) {
      return "keyword";
    }
    if (stream.match(/^(TD|LR|BT|RL)/)) {
      return "atom";
    }
    stream.next();
    return null;
  }
};

export const mermaidLanguage = StreamLanguage.define(mermaidStream);

export function mermaid() {
  return new LanguageSupport(mermaidLanguage);
}
