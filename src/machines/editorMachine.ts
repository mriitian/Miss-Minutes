import { setup, fromPromise, assign } from "xstate";

export const editorMachine = setup({
  /** Define types here */
  types: {
    context: {} as {
      aiText: string;
    },

    events: {} as
      | { type: "GENERATE" }
      | { type: "CANCEL" }
      | { type: "INSERTED" },

    // output from invoke
    output: {} as string,
  },

  /** Register actor (invoke source) here */
  actors: {
    mockAI: fromPromise<string>(async () => {
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Mock AI finished!");
      return " This is the AI continuation (mock).";
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
        src: "mockAI", // reference the actor by name
        onDone: {
          target: "inserting",
          actions: assign({
            aiText: ({ event }) => event.output, // FULLY TYPED NOW
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
