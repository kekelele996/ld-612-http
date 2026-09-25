import { computed, ref } from "vue";
import type { DiffResult } from "../types/DiffResult";
import type { PolicySection } from "../types/PolicySection";

export function useTextDiff<T>(rows: T[] = []) {
  const page = ref(1);
  const pageSize = 8;
  const pageRows = computed(() => rows.slice((page.value - 1) * pageSize, page.value * pageSize));
  return { page, pageSize, pageRows, total: rows.length };
}

// 当前对比始终基于最新的条款段落实时计算，不读任何冻结快照。
export function computeSectionDiffs(
  oldSections: PolicySection[],
  newSections: PolicySection[],
  oldDocumentId = 0,
  newDocumentId = 0
): DiffResult[] {
  const createdAt = new Date().toISOString();
  const diffs: DiffResult[] = [];
  const oldByNo = new Map(oldSections.map((section) => [section.section_no, section]));
  const newByNo = new Map(newSections.map((section) => [section.section_no, section]));
  let seq = 1;
  newSections.forEach((section, index) => {
    const previous = oldByNo.get(section.section_no);
    const base = { old_document_id: oldDocumentId, new_document_id: newDocumentId, created_at: createdAt };
    if (!previous) {
      diffs.push({ ...base, id: seq++, section_id: section.id, diff_type: "ADDED", summary: `新增条款「${section.heading}」` });
    } else if (previous.content !== section.content) {
      diffs.push({ ...base, id: seq++, section_id: section.id, diff_type: "MODIFIED", summary: `条款「${section.heading}」内容发生修改` });
    } else if (oldSections.indexOf(previous) !== index) {
      diffs.push({ ...base, id: seq++, section_id: section.id, diff_type: "MOVED", summary: `条款「${section.heading}」位置发生移动` });
    } else {
      diffs.push({ ...base, id: seq++, section_id: section.id, diff_type: "UNCHANGED", summary: `条款「${section.heading}」未发生变化` });
    }
  });
  oldSections.forEach((section) => {
    if (!newByNo.has(section.section_no)) {
      diffs.push({ id: seq++, old_document_id: oldDocumentId, new_document_id: newDocumentId, section_id: section.id, diff_type: "REMOVED", summary: `删除条款「${section.heading}」`, created_at: createdAt });
    }
  });
  return diffs;
}
