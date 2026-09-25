export interface ReviewBatchNote {
  id: number;
  batch_id: number;
  item_id: number;
  reviewer: string;
  comment: string;
  status: string;
  updated_at: string;
}
