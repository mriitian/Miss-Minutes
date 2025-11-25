import { setup, fromPromise, assign } from "xstate";

export const editorMachine = setup({
  types: {
    context: {} as {
      aiText: string;
    },

    events: {} as
      | { type: "GENERATE"; text: string }
      | { type: "CANCEL" }
      | { type: "INSERTED" },

    // input: {} as { userInput: string },

    output: {} as string,
  },

  actors: {
    mockAI: fromPromise<string, { userInput: string }>(async ({ input }) => {
      // TS FIX: assure input exists
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Mock AI finished!");

      return "AI says: " + input.userInput;
    }),
  },
}).createMachine({
  id: "editor",
  initial: "idle",

  context: {
    aiText: "",
  },

  states: {
    idle: {
      on: {
        GENERATE: "generating",
      },
    },

    generating: {
      invoke: {
        src: "mockAI",

        // TS FIX: force event to GENERATE event
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

    inserting: {
      on: {
        INSERTED: "idle",
      },
    },
  },
});
