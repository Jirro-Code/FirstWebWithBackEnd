document.getElementById("insertBtn").onclick = async (e) => {
  e.preventDefault();
  const noteInput = document.getElementById("noteInput").value;

  if (!noteInput) {
    alert("Please enter a note");
    return;
  }

  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      //send a string to the backend, since the backend is expecting a string
      body: JSON.stringify({ content: noteInput, tags: [] }),
    });

    if (response.ok) {
      document.getElementById("noteInput").value = "";
      // Reload page to render the notes
      window.location.reload();
    } else {
      alert("Failed to create note");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error creating note");
  }
};

document.getElementById("searchBtn").onclick = async (e) => {
  e.preventDefault();
  const searchInput = document.getElementById("noteInput").value;

  if (!searchInput) {
    alert("Please enter a search term");
    return;
  }

  try {
    const response = await fetch(
      `/api/notes?content=${encodeURIComponent(searchInput)}`,
    );

    if (response.ok) {
      const notes = await response.json();
      const foundNotesDiv = document.getElementById("foundNotes");
      foundNotesDiv.innerHTML = notes
        .map((note) => `<div>${note.content}</div>`)
        .join("");
    } else {
      alert("Failed to search notes response not ok");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error searching notes");
  }
};

document.getElementById("deleteBtn").onclick = async (e) => {
  e.preventDefault();
  const deleteInput = Number(document.getElementById("noteInput").value);

  if (!deleteInput) {
    alert("Please enter a note id to delete");
    return;
  }
  try {
    const response = await fetch(
      `/api/notes?id=${encodeURIComponent(deleteInput)}`,
      {
        method: "DELETE",
      },
    );
    const data = await response.json();
    if (response.ok) {
      window.location.reload();
    } else if (!response.ok && data.message === "Note not found") {
      alert("Note not found");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error deleting note");
  }
};

document.getElementById("clearBtn").onclick = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch("/api/notes?id=clear", {
      method: "DELETE",
    });
    if (response.ok) {
      window.location.reload();
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error clearing note");
  }
};
