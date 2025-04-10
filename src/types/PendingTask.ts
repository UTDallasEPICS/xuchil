export interface PendingTask {
    id: number;
    productId: string;
    productName: string;
    variantId: string;
    startDate: string;
    startedBy: string;
    currentStep: string;
    currentStepNumber: number;
    totalSteps: number;
}
  