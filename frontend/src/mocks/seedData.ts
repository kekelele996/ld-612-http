export const mockData = {
  "policyDocument": [
    {
      "id": 1,
      "title": "隐私政策",
      "version_label": "v1.0（2026-03 版）",
      "raw_text": "隐私政策 v1.0 全文",
      "normalized_sections": "6",
      "imported_at": "2026-03-01T09:00:00Z"
    },
    {
      "id": 2,
      "title": "隐私政策",
      "version_label": "v2.0（2026-06 版）",
      "raw_text": "隐私政策 v2.0 全文",
      "normalized_sections": "7",
      "imported_at": "2026-06-15T09:00:00Z"
    },
    {
      "id": 3,
      "title": "隐私政策",
      "version_label": "v2.1（2026-09 版）",
      "raw_text": "隐私政策 v2.1 全文",
      "normalized_sections": "8",
      "imported_at": "2026-09-01T09:00:00Z"
    }
  ],
  "policySection": [
    {
      "id": 1,
      "document_id": 1,
      "section_no": "1",
      "heading": "引言",
      "content": "本政策说明我们如何收集、使用和保护您的个人信息。",
      "category": "总则",
      "risk_level": "LOW"
    },
    {
      "id": 2,
      "document_id": 1,
      "section_no": "2",
      "heading": "我们收集的信息",
      "content": "我们收集您主动提供的注册信息，包括姓名和联系方式。",
      "category": "数据收集",
      "risk_level": "MEDIUM"
    },
    {
      "id": 3,
      "document_id": 1,
      "section_no": "3",
      "heading": "信息共享",
      "content": "我们不会向任何第三方共享您的个人信息。",
      "category": "数据共享",
      "risk_level": "HIGH"
    },
    {
      "id": 4,
      "document_id": 1,
      "section_no": "4",
      "heading": "保存期限",
      "content": "我们仅在实现目的所必需的最短期间内保存您的个人信息。",
      "category": "保存期限",
      "risk_level": "MEDIUM"
    },
    {
      "id": 5,
      "document_id": 1,
      "section_no": "5",
      "heading": "您的权利",
      "content": "您可以访问、更正或删除您的个人信息。",
      "category": "用户权利",
      "risk_level": "MEDIUM"
    },
    {
      "id": 6,
      "document_id": 1,
      "section_no": "6",
      "heading": "联系我们",
      "content": "如有疑问，请通过 privacy@example.com 与我们联系。",
      "category": "联系方式",
      "risk_level": "LOW"
    },
    {
      "id": 7,
      "document_id": 2,
      "section_no": "1",
      "heading": "引言",
      "content": "本政策说明我们如何收集、使用和保护您的个人信息。",
      "category": "总则",
      "risk_level": "LOW"
    },
    {
      "id": 8,
      "document_id": 2,
      "section_no": "2",
      "heading": "我们收集的信息",
      "content": "我们收集您主动提供的注册信息，并自动收集设备信息与日志信息。",
      "category": "数据收集",
      "risk_level": "HIGH"
    },
    {
      "id": 9,
      "document_id": 2,
      "section_no": "3",
      "heading": "信息共享",
      "content": "我们可能向提供统计分析服务的第三方 SDK 共享去标识化信息。",
      "category": "数据共享",
      "risk_level": "CRITICAL"
    },
    {
      "id": 10,
      "document_id": 2,
      "section_no": "4",
      "heading": "保存期限",
      "content": "我们仅在实现目的所必需的最短期间内保存您的个人信息。",
      "category": "保存期限",
      "risk_level": "MEDIUM"
    },
    {
      "id": 11,
      "document_id": 2,
      "section_no": "5",
      "heading": "您的权利",
      "content": "您可以访问、更正或删除您的个人信息。",
      "category": "用户权利",
      "risk_level": "MEDIUM"
    },
    {
      "id": 12,
      "document_id": 2,
      "section_no": "6",
      "heading": "Cookie 使用",
      "content": "我们使用 Cookie 记住您的登录状态和偏好设置。",
      "category": "Cookie",
      "risk_level": "MEDIUM"
    },
    {
      "id": 13,
      "document_id": 2,
      "section_no": "7",
      "heading": "联系我们",
      "content": "如有疑问，请通过 privacy@example.com 与我们联系。",
      "category": "联系方式",
      "risk_level": "LOW"
    },
    {
      "id": 14,
      "document_id": 3,
      "section_no": "1",
      "heading": "引言",
      "content": "本政策说明我们如何收集、使用和保护您的个人信息。",
      "category": "总则",
      "risk_level": "LOW"
    },
    {
      "id": 15,
      "document_id": 3,
      "section_no": "2",
      "heading": "我们收集的信息",
      "content": "我们收集您主动提供的注册信息，并自动收集设备信息、日志信息与粗略位置信息。",
      "category": "数据收集",
      "risk_level": "CRITICAL"
    },
    {
      "id": 16,
      "document_id": 3,
      "section_no": "3",
      "heading": "信息共享",
      "content": "我们可能向提供统计分析服务的第三方 SDK 共享去标识化信息。",
      "category": "数据共享",
      "risk_level": "CRITICAL"
    },
    {
      "id": 17,
      "document_id": 3,
      "section_no": "4",
      "heading": "保存期限",
      "content": "我们将在账号存续期间及注销后三年内保存您的个人信息。",
      "category": "保存期限",
      "risk_level": "HIGH"
    },
    {
      "id": 18,
      "document_id": 3,
      "section_no": "5",
      "heading": "您的权利",
      "content": "您可以访问、更正或删除您的个人信息。",
      "category": "用户权利",
      "risk_level": "MEDIUM"
    },
    {
      "id": 19,
      "document_id": 3,
      "section_no": "6",
      "heading": "Cookie 使用",
      "content": "我们使用 Cookie 记住您的登录状态和偏好设置。",
      "category": "Cookie",
      "risk_level": "MEDIUM"
    },
    {
      "id": 20,
      "document_id": 3,
      "section_no": "7",
      "heading": "未成年人保护",
      "content": "我们不会故意收集未满十四周岁未成年人的个人信息。",
      "category": "未成年人保护",
      "risk_level": "HIGH"
    },
    {
      "id": 21,
      "document_id": 3,
      "section_no": "8",
      "heading": "联系我们",
      "content": "如有疑问，请通过 privacy@example.com 与我们联系。",
      "category": "联系方式",
      "risk_level": "LOW"
    }
  ],
  "diffResult": [
    {
      "id": 1,
      "old_document_id": 1,
      "new_document_id": 2,
      "section_id": 8,
      "diff_type": "MODIFIED",
      "summary": "「我们收集的信息」新增设备信息与日志信息收集",
      "created_at": "2026-06-16T09:00:00Z"
    },
    {
      "id": 2,
      "old_document_id": 1,
      "new_document_id": 2,
      "section_id": 9,
      "diff_type": "MODIFIED",
      "summary": "「信息共享」新增第三方 SDK 共享条款",
      "created_at": "2026-06-16T09:00:00Z"
    },
    {
      "id": 3,
      "old_document_id": 1,
      "new_document_id": 2,
      "section_id": 12,
      "diff_type": "ADDED",
      "summary": "新增「Cookie 使用」条款",
      "created_at": "2026-06-16T09:00:00Z"
    }
  ],
  "reviewNote": [
    {
      "id": 1,
      "diff_result_id": 1,
      "tag": "数据收集",
      "comment": "需确认设备信息采集是否具备必要性。",
      "reviewer": "王合规",
      "status": "CONFIRMED"
    },
    {
      "id": 2,
      "diff_result_id": 2,
      "tag": "数据共享",
      "comment": "SDK 共享需补充去标识化说明。",
      "reviewer": "李法务",
      "status": "OPEN"
    },
    {
      "id": 3,
      "diff_result_id": 3,
      "tag": "Cookie",
      "comment": "已在产品内增加 Cookie 弹窗。",
      "reviewer": "王合规",
      "status": "RESOLVED"
    }
  ],
  "reviewBatch": [
    {
      "id": 1,
      "name": "2026-06 合规复审批次",
      "old_document_id": 1,
      "new_document_id": 2,
      "old_version_label": "v1.0（2026-03 版）",
      "new_version_label": "v2.0（2026-06 版）",
      "status": "CLOSED",
      "items": [
        {
          "id": 1,
          "section_id": 8,
          "heading": "我们收集的信息",
          "diff_type": "MODIFIED",
          "risk_level": "MEDIUM",
          "summary": "条款「我们收集的信息」内容发生修改",
          "old_content": "我们收集您主动提供的注册信息，包括姓名和联系方式。",
          "new_content": "我们收集您主动提供的注册信息，并自动收集设备信息与日志信息。"
        },
        {
          "id": 2,
          "section_id": 9,
          "heading": "信息共享",
          "diff_type": "MODIFIED",
          "risk_level": "HIGH",
          "summary": "条款「信息共享」内容发生修改",
          "old_content": "我们不会向任何第三方共享您的个人信息。",
          "new_content": "我们可能向提供统计分析服务的第三方 SDK 共享去标识化信息。"
        }
      ],
      "created_at": "2026-06-20T09:00:00Z",
      "closed_at": "2026-06-28T09:00:00Z"
    }
  ],
  "reviewBatchNote": [
    {
      "id": 1,
      "batch_id": 1,
      "item_id": 1,
      "reviewer": "王合规",
      "comment": "设备信息采集已补充必要性说明，确认通过。",
      "status": "RESOLVED",
      "updated_at": "2026-06-25T09:00:00Z"
    },
    {
      "id": 2,
      "batch_id": 1,
      "item_id": 2,
      "reviewer": "李法务",
      "comment": "SDK 共享条款已要求补充去标识化细节。",
      "status": "CONFIRMED",
      "updated_at": "2026-06-26T09:00:00Z"
    }
  ]
} as const;
