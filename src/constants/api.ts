export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
  },

  users: {
    me: "/api/users/me",
    list: "/api/users",
    detail: (userId: string | number) => `/api/users/${userId}`,
  },

  inventory: {
    summary: "/api/inventory/summary",
    itemDetail: (itemId: string | number) => `/api/inventory/items/${itemId}`,
    lotMovements: (lotId: string | number) =>
      `/api/inventory/lots/${lotId}/movements`,
    adjustments: "/api/inventory/adjustments",
  },

  rawMaterials: {
    create: "/api/raw-materials",
  },

  productVariants: {
    create: "/api/product-variants",
  },

  orders: {
    list: "/api/orders",
    create: "/api/orders",
    detail: (orderId: string | number) => `/api/orders/${orderId}`,
    update: (orderId: string | number) => `/api/orders/${orderId}`,
    updateStatus: (orderId: string | number) =>
      `/api/orders/${orderId}/status`,
    delete: (orderId: string | number) => `/api/orders/${orderId}`,
  },

  processTemplates: {
    list: "/api/process-templates",
    create: "/api/process-templates",
    detail: (templateId: string | number) =>
      `/api/process-templates/${templateId}`,
    update: (templateId: string | number) =>
      `/api/process-templates/${templateId}`,
    addStep: (templateId: string | number) =>
      `/api/templates/${templateId}/steps`,
    updateStep: (stepId: string | number) =>
      `/api/template-steps/${stepId}`,
    deleteStep: (stepId: string | number) =>
      `/api/template-steps/${stepId}`,
  },

  processRuns: {
    pending: "/api/process-runs/pending",
    create: "/api/process-runs",
    detail: (runId: string | number) => `/api/process-runs/${runId}`,
    finish: (runId: string | number) => `/api/process-runs/${runId}/finish`,
  },

  stepExecutions: {
    action: (
      stepExecutionId: string | number,
      action: "start" | "pause" | "resume" | "finish"
    ) => `/api/step-executions/${stepExecutionId}/${action}`,
  },

  logbook: {
    myTasks: "/api/logbook/my-tasks",
    taskDetail: (stepExecutionId: string | number) =>
      `/api/logbook/tasks/${stepExecutionId}`,
    processRuns: "/api/logbook/process-runs",
    processRunDetail: (processRunId: string | number) =>
      `/api/logbook/process-runs/${processRunId}`,
  },
};

export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}
