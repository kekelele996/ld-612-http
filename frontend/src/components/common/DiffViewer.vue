<script setup lang="ts">
withDefaults(defineProps<{ title?: string; oldText: string; newText: string; oldLabel?: string; newLabel?: string }>(), {
  title: "",
  oldLabel: "旧版条款",
  newLabel: "新版条款"
});
</script>

<template>
  <div class="diff-viewer">
    <p v-if="title" class="diff-title">{{ title }}</p>
    <div class="diff-panes">
      <div class="pane old"><span>{{ oldLabel }}</span><p>{{ oldText || "（无）" }}</p></div>
      <div class="pane new"><span>{{ newLabel }}</span><p>{{ newText || "（无）" }}</p></div>
    </div>
  </div>
</template>
