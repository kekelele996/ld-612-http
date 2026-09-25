import type { ReviewBatchNote } from "../types/ReviewBatchNote";

export const createDefaultReviewBatchNote = (overrides: Partial<ReviewBatchNote> = {}): ReviewBatchNote => ({
  id: 0,
  batch_id: 0,
  item_id: 0,
  reviewer: "",
  comment: "",
  status: "OPEN",
  updated_at: "",
  ...overrides
});

export const createReviewBatchNoteForm = createDefaultReviewBatchNote;
export const createReviewBatchNoteResponse = createDefaultReviewBatchNote;
