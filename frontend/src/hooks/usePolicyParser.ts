import { computed, ref } from "vue";

export function usePolicyParser<T>(rows: T[] = []) {
  const page = ref(1);
  const pageSize = 8;
  const pageRows = computed(() => rows.slice((page.value - 1) * pageSize, page.value * pageSize));
  return { page, pageSize, pageRows, total: rows.length };
}

export interface ParsedSection {
  section_no: string;
  heading: string;
  content: string;
}

// 粘贴文本自动分段：识别「1. 标题」「一、标题」「第3条 标题」等条款标题行。
export function parsePolicyText(rawText: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const headingPattern = /^\s*第?\s*(\d+|[一二三四五六七八九十]+)\s*[条、.．)]\s*(.+)$/;
  let current: ParsedSection | null = null;
  for (const line of rawText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(headingPattern);
    if (match) {
      current = { section_no: match[1], heading: match[2].trim(), content: "" };
      sections.push(current);
    } else if (current) {
      current.content = current.content ? `${current.content}${trimmed}` : trimmed;
    } else {
      current = { section_no: String(sections.length + 1), heading: "未命名条款", content: trimmed };
      sections.push(current);
    }
  }
  return sections;
}
