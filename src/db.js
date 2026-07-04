import fs from "node:fs/promises";

const DB_PATH = new URL("../db.json", import.meta.url);

// get the whole db object from the file
export const getDB = async () => {
  //db is the db.js file thst serves as the database and converted it into json format
  const db = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(db);
};

// save the whole db object to the file
export const saveDB = async (db) => {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2)); // 2 means 2 spaces for indentation null means no replacer function
  return db;
};

// insert a new note into the db and save it to the file
export const insertDB = async (note) => {
  const db = await getDB();
  db.notes.push(note);
  await saveDB(db);
  return note;
};
