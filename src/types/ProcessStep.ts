export interface StepMaterialRequirement {
    rawMaterialId: number;
    name: string;
    qtyPerUnitOutput: number;
    unitId: number;
    unitName: string;
}

export interface ProcessStep {
    id: number;
    title: string;
    estimatedTime: number;
    hasInput: boolean;
    inputType?: "number" | "text";
    unit?: string;
    description?: string;
    materials?: StepMaterialRequirement[];
}
