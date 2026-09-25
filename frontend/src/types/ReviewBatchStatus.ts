export const ReviewBatchStatus = ["OPEN","CLOSED"] as const;
export type ReviewBatchStatus = (typeof ReviewBatchStatus)[number];
export const ReviewBatchStatusText: Record<ReviewBatchStatus, string> = Object.fromEntries(ReviewBatchStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<ReviewBatchStatus, string>;
