import type { PolicySection } from "../types/PolicySection";

export interface SectionDiff {
  section_id: number;
  heading: string;
  diff_type: string;
  risk_level: string;
  summary: string;
  old_content: string;
  new_content: string;
}

export function useTextDiff() {
  function computeDiff(oldSections: PolicySection[], newSections: PolicySection[]): SectionDiff[] {
    const rows: SectionDiff[] = [];
    const newByHeading = new Map(newSections.map((section) => [section.heading, section]));
    const oldByHeading = new Map(oldSections.map((section) => [section.heading, section]));
    for (const oldSection of oldSections) {
      const matched = newByHeading.get(oldSection.heading);
      if (!matched) {
        rows.push({
          section_id: oldSection.id,
          heading: oldSection.heading,
          diff_type: "REMOVED",
          risk_level: oldSection.risk_level,
          summary: `条款「${oldSection.heading}」在新版本中被删除`,
          old_content: oldSection.content,
          new_content: ""
        });
        continue;
      }
      if (matched.content !== oldSection.content) {
        rows.push({
          section_id: matched.id,
          heading: matched.heading,
          diff_type: "MODIFIED",
          risk_level: matched.risk_level,
          summary: `条款「${matched.heading}」内容发生修改`,
          old_content: oldSection.content,
          new_content: matched.content
        });
      } else if (matched.section_no !== oldSection.section_no) {
        rows.push({
          section_id: matched.id,
          heading: matched.heading,
          diff_type: "MOVED",
          risk_level: matched.risk_level,
          summary: `条款「${matched.heading}」位置由 ${oldSection.section_no} 调整为 ${matched.section_no}`,
          old_content: oldSection.content,
          new_content: matched.content
        });
      } else {
        rows.push({
          section_id: matched.id,
          heading: matched.heading,
          diff_type: "UNCHANGED",
          risk_level: matched.risk_level,
          summary: `条款「${matched.heading}」未发生变化`,
          old_content: oldSection.content,
          new_content: matched.content
        });
      }
    }
    for (const newSection of newSections) {
      if (!oldByHeading.has(newSection.heading)) {
        rows.push({
          section_id: newSection.id,
          heading: newSection.heading,
          diff_type: "ADDED",
          risk_level: newSection.risk_level,
          summary: `条款「${newSection.heading}」为新增条款`,
          old_content: "",
          new_content: newSection.content
        });
      }
    }
    return rows;
  }
  return { computeDiff };
}
