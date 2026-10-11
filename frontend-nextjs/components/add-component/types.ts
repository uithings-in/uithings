export type DesignType = "UI Design" | "Wireframe";
export type PricingType = "Free" | "Pro";
export type PlatformTag = "web" | "app";

export interface ComponentFormValues {
  name: string;
  description: string;
  tags: string[];
  figmaDataBase64: string;
  previewFile: File | null;
  previewUrl: string;
  darkPreviewFile: File | null;
  darkPreviewUrl: string;
  lightPreviewFile: File | null;
  lightPreviewUrl: string;
  designType: DesignType;
  pricingType: PricingType;
  platformTag: PlatformTag;
}

export interface ValidationErrors {
  name?: string;
  figmaPayload?: string;
  previewFile?: string;
  darkPreviewFile?: string;
  lightPreviewFile?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}
