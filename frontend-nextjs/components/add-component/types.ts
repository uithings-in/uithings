export type DesignType = "UI Design" | "Wireframe" | "Both" | "";
export type PricingType = "Free" | "Pro";
export type PlatformTag = "web" | "app";

export interface ComponentFormValues {
  name: string;
  description: string;
  tags: string[];
  figmaDataBase64: string;
  previewFile: File | null;
  previewUrl: string;
  lightPreviewFile: File | null;
  lightPreviewUrl: string;
  darkPreviewFile: File | null;
  darkPreviewUrl: string;
  wireframePreviewFile: File | null;
  wireframePreviewUrl: string;
  designType: DesignType;
  pricingType: PricingType;
  platformTag: PlatformTag;
}

export interface ValidationErrors {
  name?: string;
  figmaPayload?: string;
  previewFile?: string;
  lightPreviewFile?: string;
  darkPreviewFile?: string;
  wireframePreviewFile?: string;
  designType?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}
