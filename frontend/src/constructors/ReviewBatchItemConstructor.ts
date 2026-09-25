import type { ReviewBatchItem } from "../types/ReviewBatchItem";
import type { SectionDiff } from "../hooks/useTextDiff";

export const createDefaultReviewBatchItem = (overrides: Partial<ReviewBatchItem> = {}): ReviewBatchItem => ({
  id: 0,
  section_id: 0,
  heading: "",
  diff_type: "MODIFIED",
  risk_level: "LOW",
  summary: "",
  old_content: "",
  new_content: "",
  ...overrides
});

export const createReviewBatchItemFromDiff = (diff: SectionDiff, id: number): ReviewBatchItem =>
  createDefaultReviewBatchItem({
    id,
    section_id: diff.section_id,
    heading: diff.heading,
    diff_type: diff.diff_type,
    risk_level: diff.risk_level,
    summary: diff.summary,
    old_content: diff.old_content,
    new_content: diff.new_content
  });
