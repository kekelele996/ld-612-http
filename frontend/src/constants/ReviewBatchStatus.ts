export const ReviewBatchStatus = ["OPEN", "CLOSED"] as const;
export type ReviewBatchStatus = (typeof ReviewBatchStatus)[number];
export const ReviewBatchStatusText: Record<ReviewBatchStatus, string> = {
  OPEN: "进行中",
  CLOSED: "已关闭"
};
