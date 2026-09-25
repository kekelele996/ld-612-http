<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{ (e: "import", payload: { title: string; versionLabel: string; rawText: string }): void }>();

const title = ref("隐私政策");
const versionLabel = ref("");
const rawText = ref("");

function submit() {
  if (!versionLabel.value.trim() || !rawText.value.trim()) return;
  emit("import", { title: title.value.trim() || "隐私政策", versionLabel: versionLabel.value.trim(), rawText: rawText.value });
  rawText.value = "";
}
</script>

<template>
  <div class="panel import-panel">
    <h2>导入新版本</h2>
    <el-input v-model="title" placeholder="文档标题" />
    <el-input v-model="versionLabel" placeholder="版本号，如 v1.4" />
    <el-input v-model="rawText" type="textarea" :rows="8" placeholder="粘贴政策全文，按「1. 条款标题」自动分段" />
    <el-button type="primary" :disabled="!versionLabel.trim() || !rawText.trim()" @click="submit">解析并导入</el-button>
    <p class="hint">导入只追加新版本，不会改动已冻结的审阅批次。</p>
  </div>
</template>
