<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { PrivacyRiskLevel } from "../constants/PrivacyRiskLevel";
import { formatRisk } from "../utils/formatters";
import RiskTag from "../components/common/RiskTag.vue";
import EmptyState from "../components/common/EmptyState.vue";
import type { PolicySection } from "../types/PolicySection";

const documentStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();

const levelFilter = ref("ALL");
const rows = computed(() =>
  sectionStore.rows
    .map((section) => ({
      ...section,
      documentLabel: documentStore.rows.find((doc) => doc.id === section.document_id)?.version_label ?? `#${section.document_id}`
    }))
    .filter((section) => levelFilter.value === "ALL" || section.risk_level === levelFilter.value)
    .sort((a, b) => a.document_id - b.document_id || a.id - b.id)
);

// 风险重标只写 live 条款；已冻结批次的条目在创建时已拷贝固化，不随这里变化。
async function changeRisk(section: PolicySection, level: string) {
  await sectionStore.updateRiskLevel(section.id, level);
  ElMessage.success("风险等级已更新；已冻结的审阅批次不受影响");
}
</script>

<template>
  <section class="panel toolbar">
    <label>风险等级
      <el-select v-model="levelFilter" class="type-select">
        <el-option label="全部" value="ALL" />
        <el-option v-for="level in PrivacyRiskLevel" :key="level" :label="formatRisk(level)" :value="level" />
      </el-select>
    </label>
    <p class="hint">重标只影响当前条款与后续对比，不会回写已冻结的审阅批次。</p>
  </section>
  <EmptyState v-if="!rows.length" />
  <article v-for="section in rows" :key="section.id" class="panel risk-row">
    <header class="review-item-head">
      <strong>{{ section.documentLabel }} · {{ section.section_no }}. {{ section.heading }}</strong>
      <span class="tags">
        <span class="badge">{{ section.category }}</span>
        <RiskTag :level="section.risk_level" />
      </span>
    </header>
    <p class="summary">{{ section.content }}</p>
    <div class="review-form">
      <el-select :model-value="section.risk_level" class="status-select" @change="(level: string) => changeRisk(section, level)">
        <el-option v-for="level in PrivacyRiskLevel" :key="level" :label="`${formatRisk(level)}风险`" :value="level" />
      </el-select>
    </div>
  </article>
</template>
