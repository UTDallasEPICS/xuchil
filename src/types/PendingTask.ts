export interface PendingTask {
    id: number;
    productId: string;
    productName: string;
    startDate: string;
    currentStep: string;
    currentStepNumber: number;
    totalSteps: number;
    openRoute: string;
}
  