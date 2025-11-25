import { setup, fromPromise, assign } from "xstate";
import { testGeminiAPI } from "../api/geminiApi";

export const editorMachine = setup({
  types: {
    context: {} as {
      aiText: string;
    },
    events: {} as
      | { type: "GENERATE"; text: string }
      | { type: "CANCEL" }
      | { type: "INSERTED" },
    // This is the type of the value returned by mockAI
    output: {} as string,
  },

  actors: {
    // Simple mock AI: returns the full continuation string
    mockAI: fromPromise<string, { userInput: string }>(async ({ input }) => {
      // You can later replace this with a real API call
      // For now, return a long-ish string so the typing effect is visible
      const out = await testGeminiAPI(input.userInput);
      return out;
    }),
  },
}).createMachine({
  id: "editor",
  initial: "idle",

  context: {
    aiText: "",
  },

  states: {
    /** ------------------ idle ------------------ */
    idle: {
      on: {
        GENERATE: "generating",
      },
    },

    /** ------------------ generating ------------------ */
    generating: {
      invoke: {
        src: "mockAI",
        input: ({ event }) => ({
          userInput: (event as { type: "GENERATE"; text: string }).text,
        }),
        onDone: {
          target: "inserting",
          actions: assign({
            aiText: ({ event }) => event.output,
          }),
        },
        onError: "idle",
      },
      on: {
        CANCEL: "idle",
      },
    },

    /** ------------------ inserting (typing animation) ------------------ */
    inserting: {
      on: {
        INSERTED: "idle",
        CANCEL: "idle",
      },
    },
  },
});
