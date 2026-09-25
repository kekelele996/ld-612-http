export interface ReviewBatchItem {
  id: number;
  section_id: number;
  heading: string;
  diff_type: string;
  risk_level: string;
  summary: string;
  old_content: string;
  new_content: string;
}
