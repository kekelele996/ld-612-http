<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { useReviewBatchStore } from "../stores/ReviewBatchStore";
import { useTextDiff } from "../hooks/useTextDiff";
import { DiffType, DiffTypeText } from "../constants/DiffType";
import StatusBadge from "../components/common/StatusBadge.vue";
import RiskTag from "../components/common/RiskTag.vue";
import EmptyState from "../components/common/EmptyState.vue";

const emit = defineEmits<{ (e: "navigate", route: string): void }>();

const documentStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();
const batchStore = useReviewBatchStore();
const { computeDiff } = useTextDiff();

const oldDocumentId = ref(0);
const newDocumentId = ref(0);
const activeTypes = ref<string[]>([...DiffType]);
const batchName = ref("");
const errorMessage = ref("");

onMounted(async () => {
  await Promise.all([documentStore.load(), sectionStore.load(), batchStore.load()]);
  oldDocumentId.value = documentStore.rows[0]?.id ?? 0;
  newDocumentId.value = documentStore.rows[1]?.id ?? documentStore.rows[0]?.id ?? 0;
});

const sectionsOf = (documentId: number) => sectionStore.rows.filter((row) => row.document_id === documentId);
const oldDocument = computed(() => documentStore.rows.find((row) => row.id === oldDocumentId.value));
const newDocument = computed(() => documentStore.rows.find((row) => row.id === newDocumentId.value));
const diffs = computed(() => computeDiff(sectionsOf(oldDocumentId.value), sectionsOf(newDocumentId.value)));
const changedDiffs = computed(() => diffs.value.filter((row) => row.diff_type !== "UNCHANGED"));
const visibleDiffs = computed(() => diffs.value.filter((row) => activeTypes.value.includes(row.diff_type)));

function toggleType(type: string) {
  activeTypes.value = activeTypes.value.includes(type)
    ? activeTypes.value.filter((value) => value !== type)
    : [...activeTypes.value, type];
}

async function createBatch() {
  errorMessage.value = "";
  try {
    await batchStore.createFromComparison({
      name: batchName.value,
      oldDocument: oldDocument.value,
      newDocument: newDocument.value,
      diffs: changedDiffs.value
    });
    emit("navigate", "/batches");
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
  }
}
</script>

<template>
  <section class="compare">
    <div class="panel">
      <h2>选择对比版本</h2>
      <div class="toolbar">
        <label>旧版本
          <select v-model.number="oldDocumentId">
            <option v-for="doc in documentStore.rows" :key="doc.id" :value="doc.id">{{ doc.version_label }}</option>
          </select>
        </label>
        <label>新版本
          <select v-model.number="newDocumentId">
            <option v-for="doc in documentStore.rows" :key="doc.id" :value="doc.id">{{ doc.version_label }}</option>
          </select>
        </label>
      </div>
      <div class="toolbar">
        <span class="muted">差异类型：</span>
        <label v-for="type in DiffType" :key="type" class="check">
          <input type="checkbox" :checked="activeTypes.includes(type)" @change="toggleType(type)" /> {{ DiffTypeText[type] }}
        </label>
      </div>
    </div>

    <div class="panel">
      <h2>冻结为审阅批次</h2>
      <p class="hint">创建批次会把当前两版条款、差异类型和风险等级一并冻结；批次未关闭前，政策再导入或风险重标都不会改变批次内容，当前对比则继续反映最新政策。</p>
      <div class="toolbar">
        <input v-model="batchName" class="grow" placeholder="批次名称，例如：2026-09 合规复审" />
        <button class="primary" @click="createBatch">创建审阅批次（{{ changedDiffs.length }} 条差异）</button>
      </div>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </div>

    <div class="panel">
      <h2>当前对比（实时反映最新政策）</h2>
      <article v-for="row in visibleDiffs" :key="row.heading" class="diff-row">
        <header><StatusBadge :value="row.diff_type" /><RiskTag :level="row.risk_level" /><strong>{{ row.heading }}</strong></header>
        <p>{{ row.summary }}</p>
        <div class="diff-columns">
          <blockquote v-if="row.old_content"><em>旧版</em>{{ row.old_content }}</blockquote>
          <blockquote v-if="row.new_content"><em>新版</em>{{ row.new_content }}</blockquote>
        </div>
      </article>
      <EmptyState v-if="!visibleDiffs.length" />
    </div>
  </section>
</template>
