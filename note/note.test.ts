import { describe, expect, test } from "vitest";
import { post, get, getAll, deleteNote } from "./note";

describe("Note API", () => {
    test("create and retrieve a note", async () => {
        // Create a new note
        const newNote = await post({
            title: "Test Note",
            content: "This is a test note"
        });

        // Verify the note was created with correct data
        expect(newNote).toHaveProperty("uuid");
        expect(newNote.title).toBe("Test Note");
        expect(newNote.content).toBe("This is a test note");
        expect(newNote).toHaveProperty("created_at");

        // Retrieve the note
        const retrievedNote = await get({
            uuid: newNote.uuid
        });

        // Compare only the relevant fields, ignoring created_at
        expect(retrievedNote.uuid).toBe(newNote.uuid);
        expect(retrievedNote.title).toBe(newNote.title);
        expect(retrievedNote.content).toBe(newNote.content);
    });

    test("get all notes", async () => {
        // Create multiple notes
        const note1 = await post({
            title: "First Note",
            content: "First note content"
        });
        const note2 = await post({
            title: "Second Note",
            content: "Second note content"
        });

        // Get all notes
        const response = await getAll();

        // Verify we can find both notes in the results by checking their content
        const foundNote1 = response.notes.find(n => n.uuid === note1.uuid);
        const foundNote2 = response.notes.find(n => n.uuid === note2.uuid);

        expect(foundNote1).toBeDefined();
        expect(foundNote1?.title).toBe(note1.title);
        expect(foundNote1?.content).toBe(note1.content);

        expect(foundNote2).toBeDefined();
        expect(foundNote2?.title).toBe(note2.title);
        expect(foundNote2?.content).toBe(note2.content);
    });

    test("delete a note", async () => {
        // Create a note
        const note = await post({
            title: "Note to Delete",
            content: "This note will be deleted"
        });

        // Delete the note
        await deleteNote({
            uuid: note.uuid
        });

        // Verify the note is deleted by checking getAll
        const response = await getAll();
        const foundNote = response.notes.find(n => n.uuid === note.uuid);
        expect(foundNote).toBeUndefined();
    });
});
