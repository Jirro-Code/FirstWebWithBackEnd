import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  newNote,
  getAllNotes,
  findNotes,
  removeNote,
  removeAllNotes,
} from "./notes.js";
import { start } from "./server.js";

yargs(hideBin(process.argv))
  .command(
    `new <note>`, //command name and positional argument
    `Create a new note`,
    (yargs) => {
      return yargs.positional(`note`, {
        //define the positional argument
        type: `string`,
        describe: `The note to create`,
      });
    },
    async (argv) => {
      const tags = argv.tags ? argv.tags.split(",") : [];
      const note = await newNote(argv.note, tags);
      console.log(`Created note with id ${note.id}: ${note.content}`);
    },
  )
  .option(`tags`, {
    //define an option
    alias: `t`,
    type: `string`,
    describe: `Tags to add to the note`,
  })

  .command(
    `all`,
    `get all notes`,
    () => {},
    async (argv) => {
      const notes = await getAllNotes();
      console.log(`All notes:`);
      notes.forEach((note) => {
        console.log(` - ${note.content}`);
        console.log(`\n`);
      });
    },
  )

  .command(
    "find <filter>",
    "get matching notes",
    (yargs) => {
      return yargs.positional("filter", {
        describe:
          "The search term to filter notes by, will be applied to note.content",
        type: "string",
      });
    },
    async (argv) => {
      const matchedNotes = await findNotes(argv.filter);
      if (matchedNotes.length < 1) {
        console.log(`No notes found matching "${argv.filter}"`);
        return;
      }
      console.log(
        `Found ${matchedNotes.length} notes matching "${argv.filter}":`,
      );
      console.log(`notes:`);
      matchedNotes.forEach((note) => {
        console.log(` - ${note.content}`);
        console.log(`\n`);
      });
    },
  )

  .command(
    "remove <id>",
    "remove a note by id",
    (yargs) => {
      return yargs.positional("id", {
        type: "number",
        description: "The id of the note you want to remove",
      });
    },
    async (argv) => {
      const removedNote = await removeNote(argv.id);
      removedNote
        ? console.log(`Removed note with id ${removedNote}`)
        : console.log(`No note found with id ${argv.id}`);
    },
  )

  .command(
    "web [port]",
    "launch website to see notes",
    (yargs) => {
      return yargs.positional("port", {
        describe: "port to bind on",
        default: 5000,
        type: "number",
      });
    },
    async (argv) => {
      const notes = await getAllNotes();
      start(notes, argv.port);
    },
  )

  .command(
    "clean",
    "remove all notes",
    () => {},
    async (argv) => {
      await removeAllNotes();
      console.log(`All notes removed`);
    },
  )

  .demandCommand(1) //require at least one command to be provided
  .parse();
