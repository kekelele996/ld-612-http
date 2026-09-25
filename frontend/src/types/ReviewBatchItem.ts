export interface ReviewBatchItem {
  id: number;
  batch_id: number;
  diff_result_id: number;
  section_no: string;
  heading: string;
  old_content: string;
  new_content: string;
  diff_type: string;
  risk_level: string;
  comment: string;
  reviewer: string;
  status: string;
}
