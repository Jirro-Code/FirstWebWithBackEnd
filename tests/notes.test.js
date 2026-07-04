import { jest } from "@jest/globals";

//jest.fn is a function that does nothing but returns a spy that tells you everything that happens to it
jest.unstable_mockModule("../src/db.js", () => ({
  insertDB: jest.fn(),
  getDB: jest.fn(),
  saveDB: jest.fn(),
}));

//used await import to import the functions from the db.js file after mocking them
const { insertDB, getDB, saveDB } = await import("../src/db.js");
const { newNote, getAllNotes, removeNote } = await import("../src/notes.js");

//will run before each test to clear the mock functions so that they don't interfere with each other
//this will ensure that each test starts with a clean slate and that the mock functions are not affected by previous tests
beforeEach(() => {
  insertDB.mockClear();
  getDB.mockClear();
  saveDB.mockClear();
});

describe("notes.js CRUD operations", () => {
  test("newNote inserts data and returns it", async () => {
    //the placeholder data that will be returned for testing purposes
    const newNoteData = {
      tags: ["tag1", "tag2"],
      content: "Test note",
      id: 1,
    };

    //mockResolved is like a placeholder data value that will be returned for testing purposes
    insertDB.mockResolvedValue(newNoteData);

    const result = await newNote(newNoteData.content, newNoteData.tags);
    expect(result.content).toEqual(newNoteData.content);
    expect(result.tags).toEqual(newNoteData.tags);
  });

  test("getAllNotes returns all notes", async () => {
    //db placeholder
    const db = {
      notes: [
        {
          tags: ["tag1", "tag2"],
          content: "Test note",
          id: 1,
        },
        {
          tags: ["tag1", "tag2"],
          content: "Test note",
          id: 1,
        },
        {
          tags: ["tag1", "tag2"],
          content: "Test note",
          id: 1,
        },
      ],
    };

    //placeholder db that getAllNotes will use to return the notes
    getDB.mockResolvedValue(db);
    const result = await getAllNotes();
    expect(result).toEqual(db.notes);
  });

  test("removeNote sends a note not found message if ID is not found", async () => {
    //placeholder data for testing purposes
    const notes = [
      { id: 1, content: "note 1" },
      { id: 2, content: "note 2" },
      { id: 3, content: "note 3" },
    ];
    saveDB.mockResolvedValue(notes);

    const idToRemove = 4;
    const result = await removeNote(idToRemove);
    expect(result).toStrictEqual({ message: "Note not found" });
  });
});
