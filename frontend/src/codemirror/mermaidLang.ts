/**
 * Simple Mermaid syntax highlighting for CodeMirror 6.
 */
import { StreamLanguage } from "@codemirror/language";

const keywords =
  "flowchart graph sequenceDiagram classDiagram stateDiagram erDiagram gantt pie journey gitGraph blockDiagram " +
  "subgraph end direction LR RL TB BT class participant as link style click";

const keywordSet = new Set(keywords.split(/\s+/));

export const mermaidLanguage = StreamLanguage.define({
  name: "mermaid",
  startState: () => null,
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match(/%%.*/)) return "lineComment";
    if (stream.match(/"[^"]*"/)) return "string";
    if (stream.match(/'[^']*'/)) return "string";
    if (stream.match(/-->|--|==>|==|-\.->|\.->|<-\.-|<-\./)) return "keyword";
    if (stream.match(/[\[\]{}()]/)) return "bracket";
    if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const word = stream.current();
      if (keywordSet.has(word)) return "keyword";
      return null;
    }
    stream.next();
    return null;
  },
});
