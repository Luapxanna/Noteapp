import { describe, expect, test, beforeAll } from "vitest";
import { post, get, getAll, deleteNote } from "./note";
import { logto } from "./logto";

// Mock environment variables for testing
process.env.LOGTO_ENDPOINT = "https://gtkmrh.logto.app/";
process.env.LOGTO_APP_ID = "0o7i0yad4486g18w7jbxo";
process.env.LOGTO_APP_SECRET = "WKmb31SpefUnkjmrnU8AdlL9f0rA7p6a";
process.env.BASE_URL = "http://localhost:4000";

describe("Note API with Authentication", () => {
    let testUserId: string;

    beforeAll(async () => {
        // Get a test user ID (in a real app, this would come from the token)
        testUserId = "test-user-123";
    });

    test("create and retrieve a note with authentication", async () => {
        // Create a new note with authentication
        const newNote = await post({
            title: "Test Note",
            content: "This is a test note",
            user_id: testUserId
        });

        // Verify the note was created with correct data
        expect(newNote).toHaveProperty("uuid");
        expect(newNote.title).toBe("Test Note");
        expect(newNote.content).toBe("This is a test note");
        expect(newNote.user_id).toBe(testUserId);
        expect(newNote).toHaveProperty("created_at");

        // Retrieve the note with authentication
        const retrievedNote = await get({
            uuid: newNote.uuid,
            user_id: testUserId
        });

        // Compare only the relevant fields, ignoring created_at
        expect(retrievedNote.uuid).toBe(newNote.uuid);
        expect(retrievedNote.title).toBe(newNote.title);
        expect(retrievedNote.content).toBe(newNote.content);
        expect(retrievedNote.user_id).toBe(testUserId);
    });

    test("get all notes with authentication", async () => {
        // Create multiple notes
        const note1 = await post({
            title: "First Note",
            content: "First note content",
            user_id: testUserId
        });
        const note2 = await post({
            title: "Second Note",
            content: "Second note content",
            user_id: testUserId
        });

        // Get all notes for the authenticated user
        const response = await getAll({ user_id: testUserId });

        // Verify we can find both notes in the results by checking their content
        const foundNote1 = response.notes.find(n => n.uuid === note1.uuid);
        const foundNote2 = response.notes.find(n => n.uuid === note2.uuid);

        expect(foundNote1).toBeDefined();
        expect(foundNote1?.title).toBe(note1.title);
        expect(foundNote1?.content).toBe(note1.content);
        expect(foundNote1?.user_id).toBe(testUserId);

        expect(foundNote2).toBeDefined();
        expect(foundNote2?.title).toBe(note2.title);
        expect(foundNote2?.content).toBe(note2.content);
        expect(foundNote2?.user_id).toBe(testUserId);
    });

    test("delete a note with authentication", async () => {
        // Create a note
        const note = await post({
            title: "Note to Delete",
            content: "This note will be deleted",
            user_id: testUserId
        });

        // Delete the note
        await deleteNote({
            uuid: note.uuid,
            user_id: testUserId
        });

        // Verify the note is deleted by checking getAll
        const response = await getAll({ user_id: testUserId });
        const foundNote = response.notes.find(n => n.uuid === note.uuid);
        expect(foundNote).toBeUndefined();
    });

    test("access control - cannot access other user's notes", async () => {
        // Create a note for test user
        const note = await post({
            title: "Private Note",
            content: "This is a private note",
            user_id: testUserId
        });

        // Try to access the note with a different user
        const otherUserId = "other-user-456";
        await expect(get({
            uuid: note.uuid,
            user_id: otherUserId
        })).rejects.toThrow();
    });
});
