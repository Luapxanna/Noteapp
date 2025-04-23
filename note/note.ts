import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { randomBytes } from "node:crypto";

// 'url' database is used to store the URLs that are being shortened.
const db = new SQLDatabase("notes", { migrations: "./migrations" });

interface Note {
  uuid: string; // the UUID of the note
  title: string; // the title of the note
  content: string; // the content of the note
  created_at: Date; // the date the note was created
}

interface CreateNoteParams {
  title: string; // the title of the note
  content: string; // the content of the note
}

// post creates a new note.
export const post = api(
  { expose: true, method: "POST", path: "/note" },
  async (params: CreateNoteParams): Promise<Note> => {
    const { title, content } = params;
    const uuid = randomBytes(6).toString("base64url");
    await db.exec`
        INSERT INTO notes (uuid, title, content)
        VALUES (${uuid}, ${title}, ${content})
    `;
    return { uuid, title, content, created_at: new Date() };
  }
);

// get retrieves a note by its UUID.
export const get = api(
  { expose: true, method: "GET", path: "/note/:uuid" },
  async (params: { uuid: string }): Promise<Note> => {
    const { uuid } = params;
    const notes = await db.query<Note>`
        SELECT * FROM notes WHERE uuid = ${uuid}
    `;
    const note = await notes.next();
    if (!note.value) {
      throw APIError.notFound("Note not found");
    }
    return note.value;
  }
);

interface ListResponse {
  notes: Note[];
}

// getAll retrieves all notes.
export const getAll = api(
  { expose: true, method: "GET", path: "/notes" },
  async (): Promise<ListResponse> => {
    const notes = await db.query<Note>`
        SELECT * FROM notes ORDER BY created_at DESC
    `;
    const result: Note[] = [];
    for await (const note of notes) {
      result.push(note);
    }
    return { notes: result };
  }
);

// deleteNote deletes a note by its UUID.
export const deleteNote = api(
  { expose: true, method: "DELETE", path: "/note/:uuid" },
  async (params: { uuid: string }): Promise<void> => {
    const { uuid } = params;
    await db.exec`
        DELETE FROM notes WHERE uuid = ${uuid}
    `;
  }
);