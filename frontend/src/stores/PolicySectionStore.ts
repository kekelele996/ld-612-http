import { defineStore } from "pinia";
import { listPolicySection, savePolicySection } from "../api/PolicySection";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { PolicySection } from "../types/PolicySection";

export const usePolicySectionStore = defineStore("policySection", {
  state: () => ({ rows: [] as PolicySection[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listPolicySection();
      this.loading = false;
    },
    async addSections(sections: PolicySection[]) {
      for (const section of sections) await savePolicySection(section);
      console.info(LOG_TEMPLATES.PolicySection[0], `${sections.length} 条`);
      await this.load();
    },
    // 风险重标只更新 live 条款，已冻结的审阅批次条目不受影响。
    async updateRiskLevel(sectionId: number, riskLevel: string) {
      const section = this.rows.find((row) => row.id === sectionId);
      if (!section) return;
      await savePolicySection({ ...section, risk_level: riskLevel });
      console.info(LOG_TEMPLATES.PolicySection[2], sectionId);
      await this.load();
    }
  }
});
