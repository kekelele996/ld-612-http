<script setup lang="ts">
import { computed, onMounted, provide, ref } from "vue";
import { routes } from "./router/routes";
import { NAVIGATE_KEY } from "./router/navigation";
import { usePolicyDocumentStore } from "./stores/PolicyDocumentStore";
import { usePolicySectionStore } from "./stores/PolicySectionStore";
import { useDiffResultStore } from "./stores/DiffResultStore";
import { useReviewNoteStore } from "./stores/ReviewNoteStore";
import { useReviewBatchStore } from "./stores/ReviewBatchStore";
import DocumentsPage from "./pages/DocumentsPage.vue";
import ComparePage from "./pages/ComparePage.vue";
import RisksPage from "./pages/RisksPage.vue";
import ReviewPage from "./pages/ReviewPage.vue";
import StatusBadge from "./components/common/StatusBadge.vue";

const active = ref<string>(routes[0]?.route ?? "/documents");
provide(NAVIGATE_KEY, (route: string) => { active.value = route; });

const pages = { "/documents": DocumentsPage, "/compare": ComparePage, "/risks": RisksPage, "/review": ReviewPage } as const;
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);
const currentPage = computed(() => pages[active.value as keyof typeof pages] ?? DocumentsPage);

const batchStore = useReviewBatchStore();
const openBatchCount = computed(() => batchStore.batches.filter((batch) => batch.status === "OPEN").length);

onMounted(async () => {
  const documentStore = usePolicyDocumentStore();
  const sectionStore = usePolicySectionStore();
  const diffStore = useDiffResultStore();
  const noteStore = useReviewNoteStore();
  await Promise.all([documentStore.load(), sectionStore.load(), diffStore.load(), noteStore.load(), batchStore.load()]);
});
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">隐私政策差异对比器</div>
      <nav>
        <button v-for="route in routes" :key="route.route" :class="{ active: active === route.route }" @click="active = route.route">
          {{ route.name }}<template v-if="route.route === '/review' && openBatchCount">（{{ openBatchCount }}）</template>
        </button>
      </nav>
    </aside>
    <main class="page">
      <section class="page-head">
        <div><p class="eyebrow">policy-diff</p><h1>{{ current?.name }}</h1></div>
        <StatusBadge value="LOCAL_DATA" />
      </section>
      <component :is="currentPage" />
    </main>
  </div>
</template>
