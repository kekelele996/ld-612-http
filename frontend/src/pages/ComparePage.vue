<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { useReviewBatchStore } from "../stores/ReviewBatchStore";
import { computeSectionDiffs } from "../hooks/useTextDiff";
import { DiffType } from "../constants/DiffType";
import { formatDiffType } from "../utils/formatters";
import { useNavigate } from "../router/navigation";
import StatusBadge from "../components/common/StatusBadge.vue";
import RiskTag from "../components/common/RiskTag.vue";
import DiffViewer from "../components/common/DiffViewer.vue";
import EmptyState from "../components/common/EmptyState.vue";
import StatCard from "../components/common/StatCard.vue";
import type { PolicySection } from "../types/PolicySection";

const documentStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();
const batchStore = useReviewBatchStore();
const navigate = useNavigate();

const sortedDocs = computed(() => [...documentStore.rows].sort((a, b) => a.imported_at.localeCompare(b.imported_at)));
const oldDocId = ref<number>();
const newDocId = ref<number>();
watch(
  sortedDocs,
  (docs) => {
    if (!oldDocId.value && docs.length) oldDocId.value = docs[0].id;
    if (!newDocId.value && docs.length > 1) newDocId.value = docs[docs.length - 1].id;
  },
  { immediate: true }
);

const oldDocument = computed(() => documentStore.rows.find((doc) => doc.id === oldDocId.value));
const newDocument = computed(() => documentStore.rows.find((doc) => doc.id === newDocId.value));
const sectionsOf = (documentId?: number) =>
  sectionStore.rows.filter((section) => section.document_id === documentId).sort((a, b) => a.id - b.id);
const oldSections = computed(() => sectionsOf(oldDocId.value));
const newSections = computed(() => sectionsOf(newDocId.value));

// 当前对比始终实时反映最新导入的政策与最新风险标注。
const diffs = computed(() =>
  oldDocId.value && newDocId.value ? computeSectionDiffs(oldSections.value, newSections.value, oldDocId.value, newDocId.value) : []
);
const changedDiffs = computed(() => diffs.value.filter((diff) => diff.diff_type !== "UNCHANGED"));

const typeFilter = ref("ALL");
const filteredDiffs = computed(() =>
  typeFilter.value === "ALL" ? diffs.value : diffs.value.filter((diff) => diff.diff_type === typeFilter.value)
);

const diffRows = computed(() =>
  filteredDiffs.value.map((diff) => {
    const newSection = newSections.value.find((section) => section.id === diff.section_id);
    const removedOld = oldSections.value.find((section) => section.id === diff.section_id);
    const anchor = newSection ?? removedOld;
    const oldSection = oldSections.value.find((section) => section.section_no === anchor?.section_no);
    return { diff, anchor, oldSection, newSection, riskLevel: newSection?.risk_level ?? oldSection?.risk_level ?? "LOW" };
  })
);

const countOf = (type: string) => diffs.value.filter((diff) => diff.diff_type === type).length;

const dialogVisible = ref(false);
const batchName = ref("");
const reviewer = ref("");
watch(dialogVisible, (visible) => {
  if (visible && oldDocument.value && newDocument.value) {
    batchName.value = `${oldDocument.value.version_label} → ${newDocument.value.version_label} 审阅批次`;
  }
});

async function confirmCreate() {
  if (!oldDocument.value || !newDocument.value) return;
  try {
    const batch = await batchStore.createFromComparison({
      name: batchName.value.trim(),
      createdBy: reviewer.value.trim(),
      oldDocument: oldDocument.value,
      newDocument: newDocument.value,
      diffs: changedDiffs.value,
      oldSections: oldSections.value as PolicySection[],
      newSections: newSections.value as PolicySection[]
    });
    dialogVisible.value = false;
    ElMessage.success(`已冻结 ${changedDiffs.value.length} 条差异到「${batch.name}」`);
    navigate("/review");
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}
</script>

<template>
  <section v-if="sortedDocs.length < 2" class="panel"><EmptyState /><p class="hint">请先在「文档导入」页准备至少两个版本。</p></section>
  <template v-else>
    <section class="panel toolbar">
      <label>旧版本
        <el-select v-model="oldDocId" class="doc-select">
          <el-option v-for="doc in sortedDocs" :key="doc.id" :label="`${doc.title} ${doc.version_label}`" :value="doc.id" />
        </el-select>
      </label>
      <span class="arrow">→</span>
      <label>新版本
        <el-select v-model="newDocId" class="doc-select">
          <el-option v-for="doc in sortedDocs" :key="doc.id" :label="`${doc.title} ${doc.version_label}`" :value="doc.id" />
        </el-select>
      </label>
      <label>差异类型
        <el-select v-model="typeFilter" class="type-select">
          <el-option label="全部" value="ALL" />
          <el-option v-for="type in DiffType" :key="type" :label="formatDiffType(type)" :value="type" />
        </el-select>
      </label>
      <el-button type="primary" :disabled="!changedDiffs.length" @click="dialogVisible = true">冻结为审阅批次</el-button>
    </section>

    <section class="metrics">
      <StatCard label="差异条目" :value="changedDiffs.length" />
      <StatCard label="新增 / 删除" :value="`${countOf('ADDED')} / ${countOf('REMOVED')}`" />
      <StatCard label="修改 / 移动" :value="`${countOf('MODIFIED')} / ${countOf('MOVED')}`" />
    </section>

    <EmptyState v-if="!diffRows.length" />
    <article v-for="row in diffRows" :key="row.diff.id" class="panel diff-row">
      <header class="review-item-head">
        <strong>{{ row.anchor?.section_no }}. {{ row.anchor?.heading }}</strong>
        <span class="tags">
          <StatusBadge :value="formatDiffType(row.diff.diff_type)" />
          <RiskTag :level="row.riskLevel" />
        </span>
      </header>
      <p class="summary">{{ row.diff.summary }}</p>
      <DiffViewer :old-text="row.oldSection?.content ?? ''" :new-text="row.newSection?.content ?? ''" />
    </article>

    <el-dialog v-model="dialogVisible" title="冻结为审阅批次" width="480px">
      <p class="hint">将把当前对比的 {{ changedDiffs.length }} 条差异、两版条款内容与风险等级冻结；之后政策再导入或风险重标都不会改变批次内容。</p>
      <el-input v-model="batchName" placeholder="批次名称" class="dialog-field" />
      <el-input v-model="reviewer" placeholder="创建人" class="dialog-field" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate">创建批次</el-button>
      </template>
    </el-dialog>
  </template>
</template>
