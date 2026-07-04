import fs from "node:fs/promises";
import http from "node:http";
import open from "open";
import {
  newNote,
  getAllNotes,
  findNotes,
  removeNote,
  removeAllNotes,
} from "./notes.js";

export const interpolate = (html, data) => {
  // Replace placeholders in the html {{ placeholder }} with corresponding values from the data object
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, placeholder) => {
    //if it doesn't exist in the data object, return an empty string
    return data[placeholder] || ``;
  });
};

// Function to format notes into HTML
export const formatNotes = (notes) => {
  //map function is a foreach loop that returns a new array
  //note.tags.map is a foreach function that return an array of tags in the form of <span class="tag">tag</span>
  return notes
    .map((note) => {
      return `
        <div class="note">
          <div><strong>Note ID:</strong> ${note.id}</div>
          <p>${note.content}</p>
          <div class="tags">
            ${note.tags.map((tag) => `<span class="tag">Tag:${tag}</span>`).join(` `)} 
          </div>
        </div>`;
    })
    .join(`\n`);
};

export const createServer = (notes) => {
  return http.createServer(async (req, res) => {
    //the import.meta.url is the address of the current file
    const HTML_PATH = new URL("./template.html", import.meta.url);

    //SRC_DIR serves as the path to the src folder. Used to direct the script.js request to the correct path
    //since the server is running outside the src folder, we need to te
    const SRC_DIR = new URL(".", import.meta.url);

    // get the pathname from the request url. This is used to determine which route the request is for.
    const pathname = new URL(req.url, `http://localhost`).pathname;

    // Handle API requests
    if (pathname === "/api/notes") {
      switch (req.method) {
        //POST means req wants a new notes to be created
        case "POST":
          //body is the placeholder for the data that is sent from the frontend, which is the note content and tags before parsing into json
          let body = "";
          //data is the piece of data that is sent from the frontend, which is the note content and tags
          //chunk is the combined data that is sent from the frontend, which is the note content and tags
          //adds chunk to the body variable
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", async () => {
            try {
              //converting the body into json format
              const { content, tags } = JSON.parse(body);
              const note = await newNote(content, tags || []);
              //writeHead is a method that sets response a status code and headers. headers indicates the type of data being sent to the frontend
              //end is the method to send the response back to frontend
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(note));
            } catch (e) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid request" }));
            }
          });
          break;

        case "DELETE":
          try {
            const url = new URL(req.url, `http://localhost`);
            const checkUrl = url.searchParams.get("id") || "";
            if (checkUrl === "clear") {
              await removeAllNotes();
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ message: "All notes cleared successfully" }),
              );
              return;
            }
            const idToRemove = Number(checkUrl);
            const removedNote = await removeNote(idToRemove);

            if (removedNote.message === "Note not found") {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ message: "Note not found" }));
              return;
            } else {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  message: `${removedNote.message}`,
                }),
              );
            }
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error deleting note" }));
          }
          break;

        case "GET":
          try {
            const url = new URL(req.url, `http://localhost`);
            //searchParams.get means get the value after the word content in the url ( = is not counted)
            const content = url.searchParams.get("content") || "";
            const foundNotes = await findNotes(content);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(foundNotes));
          } catch (e) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error fetching notes" }));
          }
          break;
      }
    }
    // Handle .js file requests
    else if (pathname.endsWith(".js")) {
      try {
        const jsFilePath = new URL(`.${pathname}`, SRC_DIR);
        const script = await fs.readFile(jsFilePath, "utf-8");
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(script);
      } catch (error) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
      }
    }
    // Handle .css file requests || allows the css file to enter the server
    else if (pathname.endsWith(".css")) {
      try {
        const cssFilePath = new URL(`.${pathname}`, SRC_DIR);
        const css = await fs.readFile(cssFilePath, "utf-8");
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(css);
      } catch (error) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
      }
    }
    // Serve HTML for all other requests
    else {
      try {
        const allNotes = await getAllNotes();
        const template = await fs.readFile(HTML_PATH, "utf-8");
        const html = interpolate(template, { notes: formatNotes(allNotes) });
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error reading template file");
      }
    }
  });
};

export const start = (notes, port) => {
  const server = createServer(notes);

  server.listen(port, () => {
    const address = `http://localhost:${port}`;
    console.log(`Server is listening on port ${address}`);
    open(address);
  });
};
