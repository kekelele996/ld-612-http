import { defineStore } from "pinia";
import { listPolicyDocument, savePolicyDocument } from "../api/PolicyDocument";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { PolicyDocument } from "../types/PolicyDocument";

export const usePolicyDocumentStore = defineStore("policyDocument", {
  state: () => ({ rows: [] as PolicyDocument[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listPolicyDocument();
      this.loading = false;
    },
    async addDocument(doc: PolicyDocument) {
      await savePolicyDocument(doc);
      console.info(LOG_TEMPLATES.PolicyDocument[0], doc.version_label);
      await this.load();
    }
  }
});
