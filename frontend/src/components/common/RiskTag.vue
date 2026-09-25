<script setup lang="ts">
import { formatRisk } from "../../utils/formatters";
defineProps<{ level: string }>();
</script>

<template><span class="risk-tag" :data-level="level">{{ formatRisk(level) }}风险</span></template>
