import type { ReviewBatch } from "../types/ReviewBatch";

export const createDefaultReviewBatch = (overrides: Partial<ReviewBatch> = {}): ReviewBatch => ({
  id: 1 as never,
  name: "审阅批次 1" as never,
  old_document_id: 1 as never,
  new_document_id: 2 as never,
  old_version_label: "old version 1" as never,
  new_version_label: "new version 1" as never,
  status: "OPEN" as never,
  created_by: "reviewer 1" as never,
  created_at: "2026-06-11T09:00:00Z" as never,
  closed_at: null as never,
  ...overrides
});

export const createReviewBatchForm = createDefaultReviewBatch;
export const createReviewBatchResponse = createDefaultReviewBatch;
