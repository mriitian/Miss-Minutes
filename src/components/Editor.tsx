import { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { Slice, Fragment } from "prosemirror-model";

import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";
import "../../public/styles/editor.css";

import { downloadTextFile } from "../utils/downloadText";
import { useMachine } from "@xstate/react";
import { editorMachine } from "../machines/editorMachine";

import { Sidebar } from "./Sidebar";

import "prosemirror-view/style/prosemirror.css";

export function Editor() {
  const editorParentRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const [state, send] = useMachine(editorMachine);
  console.log("Editor Machine State:", state.value);

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

  useEffect(() => {
    if (!state.matches("inserting")) return;
    if (!editorViewRef.current) return;

    const view = editorViewRef.current;
    const fullText = state.context.aiText;

    let index = 0;

    const interval = setInterval(() => {
      const nextChar = fullText[index];

      if (nextChar) {
        if (!view.hasFocus()) view.focus();

        const { from, to } = view.state.selection;
        const tr = view.state.tr.insertText(nextChar, from, to);
        view.dispatch(tr);

        index++;
      }

      if (index >= fullText.length) {
        clearInterval(interval);
        send({ type: "INSERTED" });
      }
    }, 35);

    return () => clearInterval(interval);
  }, [state, send]);

  const handleAiClick = () => {
    if (state.matches("idle")) {
      const currentText = editorViewRef.current?.state.doc.textContent || "";
      send({ type: "GENERATE", text: currentText });
    } else if (state.matches("generating") || state.matches("inserting")) {
      send({ type: "CANCEL" });
    }
  };

  const loadDocument = (content: string) => {
    if (!editorViewRef.current) return;

    const view = editorViewRef.current;
    const state = view.state;

    const textNode = state.schema.text(content);

    const slice = new Slice(Fragment.from(textNode), 0, 0);

    const tr = state.tr.replaceRange(0, state.doc.content.size, slice);

    view.dispatch(tr);
  };

  return (
    <div className="editor-layout">
      {/* ------------ LEFT SIDEBAR ------------ */}
      <Sidebar onSelect={loadDocument} />

      {/* ------------ MAIN EDITOR AREA ------------ */}
      <div className="editor-container">
        <header className="editor-header">
          <h1>Miss Minutes Editor</h1>
          <p>Your AI-powered writing workspace</p>
        </header>

        <div className="editor-wrapper">
          <div className="editor-scroll-container">
            <div ref={editorParentRef} className="editor-surface" />
          </div>

          {/* --- AI Button --- */}
          <button className="ai-button" onClick={handleAiClick}>
            {state.matches("generating") || state.matches("inserting")
              ? "⏹ Stop"
              : "✨ Continue Writing"}
          </button>

          {/* --- SAVE BUTTON --- */}
          <button
            className="save-button"
            onClick={() => {
              const content =
                editorViewRef.current?.state.doc.textContent || "";
              const fileName = "Document " + new Date().toLocaleString();

              const doc = {
                id: Date.now().toString(),
                name: fileName,
                content,
              };

              const existing = localStorage.getItem("mm_saved_docs");
              const arr = existing ? JSON.parse(existing) : [];
              arr.push(doc);
              localStorage.setItem("mm_saved_docs", JSON.stringify(arr));

              downloadTextFile(fileName + ".txt", content);
            }}
          >
            💾 Save as TXT
          </button>
        </div>
      </div>
    </div>
  );
}
