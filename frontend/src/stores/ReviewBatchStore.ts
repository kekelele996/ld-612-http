import { defineStore } from "pinia";
import { listReviewBatch, listReviewBatchNote, saveReviewBatch, saveReviewBatchNote } from "../api/ReviewBatch";
import { createReviewBatchFromComparison } from "../constructors/ReviewBatchConstructor";
import { createReviewBatchNoteForm } from "../constructors/ReviewBatchNoteConstructor";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { ReviewBatch } from "../types/ReviewBatch";
import type { ReviewBatchNote } from "../types/ReviewBatchNote";
import type { PolicyDocument } from "../types/PolicyDocument";
import type { SectionDiff } from "../hooks/useTextDiff";

function fail(code: keyof typeof ERROR_CODES): never {
  console.error(ERROR_CODES[code]);
  throw new Error(ERROR_MESSAGES[code]);
}

export const useReviewBatchStore = defineStore("reviewBatch", {
  state: () => ({ batches: [] as ReviewBatch[], notes: [] as ReviewBatchNote[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      const [batches, notes] = await Promise.all([listReviewBatch(), listReviewBatchNote()]);
      this.batches = batches;
      this.notes = notes;
      this.loading = false;
    },
    async createFromComparison(input: { name: string; oldDocument?: PolicyDocument; newDocument?: PolicyDocument; diffs: SectionDiff[] }) {
      if (!input.oldDocument || !input.newDocument) fail("VALIDATION_FAILED");
      const changed = input.diffs.filter((diff) => diff.diff_type !== "UNCHANGED");
      if (!changed.length) fail("BATCH_EMPTY");
      const batch = createReviewBatchFromComparison({
        id: Date.now(),
        name: input.name.trim(),
        oldDocument: input.oldDocument,
        newDocument: input.newDocument,
        diffs: changed
      });
      console.info(LOG_TEMPLATES.ReviewBatch[0], batch);
      await saveReviewBatch(batch);
      this.batches = [...this.batches, batch];
      return batch;
    },
    async closeBatch(id: number) {
      const batch = this.batches.find((row) => row.id === id);
      if (!batch) fail("BATCH_NOT_FOUND");
      if (batch.status === "CLOSED") fail("BATCH_CLOSED");
      batch.status = "CLOSED";
      batch.closed_at = new Date().toISOString();
      console.info(LOG_TEMPLATES.ReviewBatch[2], batch);
      await saveReviewBatch(batch);
    },
    async saveNote(input: { batch_id: number; item_id: number; reviewer: string; comment: string; status: string }) {
      const batch = this.batches.find((row) => row.id === input.batch_id);
      if (!batch) fail("BATCH_NOT_FOUND");
      if (batch.status === "CLOSED") fail("BATCH_CLOSED");
      if (!input.reviewer.trim() || !input.comment.trim()) fail("VALIDATION_FAILED");
      const existing = this.notes.find((row) => row.batch_id === input.batch_id && row.item_id === input.item_id);
      const note = createReviewBatchNoteForm({
        ...existing,
        ...input,
        id: existing?.id ?? Date.now(),
        updated_at: new Date().toISOString()
      });
      console.info(existing ? LOG_TEMPLATES.ReviewBatchNote[1] : LOG_TEMPLATES.ReviewBatchNote[0], note);
      await saveReviewBatchNote(note);
      this.notes = existing ? this.notes.map((row) => (row.id === note.id ? note : row)) : [...this.notes, note];
      return note;
    }
  }
});
