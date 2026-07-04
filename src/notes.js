import { insertDB, saveDB, getDB } from "./db.js";

//CRUD operations for notes

export const newNote = async (notes, tags) => {
  const newNote = {
    content: notes,
    tags,
    id: Date.now(),
  };

  await insertDB(newNote);
  return newNote;
};

//get all notes from the db and return them
export const getAllNotes = async () => {
  const { notes } = await getDB();
  return notes;
};

//filter notes by content and return the filtered notes
export const findNotes = async (filter) => {
  const { notes } = await getDB(); ///gets the whole db object and destructures it to get the notes array
  return notes.filter((note) =>
    note.content.toLowerCase().includes(filter.toLowerCase()),
  );
};

export const removeNote = async (id) => {
  const { notes } = await getDB();
  const match = notes.find((note) => note.id === id);

  if (!match) {
    return { message: "Note not found" };
  } else if (match) {
    const newNotes = notes.filter((note) => note.id !== id); // put all the notes that don't match the id into a new array
    await saveDB({ notes: newNotes }); // save the new array to the db
    return { message: `Note with id ${id} deleted successfully` };
  }
};

export const removeAllNotes = async () => saveDB({ notes: [] }); // save an empty array to the db
