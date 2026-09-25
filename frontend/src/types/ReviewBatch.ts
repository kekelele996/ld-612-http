export interface ReviewBatch {
  id: number;
  name: string;
  old_document_id: number;
  new_document_id: number;
  old_version_label: string;
  new_version_label: string;
  status: string;
  created_by: string;
  created_at: string;
  closed_at: string | null;
}
