/**
 * CodeMirror extension to highlight a specific line (e.g. parse error).
 */
import { Decoration, EditorView } from "@codemirror/view";
import { Facet } from "@codemirror/state";

export const errorLineFacet = Facet.define<number | null, number | null>({
  combine: (values) => values[values.length - 1] ?? null,
});

export const errorLineHighlight = EditorView.decorations.compute([errorLineFacet], (state) => {
  const lineNum = state.facet(errorLineFacet);
  if (lineNum == null || lineNum < 1) return Decoration.none;
  try {
    const line = state.doc.line(lineNum);
    return Decoration.set(Decoration.line({ class: "cm-error-line" }).range(line.from));
  } catch {
    return Decoration.none;
  }
});

export function errorLineExtension(errorLine: number | null) {
  return [errorLineFacet.of(errorLine), errorLineHighlight];
}
