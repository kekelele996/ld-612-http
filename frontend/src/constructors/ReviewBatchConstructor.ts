import type { ReviewBatch } from "../types/ReviewBatch";
import type { PolicyDocument } from "../types/PolicyDocument";
import type { SectionDiff } from "../hooks/useTextDiff";
import { createReviewBatchItemFromDiff } from "./ReviewBatchItemConstructor";

export const createDefaultReviewBatch = (overrides: Partial<ReviewBatch> = {}): ReviewBatch => ({
  id: 0,
  name: "",
  old_document_id: 0,
  new_document_id: 0,
  old_version_label: "",
  new_version_label: "",
  status: "OPEN",
  items: [],
  created_at: "",
  closed_at: "",
  ...overrides
});

export const createReviewBatchForm = createDefaultReviewBatch;
export const createReviewBatchResponse = createDefaultReviewBatch;

export const createReviewBatchFromComparison = (input: {
  id: number;
  name: string;
  oldDocument: PolicyDocument;
  newDocument: PolicyDocument;
  diffs: SectionDiff[];
}): ReviewBatch =>
  createDefaultReviewBatch({
    id: input.id,
    name: input.name || `${input.oldDocument.version_label} → ${input.newDocument.version_label} 审阅批次`,
    old_document_id: input.oldDocument.id,
    new_document_id: input.newDocument.id,
    old_version_label: input.oldDocument.version_label,
    new_version_label: input.newDocument.version_label,
    status: "OPEN",
    items: input.diffs.map((diff, index) => createReviewBatchItemFromDiff(diff, index + 1)),
    created_at: new Date().toISOString(),
    closed_at: ""
  });
