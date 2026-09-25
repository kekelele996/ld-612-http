import type { DiffResult } from "../types/DiffResult";
import type { PolicySection } from "../types/PolicySection";
import type { ReviewBatchItem } from "../types/ReviewBatchItem";

export const createDefaultReviewBatchItem = (overrides: Partial<ReviewBatchItem> = {}): ReviewBatchItem => ({
  id: 1 as never,
  batch_id: 1 as never,
  diff_result_id: 1 as never,
  section_no: "section no 1" as never,
  heading: "heading 1" as never,
  old_content: "old content 1" as never,
  new_content: "new content 1" as never,
  diff_type: "MODIFIED" as never,
  risk_level: "LOW" as never,
  comment: "" as never,
  reviewer: "" as never,
  status: "OPEN" as never,
  ...overrides
});

export const createReviewBatchItemForm = createDefaultReviewBatchItem;
export const createReviewBatchItemResponse = createDefaultReviewBatchItem;

// 冻结入口：把当前差异连同两版条款内容、差异类型、风险等级复制进批次条目。
// 之后政策再导入或风险重标只改 live 数据，不回写这里。
export const createReviewBatchItemFromDiff = (
  diff: DiffResult,
  oldSections: PolicySection[],
  newSections: PolicySection[],
  overrides: Partial<ReviewBatchItem> = {}
): ReviewBatchItem => {
  const newSection = newSections.find((section) => section.id === diff.section_id);
  const removedOldSection = oldSections.find((section) => section.id === diff.section_id);
  const anchor = newSection ?? removedOldSection;
  const oldSection = oldSections.find((section) => section.section_no === anchor?.section_no);
  return createDefaultReviewBatchItem({
    diff_result_id: diff.id,
    section_no: anchor?.section_no ?? "",
    heading: anchor?.heading ?? "",
    old_content: oldSection?.content ?? "",
    new_content: newSection?.content ?? "",
    diff_type: diff.diff_type,
    risk_level: newSection?.risk_level ?? oldSection?.risk_level ?? "LOW",
    ...overrides
  });
};
