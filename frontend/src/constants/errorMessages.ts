export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  BATCH_NOT_FOUND: "审阅批次不存在或已被清理",
  BATCH_CLOSED: "审阅批次已关闭，冻结内容不可再修改",
  BATCH_EMPTY: "当前对比没有可冻结的差异，请先选择有差异的两个版本"
};
