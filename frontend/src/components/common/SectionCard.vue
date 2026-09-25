<script setup lang="ts">
import RiskTag from "./RiskTag.vue";

defineProps<{ sectionNo: string; heading: string; content: string; category?: string; riskLevel?: string }>();
</script>

<template>
  <article class="section-card">
    <header>
      <strong>{{ sectionNo }}. {{ heading }}</strong>
      <RiskTag v-if="riskLevel" :level="riskLevel" />
    </header>
    <p>{{ content }}</p>
    <footer v-if="category"><span class="badge">{{ category }}</span></footer>
  </article>
</template>
