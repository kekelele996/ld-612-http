<script setup lang="ts">
import { reactive, watch } from "vue";
import { ReviewStatus } from "../../constants/ReviewStatus";
import { formatDiffType, formatReviewStatus, formatRisk } from "../../utils/formatters";
import StatusBadge from "./StatusBadge.vue";
import RiskTag from "./RiskTag.vue";
import DiffViewer from "./DiffViewer.vue";
import EmptyState from "./EmptyState.vue";
import type { ReviewBatchItem } from "../../types/ReviewBatchItem";

const props = withDefaults(defineProps<{ items: ReviewBatchItem[]; readonly?: boolean }>(), { readonly: false });
const emit = defineEmits<{ (e: "save", item: ReviewBatchItem): void }>();

// 每条冻结差异对应一份意见草稿，保存时才写回批次。
const drafts = reactive<Record<number, { comment: string; reviewer: string; status: string }>>({});
watch(
  () => props.items,
  (items) => {
    for (const item of items) {
      drafts[item.id] = { comment: item.comment, reviewer: item.reviewer, status: item.status };
    }
  },
  { immediate: true, deep: true }
);

function save(item: ReviewBatchItem) {
  const draft = drafts[item.id];
  if (!draft) return;
  emit("save", { ...item, comment: draft.comment, reviewer: draft.reviewer, status: draft.status });
}
</script>

<template>
  <EmptyState v-if="!items.length" />
  <article v-for="item in items" :key="item.id" class="panel review-item">
    <header class="review-item-head">
      <strong>{{ item.section_no }}. {{ item.heading }}</strong>
      <span class="tags">
        <StatusBadge :value="formatDiffType(item.diff_type)" />
        <RiskTag :level="item.risk_level" />
        <StatusBadge :value="formatReviewStatus(readonly ? item.status : drafts[item.id]?.status ?? item.status)" />
      </span>
    </header>
    <DiffViewer :old-text="item.old_content" :new-text="item.new_content" />
    <template v-if="!readonly && drafts[item.id]">
      <div class="review-form">
        <el-input v-model="drafts[item.id].reviewer" placeholder="审阅人" class="reviewer" />
        <el-select v-model="drafts[item.id].status" placeholder="处理状态" class="status-select">
          <el-option v-for="status in ReviewStatus" :key="status" :label="formatReviewStatus(status)" :value="status" />
        </el-select>
      </div>
      <el-input v-model="drafts[item.id].comment" type="textarea" :rows="2" placeholder="记录审阅意见" />
      <div class="review-actions">
        <el-button size="small" type="primary" @click="save(item)">保存意见</el-button>
      </div>
    </template>
    <footer v-else class="review-record">
      <span>审阅人：{{ item.reviewer || "未填写" }}</span>
      <span>处理状态：{{ formatReviewStatus(item.status) }}</span>
      <span>意见：{{ item.comment || "无" }}</span>
      <span class="hint">冻结时风险：{{ formatRisk(item.risk_level) }}</span>
    </footer>
  </article>
</template>
