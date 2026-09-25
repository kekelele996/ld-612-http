<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useReviewBatchStore } from "../stores/ReviewBatchStore";
import { ReviewStatus, ReviewStatusText } from "../constants/ReviewStatus";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { formatBatchStatus, formatDate, formatRisk } from "../utils/formatters";
import StatusBadge from "../components/common/StatusBadge.vue";
import RiskTag from "../components/common/RiskTag.vue";
import EmptyState from "../components/common/EmptyState.vue";

const batchStore = useReviewBatchStore();
const selectedId = ref<number | null>(null);
const errorMessage = ref("");
const noteForms = reactive<Record<string, { reviewer: string; comment: string; status: string }>>({});

onMounted(async () => {
  await batchStore.load();
  ensureForms();
  const latest = [...batchStore.batches].sort((a, b) => b.id - a.id)[0];
  selectedId.value = latest?.id ?? null;
});

const sortedBatches = computed(() => [...batchStore.batches].sort((a, b) => b.id - a.id));
const selected = computed(() => batchStore.batches.find((batch) => batch.id === selectedId.value) ?? null);
const formKey = (batchId: number, itemId: number) => `${batchId}:${itemId}`;
const noteOf = (itemId: number) => batchStore.notes.find((row) => row.batch_id === selectedId.value && row.item_id === itemId);
const noteCountOf = (batchId: number) => batchStore.notes.filter((row) => row.batch_id === batchId).length;

function ensureForms() {
  for (const batch of batchStore.batches) {
    for (const item of batch.items) {
      const key = formKey(batch.id, item.id);
      if (!noteForms[key]) {
        const note = batchStore.notes.find((row) => row.batch_id === batch.id && row.item_id === item.id);
        noteForms[key] = note
          ? { reviewer: note.reviewer, comment: note.comment, status: note.status }
          : { reviewer: "", comment: "", status: "OPEN" };
      }
    }
  }
}

async function saveNote(itemId: number) {
  errorMessage.value = "";
  if (selectedId.value === null) return;
  const form = noteForms[formKey(selectedId.value, itemId)];
  try {
    await batchStore.saveNote({ batch_id: selectedId.value, item_id: itemId, ...form });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
  }
}

async function closeBatch() {
  errorMessage.value = "";
  if (selectedId.value === null) return;
  try {
    await batchStore.closeBatch(selectedId.value);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
  }
}

function exportSummary() {
  const batch = selected.value;
  if (!batch) return;
  const lines = [
    `# 审阅批次摘要：${batch.name}`,
    "",
    `- 冻结时间：${formatDate(batch.created_at)}`,
    `- 对比版本（冻结快照）：${batch.old_version_label} → ${batch.new_version_label}`,
    `- 批次状态：${formatBatchStatus(batch.status)}${batch.closed_at ? `（关闭于 ${formatDate(batch.closed_at)}）` : ""}`,
    `- 说明：批次内容为冻结时快照，后续政策导入与风险重标不影响本摘要`,
    "",
    `## 冻结差异明细（${batch.items.length} 条）`,
    ""
  ];
  for (const item of batch.items) {
    const note = noteOf(item.id);
    lines.push(
      `### ${item.heading}`,
      "",
      `- 差异类型：${item.diff_type}`,
      `- 风险等级（冻结时）：${formatRisk(item.risk_level)}`,
      `- 差异说明：${item.summary}`,
      `- 处理状态：${note ? note.status : "未处理"}`,
      `- 审阅意见：${note ? `${note.comment}（${note.reviewer}，${formatDate(note.updated_at)}）` : "暂无"}`,
      ""
    );
    if (item.old_content) lines.push(`> 旧版：${item.old_content}`, "");
    if (item.new_content) lines.push(`> 新版：${item.new_content}`, "");
  }
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `review-batch-${batch.id}.md`;
  link.click();
  URL.revokeObjectURL(url);
  console.info(LOG_TEMPLATES.ReviewBatch[3], batch.id);
}
</script>

<template>
  <section class="batch-layout">
    <div class="panel batch-list">
      <h2>审阅批次</h2>
      <article
        v-for="batch in sortedBatches"
        :key="batch.id"
        class="batch-row"
        :class="{ active: batch.id === selectedId }"
        @click="selectedId = batch.id"
      >
        <strong>{{ batch.name }}</strong>
        <span class="muted">{{ batch.old_version_label }} → {{ batch.new_version_label }}</span>
        <span class="muted">冻结于 {{ formatDate(batch.created_at) }} · {{ batch.items.length }} 条差异 · {{ noteCountOf(batch.id) }} 条意见</span>
        <StatusBadge :value="formatBatchStatus(batch.status)" />
      </article>
      <EmptyState v-if="!batchStore.batches.length" />
    </div>

    <div v-if="selected" class="panel batch-detail">
      <div class="batch-head">
        <div>
          <h2>{{ selected.name }}</h2>
          <p class="muted">冻结快照：{{ selected.old_version_label }} → {{ selected.new_version_label }}（{{ formatDate(selected.created_at) }}）</p>
          <p v-if="selected.closed_at" class="muted">关闭于 {{ formatDate(selected.closed_at) }}，批次内容只读</p>
        </div>
        <div class="actions">
          <StatusBadge :value="formatBatchStatus(selected.status)" />
          <button @click="exportSummary">导出摘要</button>
          <button v-if="selected.status === 'OPEN'" class="primary" @click="closeBatch">关闭批次</button>
        </div>
      </div>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <article v-for="item in selected.items" :key="item.id" class="item-card">
        <header><StatusBadge :value="item.diff_type" /><RiskTag :level="item.risk_level" /><strong>{{ item.heading }}</strong></header>
        <p>{{ item.summary }}</p>
        <div class="diff-columns">
          <blockquote v-if="item.old_content"><em>旧版（冻结）</em>{{ item.old_content }}</blockquote>
          <blockquote v-if="item.new_content"><em>新版（冻结）</em>{{ item.new_content }}</blockquote>
        </div>
        <div v-if="selected.status === 'OPEN' && noteForms[formKey(selected.id, item.id)]" class="note-form">
          <input v-model="noteForms[formKey(selected.id, item.id)].reviewer" placeholder="审阅人" />
          <input v-model="noteForms[formKey(selected.id, item.id)].comment" placeholder="审阅意见" />
          <select v-model="noteForms[formKey(selected.id, item.id)].status">
            <option v-for="status in ReviewStatus" :key="status" :value="status">{{ ReviewStatusText[status] }}</option>
          </select>
          <button class="primary" @click="saveNote(item.id)">保存意见</button>
        </div>
        <div v-else class="note-view">
          <template v-if="noteOf(item.id)">
            <StatusBadge :value="noteOf(item.id)?.status ?? ''" />
            <span>{{ noteOf(item.id)?.comment }}</span>
            <span class="muted">—— {{ noteOf(item.id)?.reviewer }} · {{ formatDate(noteOf(item.id)?.updated_at ?? "") }}</span>
          </template>
          <span v-else class="muted">暂无审阅意见</span>
        </div>
      </article>
    </div>
    <div v-else class="panel"><EmptyState /></div>
  </section>
</template>
