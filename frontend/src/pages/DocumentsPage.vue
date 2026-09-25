<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { parsePolicyText } from "../hooks/usePolicyParser";
import { createPolicyDocumentForm } from "../constructors/PolicyDocumentConstructor";
import { createPolicySectionForm } from "../constructors/PolicySectionConstructor";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { formatDate } from "../utils/formatters";
import ImportPanel from "../components/common/ImportPanel.vue";
import SectionCard from "../components/common/SectionCard.vue";
import EmptyState from "../components/common/EmptyState.vue";

const documentStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();

const documents = computed(() => [...documentStore.rows].sort((a, b) => a.imported_at.localeCompare(b.imported_at)));
const selectedDocId = ref<number>();
const selectedDoc = computed(() => documentStore.rows.find((doc) => doc.id === selectedDocId.value) ?? documents.value[documents.value.length - 1]);
const sectionsOfSelected = computed(() =>
  sectionStore.rows.filter((section) => section.document_id === selectedDoc.value?.id).sort((a, b) => a.id - b.id)
);
const sectionCountOf = (documentId: number) => sectionStore.rows.filter((section) => section.document_id === documentId).length;

async function handleImport(payload: { title: string; versionLabel: string; rawText: string }) {
  const parsed = parsePolicyText(payload.rawText);
  if (!parsed.length) {
    ElMessage.error(ERROR_MESSAGES.VALIDATION_FAILED);
    return;
  }
  const documentId = documentStore.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  let sectionId = sectionStore.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  const doc = createPolicyDocumentForm({
    id: documentId,
    title: payload.title,
    version_label: payload.versionLabel,
    raw_text: payload.rawText,
    normalized_sections: parsed.map((section) => section.section_no).join(","),
    imported_at: new Date().toISOString()
  });
  const sections = parsed.map((section) =>
    createPolicySectionForm({ id: sectionId++, document_id: documentId, ...section, category: "未分类", risk_level: "LOW" })
  );
  await documentStore.addDocument(doc);
  await sectionStore.addSections(sections);
  console.info(LOG_TEMPLATES.PolicyDocument[0], doc.version_label);
  selectedDocId.value = documentId;
  ElMessage.success(`已导入 ${payload.versionLabel}，解析出 ${parsed.length} 个条款段落`);
}
</script>

<template>
  <section class="workbench">
    <div class="panel wide">
      <h2>版本列表</h2>
      <EmptyState v-if="!documents.length" />
      <article
        v-for="doc in documents"
        :key="doc.id"
        class="row batch-row"
        :class="{ active: doc.id === selectedDoc?.id }"
        @click="selectedDocId = doc.id"
      >
        <div>
          <strong>{{ doc.title }} {{ doc.version_label }}</strong>
          <p class="hint">导入于 {{ formatDate(doc.imported_at) }}</p>
        </div>
        <span class="badge">{{ sectionCountOf(doc.id) }} 段</span>
      </article>
    </div>
    <ImportPanel @import="handleImport" />
  </section>
  <section v-if="selectedDoc" class="panel">
    <h2>{{ selectedDoc.title }} {{ selectedDoc.version_label }} · 条款段落</h2>
    <EmptyState v-if="!sectionsOfSelected.length" />
    <div class="section-grid">
      <SectionCard
        v-for="section in sectionsOfSelected"
        :key="section.id"
        :section-no="section.section_no"
        :heading="section.heading"
        :content="section.content"
        :category="section.category"
        :risk-level="section.risk_level"
      />
    </div>
  </section>
</template>
