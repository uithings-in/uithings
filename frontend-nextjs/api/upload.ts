import { apiClient } from "./client";

interface SignatureResponse {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  public_id: string;
  signature: string;
}

export const uploadApi = {
  async getSignedParams(): Promise<SignatureResponse> {
    const response = await apiClient.get("/upload/signature");
    return response.data.data;
  },

  async uploadImage(file: File): Promise<string> {
    const MAX_SIZE_BYTES = 100 * 1024;
    const isAvifExt = file.name.toLowerCase().endsWith(".avif");
    const isAvifType = file.type === "image/avif";
    const hasIncompatibleType = Boolean(file.type && file.type !== "image/avif");
    const isAvif = (isAvifType || isAvifExt) && !hasIncompatibleType;

    if (!isAvif) {
      throw new Error("Only AVIF images are allowed.");
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error("Image size must not exceed 100KB.");
    }

    const params = await this.getSignedParams();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", params.apiKey);
    formData.append("timestamp", String(params.timestamp));
    formData.append("signature", params.signature);
    formData.append("folder", params.folder);
    formData.append("public_id", params.public_id);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error("Cloudinary upload failed.");
    }

    const data = await uploadResponse.json();
    return data.secure_url;
  },
};
