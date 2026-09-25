<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useReviewBatchStore } from "../stores/ReviewBatchStore";
import { formatBatchStatus, formatDate, formatReviewStatus } from "../utils/formatters";
import { useNavigate } from "../router/navigation";
import StatusBadge from "../components/common/StatusBadge.vue";
import ReviewChecklist from "../components/common/ReviewChecklist.vue";
import EmptyState from "../components/common/EmptyState.vue";
import StatCard from "../components/common/StatCard.vue";
import type { ReviewBatchItem } from "../types/ReviewBatchItem";

const batchStore = useReviewBatchStore();
const navigate = useNavigate();

const batches = computed(() => [...batchStore.batches].sort((a, b) => b.created_at.localeCompare(a.created_at)));
const selectedId = ref<number>();
watch(
  batches,
  (rows) => {
    if (!rows.length) { selectedId.value = undefined; return; }
    if (!selectedId.value || !rows.some((batch) => batch.id === selectedId.value)) selectedId.value = rows[0].id;
  },
  { immediate: true }
);

const selectedBatch = computed(() => batches.value.find((batch) => batch.id === selectedId.value));
const items = computed(() => (selectedId.value ? batchStore.itemsOf(selectedId.value) : []));
const isClosed = computed(() => selectedBatch.value?.status === "CLOSED");
const openCount = computed(() => batchStore.batches.filter((batch) => batch.status === "OPEN").length);
const doneCount = computed(() => items.value.filter((item) => item.status === "RESOLVED" || item.status === "CONFIRMED").length);

async function saveItem(item: ReviewBatchItem) {
  try {
    await batchStore.saveItem(item);
    ElMessage.success("审阅意见已保存");
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function closeBatch() {
  if (!selectedBatch.value) return;
  try {
    await ElMessageBox.confirm("关闭后批次内容保持冻结，不可再修改，确定关闭？", "关闭审阅批次", { type: "warning" });
    await batchStore.closeBatch(selectedBatch.value.id);
    ElMessage.success("批次已关闭，记录将原样保留");
  } catch (error) {
    if (error instanceof Error) ElMessage.error(error.message);
  }
}

function exportSummary() {
  if (!selectedBatch.value) return;
  try {
    const markdown = batchStore.exportBatchSummary(selectedBatch.value.id);
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedBatch.value.name}-审阅摘要.md`;
    link.click();
    URL.revokeObjectURL(url);
    ElMessage.success("摘要已导出（含冻结时的版本与差异）");
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}
</script>

<template>
  <section v-if="!batches.length" class="panel empty-batch">
    <EmptyState />
    <p class="hint">还没有审阅批次。到「版本对比」页把当前对比结果冻结成批次后，再回来逐条审阅。</p>
    <el-button type="primary" @click="navigate('/compare')">前往版本对比</el-button>
  </section>
  <template v-else>
    <section class="metrics">
      <StatCard label="批次总数" :value="batches.length" />
      <StatCard label="进行中" :value="openCount" />
      <StatCard label="已关闭" :value="batches.length - openCount" />
    </section>
    <section class="workbench">
      <div class="panel wide">
        <h2>审阅批次</h2>
        <article
          v-for="batch in batches"
          :key="batch.id"
          class="row batch-row"
          :class="{ active: batch.id === selectedId }"
          @click="selectedId = batch.id"
        >
          <div>
            <strong>{{ batch.name }}</strong>
            <p class="hint">{{ batch.old_version_label }} → {{ batch.new_version_label }} · {{ batch.created_by }} · {{ formatDate(batch.created_at) }}</p>
          </div>
          <StatusBadge :value="formatBatchStatus(batch.status)" />
        </article>
      </div>
      <div class="panel" v-if="selectedBatch">
        <h2>批次进度</h2>
        <p>{{ doneCount }} / {{ items.length }} 条已处理</p>
        <p v-for="status in ['OPEN','CONFIRMED','IGNORED','RESOLVED']" :key="status" class="hint">
          {{ formatReviewStatus(status) }}：{{ items.filter((item) => item.status === status).length }} 条
        </p>
      </div>
    </section>

    <section v-if="selectedBatch" class="panel batch-detail">
      <header class="batch-head">
        <div>
          <h2>{{ selectedBatch.name }}</h2>
          <p class="hint">
            冻结版本：{{ selectedBatch.old_version_label }} → {{ selectedBatch.new_version_label }} ·
            创建于 {{ formatDate(selectedBatch.created_at) }} ·
            {{ selectedBatch.closed_at ? `关闭于 ${formatDate(selectedBatch.closed_at)}` : "未关闭" }}
          </p>
          <p v-if="isClosed" class="hint">批次已关闭，以下为冻结时的记录，仅供查阅；当前对比页仍反映最新政策。</p>
        </div>
        <div class="batch-actions">
          <el-button @click="exportSummary">导出摘要</el-button>
          <el-button v-if="!isClosed" type="danger" @click="closeBatch">关闭批次</el-button>
        </div>
      </header>
      <ReviewChecklist :items="items" :readonly="isClosed" @save="saveItem" />
    </section>
  </template>
</template>
