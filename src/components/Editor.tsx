import { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";
import "../../public/styles/editor.css";

import { useMachine } from "@xstate/react";
import { editorMachine } from "../machines/editorMachine";

import "prosemirror-view/style/prosemirror.css";

export function Editor() {
  const editorParentRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const [state, send] = useMachine(editorMachine);
  console.log("Editor Machine State:", state.value);

  /** ----------------------------------------
   *  Initialize ProseMirror
   * ---------------------------------------- */
  useEffect(() => {
    if (!editorParentRef.current) return;

    const mySchema = new Schema({
      nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
      marks: schema.spec.marks,
    });

    const maybeDoc = mySchema.topNodeType.createAndFill();

    const pmState = EditorState.create({
      doc: maybeDoc || undefined,
      plugins: exampleSetup({ schema: mySchema }),
    });

    const view = new EditorView(editorParentRef.current, { state: pmState });
    editorViewRef.current = view;

    return () => view.destroy();
  }, []);

  /** ----------------------------------------
   *  INSERT AI TEXT WHEN MACHINE ENTERS "inserting"
   *  (typing animation, char-by-char)
   * ---------------------------------------- */
  useEffect(() => {
    if (!state.matches("inserting")) return;
    if (!editorViewRef.current) return;

    const view = editorViewRef.current;
    const fullText = state.context.aiText;

    let index = 0;

    const interval = setInterval(() => {
      const nextChar = fullText[index];

      if (nextChar) {
        // Ensure the editor has focus so selection is valid
        if (!view.hasFocus()) {
          view.focus();
        }

        const { from, to } = view.state.selection;

        const tr = view.state.tr.insertText(nextChar, from, to);
        view.dispatch(tr);

        index++;
      }

      // When we've finished inserting all characters
      if (index >= fullText.length) {
        clearInterval(interval);
        send({ type: "INSERTED" });
      }
    }, 35); // typing speed (ms between characters)

    // Cleanup if component unmounts or state changes (e.g. CANCEL)
    return () => clearInterval(interval);
  }, [state, send]);

  /** ----------------------------------------
   *  Button handler: GENERATE or CANCEL
   * ---------------------------------------- */
  const handleAiClick = () => {
    if (state.matches("idle")) {
      // Start AI generation
      const currentText = editorViewRef.current?.state.doc.textContent || "";
      send({ type: "GENERATE", text: currentText });
    } else if (state.matches("generating") || state.matches("inserting")) {
      // Stop AI generation/typing
      send({ type: "CANCEL" });
    }
  };

  return (
    <div className="editor-page">
      <div className="editor-container">
        <header className="editor-header">
          <h1>MissMunites Editor</h1>
          <p>Your AI-powered writing workspace</p>
        </header>

        <div className="editor-wrapper">
          <div className="editor-scroll-container">
            <div ref={editorParentRef} className="editor-surface" />
          </div>

          {/* --- AI Floating Button --- */}
          <button className="ai-button" onClick={handleAiClick}>
            {state.matches("generating") || state.matches("inserting")
              ? "⏹ Stop"
              : "✨ Continue Writing"}
          </button>
        </div>
      </div>
    </div>
  );
}
