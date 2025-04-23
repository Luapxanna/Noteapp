import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { randomBytes } from "node:crypto";
import { logto } from "./logto";

// 'url' database is used to store the URLs that are being shortened.
const db = new SQLDatabase("notes", { migrations: "./migrations" });

interface Note {
  uuid: string; // the UUID of the note
  title: string; // the title of the note
  content: string; // the content of the note
  created_at: Date; // the date the note was created
  user_id: string; // the ID of the user who created the note
}

interface CreateNoteParams {
  title: string; // the title of the note
  content: string; // the content of the note
}

// post creates a new note.
export const post = api(
  { expose: true, auth: true, method: "POST", path: "/note" },
  async (params: CreateNoteParams & { user_id: string }): Promise<Note> => {
    const { title, content, user_id } = params;
    const uuid = randomBytes(6).toString("base64url");
    await db.exec`
        INSERT INTO notes (uuid, title, content, user_id)
        VALUES (${uuid}, ${title}, ${content}, ${user_id})
    `;
    return { uuid, title, content, created_at: new Date(), user_id };
  }
);

// get retrieves a note by its UUID.
export const get = api(
  { expose: true, auth: true, method: "GET", path: "/note/:uuid" },
  async (params: { uuid: string; user_id: string }): Promise<Note> => {
    const { uuid, user_id } = params;
    const notes = await db.query<Note>`
        SELECT * FROM notes WHERE uuid = ${uuid} AND user_id = ${user_id}
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

// getAll retrieves all notes for the authenticated user.
export const getAll = api(
  { expose: true, auth: true, method: "GET", path: "/notes" },
  async (params: { user_id: string }): Promise<ListResponse> => {
    const { user_id } = params;
    const notes = await db.query<Note>`
        SELECT * FROM notes WHERE user_id = ${user_id} ORDER BY created_at DESC
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
  { expose: true, auth: true, method: "DELETE", path: "/note/:uuid" },
  async (params: { uuid: string; user_id: string }): Promise<void> => {
    const { uuid, user_id } = params;
    await db.exec`
        DELETE FROM notes WHERE uuid = ${uuid} AND user_id = ${user_id}
    `;
  }
);