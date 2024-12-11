import { arg, createProgram, createCommand, flag } from "commandstruct";
import { generateSchemas } from "./schema";
import { connectToDatabase } from "./lib/connect";
import { startStudio } from "./studio";

const pullCmd = createCommand("pull")
  .describe("Introspect an existing database")
  .flags({
    uri: flag("DB URI").char("u").requiredParam("string"),
  })
  .action(async ({ flags }) => {
    console.log("starting schema generate", flags.uri);
    const db  = await connectToDatabase(flags.uri,  "s4yc")
    generateSchemas(db, "app-test")
  });

const studioCmd = createCommand("studio")
  .describe("studio changes")
  .flags({
    config: flag("Configuration file").char("c"),
  })
  .action(({ flags }) => {
    // console.log("studio for ", flags.config);
    startStudio()
  });

  const generateCmd = createCommand("generate")
  .describe("Generate schema file")
  .flags({
    interactive: flag("interactive").char("i").requiredParam("string"),
  })
  .action(({ flags }) => {
    console.log("interactive mode ", flags.interactive);
  });

  const migrateCmd = createCommand("migrate")
  .describe("Migrate existing schema files from other ORMs")
  .action(({ flags }) => {
    console.log("Migrate ");
  });

const prog = createProgram("monarch")
  .describe("Supa ORM for mongoDB")
  .flags({ verbose: flag("Display extra information on command run") })
  .commands(
    generateCmd,
    migrateCmd,
    pullCmd,
    studioCmd,
  )
  .build();

prog.run();