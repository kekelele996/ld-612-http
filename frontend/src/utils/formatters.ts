import type { ReviewBatch } from "../types/ReviewBatch";
import type { ReviewBatchItem } from "../types/ReviewBatchItem";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatDiffType = (value: string) => ({ ADDED: "新增", REMOVED: "删除", MODIFIED: "修改", MOVED: "移动", UNCHANGED: "未变化" }[value] ?? value);
export const formatReviewStatus = (value: string) => ({ OPEN: "待处理", CONFIRMED: "已确认", IGNORED: "已忽略", RESOLVED: "已解决" }[value] ?? value);
export const formatBatchStatus = (value: string) => ({ OPEN: "进行中", CLOSED: "已关闭" }[value] ?? value);

// 导出摘要：只取批次冻结时的版本号、差异类型、风险等级与条款内容。
export function buildBatchSummaryMarkdown(batch: ReviewBatch, items: ReviewBatchItem[]): string {
  const lines = [
    `# 审阅批次摘要：${batch.name}`,
    "",
    `- 对比版本（冻结）：${batch.old_version_label} → ${batch.new_version_label}`,
    `- 批次状态：${formatBatchStatus(batch.status)}`,
    `- 创建：${batch.created_by} · ${formatDate(batch.created_at)}`,
    `- 关闭：${batch.closed_at ? formatDate(batch.closed_at) : "未关闭"}`,
    "",
    `## 冻结差异条目（共 ${items.length} 条）`
  ];
  items.forEach((item, index) => {
    lines.push(
      "",
      `### ${index + 1}. [${formatDiffType(item.diff_type)}] ${item.section_no}. ${item.heading}（风险：${formatRisk(item.risk_level)}）`,
      `- 处理状态：${formatReviewStatus(item.status)}`,
      `- 审阅人：${item.reviewer || "未填写"}`,
      `- 审阅意见：${item.comment || "无"}`,
      `- 旧版内容：${item.old_content || "（无）"}`,
      `- 新版内容：${item.new_content || "（无）"}`
    );
  });
  return lines.join("\n");
}
