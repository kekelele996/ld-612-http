import { defineStore } from "pinia";
import { listReviewBatch, saveReviewBatch } from "../api/ReviewBatch";
import { listReviewBatchItem, saveReviewBatchItem } from "../api/ReviewBatchItem";
import { createReviewBatchForm } from "../constructors/ReviewBatchConstructor";
import { createReviewBatchItemFromDiff } from "../constructors/ReviewBatchItemConstructor";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { buildBatchSummaryMarkdown } from "../utils/formatters";
import type { DiffResult } from "../types/DiffResult";
import type { PolicyDocument } from "../types/PolicyDocument";
import type { PolicySection } from "../types/PolicySection";
import type { ReviewBatch } from "../types/ReviewBatch";
import type { ReviewBatchItem } from "../types/ReviewBatchItem";

const nextId = (rows: { id: number }[]) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export interface CreateBatchPayload {
  name: string;
  createdBy: string;
  oldDocument: PolicyDocument;
  newDocument: PolicyDocument;
  diffs: DiffResult[];
  oldSections: PolicySection[];
  newSections: PolicySection[];
}

export const useReviewBatchStore = defineStore("reviewBatch", {
  state: () => ({ batches: [] as ReviewBatch[], items: [] as ReviewBatchItem[], loading: false }),
  getters: {
    itemsOf: (state) => (batchId: number) =>
      state.items.filter((item) => item.batch_id === batchId).sort((a, b) => a.id - b.id),
    batchById: (state) => (batchId: number) => state.batches.find((batch) => batch.id === batchId)
  },
  actions: {
    async load() {
      this.loading = true;
      [this.batches, this.items] = await Promise.all([listReviewBatch(), listReviewBatchItem()]);
      this.loading = false;
    },
    // 从当前对比结果冻结一个批次：两版条款内容、差异类型、风险等级在此刻拷贝固化。
    async createFromComparison(payload: CreateBatchPayload) {
      const changed = payload.diffs.filter((diff) => diff.diff_type !== "UNCHANGED");
      if (!changed.length) throw new Error(ERROR_MESSAGES.BATCH_EMPTY);
      const batchId = nextId(this.batches);
      let itemId = nextId(this.items);
      const batch = createReviewBatchForm({
        id: batchId,
        name: payload.name || `${payload.oldDocument.version_label} → ${payload.newDocument.version_label} 审阅批次`,
        old_document_id: payload.oldDocument.id,
        new_document_id: payload.newDocument.id,
        old_version_label: payload.oldDocument.version_label,
        new_version_label: payload.newDocument.version_label,
        status: "OPEN",
        created_by: payload.createdBy || "未署名",
        created_at: new Date().toISOString(),
        closed_at: null
      });
      const items = changed.map((diff) =>
        createReviewBatchItemFromDiff(diff, payload.oldSections, payload.newSections, {
          id: itemId++,
          batch_id: batchId,
          reviewer: payload.createdBy
        })
      );
      await saveReviewBatch(batch);
      for (const item of items) await saveReviewBatchItem(item);
      console.info(LOG_TEMPLATES.ReviewBatch[0], batch.name);
      console.info(LOG_TEMPLATES.ReviewBatchItem[0], `${items.length} 条`);
      await this.load();
      return batch;
    },
    // 批次未结束才允许写入；已关闭批次保持冻结记录不变。
    async saveItem(item: ReviewBatchItem) {
      const batch = this.batches.find((row) => row.id === item.batch_id);
      if (!batch) throw new Error(ERROR_MESSAGES.BATCH_NOT_FOUND);
      if (batch.status === "CLOSED") throw new Error(ERROR_MESSAGES.BATCH_CLOSED);
      await saveReviewBatchItem(item);
      console.info(LOG_TEMPLATES.ReviewBatchItem[1], item.id);
      await this.load();
    },
    async closeBatch(batchId: number) {
      const batch = this.batches.find((row) => row.id === batchId);
      if (!batch) throw new Error(ERROR_MESSAGES.BATCH_NOT_FOUND);
      if (batch.status === "CLOSED") throw new Error(ERROR_MESSAGES.BATCH_CLOSED);
      await saveReviewBatch({ ...batch, status: "CLOSED", closed_at: new Date().toISOString() });
      console.info(LOG_TEMPLATES.ReviewBatch[2], batch.name);
      await this.load();
    },
    // 导出摘要只读冻结快照，与当前最新政策无关。
    exportBatchSummary(batchId: number): string {
      const batch = this.batches.find((row) => row.id === batchId);
      if (!batch) throw new Error(ERROR_MESSAGES.BATCH_NOT_FOUND);
      console.info(LOG_TEMPLATES.ReviewBatch[3], batch.name);
      return buildBatchSummaryMarkdown(batch, this.itemsOf(batchId));
    }
  }
});
