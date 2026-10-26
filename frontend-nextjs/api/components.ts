import { apiClient } from "./client";
import type { ComponentItem, PaginatedComponentResponse } from "../lib/types";

export const componentsApi = {
  async list(
    search = "",
    tag = "",
    page = 1,
    limit = 20,
    filters: {
      designType?: "Wireframe" | "UI Design" | "Both";
      pricingType?: "Free" | "Pro";
      skip?: number;
    } = {}
  ): Promise<PaginatedComponentResponse> {
    const response = await apiClient.get("/components", {
      params: {
        q: search || undefined,
        tag: tag || undefined,
        page,
        limit,
        skip: filters.skip,
        designType: filters.designType,
        pricingType: filters.pricingType,
      },
    });
    return response.data.data;
  },

  async listMine(search = "", page = 1, limit = 20, skip?: number): Promise<PaginatedComponentResponse> {
    const response = await apiClient.get("/components/my", {
      params: {
        q: search || undefined,
        page,
        limit,
        skip,
      },
    });
    return response.data.data;
  },

  async listFavorites(search = ""): Promise<PaginatedComponentResponse> {
    const response = await apiClient.get("/components/favorites", {
      params: {
        q: search || undefined,
      },
    });
    return response.data.data;
  },

  async listFavoriteIds(): Promise<string[]> {
    const response = await apiClient.get("/components/favorites/ids");
    return response.data.data.ids;
  },

  async toggleFavorite(id: string): Promise<{ componentId: string; isFavorite: boolean }> {
    const response = await apiClient.patch(`/components/${id}/favorite`);
    return response.data.data;
  },

  async getTopCreators(): Promise<{_id: string, name: string, profilePicture?: string, componentCount: number}[]> {
    const response = await apiClient.get("/components/top-creators");
    return response.data.data;
  },

  async getTags(): Promise<string[]> {
    const response = await apiClient.get("/components/tags");
    return response.data.data;
  },

  async getTotalCount(): Promise<number> {
    const response = await apiClient.get("/components/count");
    return response.data.data.count;
  },

  async getById(id: string): Promise<ComponentItem> {
    const response = await apiClient.get(`/components/${id}`);
    return response.data.data;
  },

  async getComponentData(id: string): Promise<{ figmaDataBase64: string; remainingComponents?: number }> {
    const response = await apiClient.get(`/components/${id}/data`);
    return response.data.data;
  },

  async recordDownload(id: string): Promise<{ componentId: string; downloadCount: number }> {
    const response = await apiClient.post(`/components/${id}/download`);
    return response.data.data;
  },

  async create(input: {
    name: string;
    description: string;
    tags: string[];
    previewImageUrl: string;
    lightPreviewImageUrl?: string;
    darkPreviewImageUrl?: string;
    wireframePreviewImageUrl?: string;
    figmaDataBase64: string;
    designType?: "Wireframe" | "UI Design" | "Both";
    pricingType?: "Free" | "Pro";
  }): Promise<ComponentItem> {
    const response = await apiClient.post("/components", input);
    return response.data.data;
  },

  async update(id: string, input: {
    name?: string;
    description?: string;
    tags?: string[];
    previewImageUrl?: string;
    lightPreviewImageUrl?: string;
    darkPreviewImageUrl?: string;
    wireframePreviewImageUrl?: string;
    figmaDataBase64?: string;
    designType?: "Wireframe" | "UI Design" | "Both";
    pricingType?: "Free" | "Pro";
  }): Promise<ComponentItem> {
    const response = await apiClient.patch(`/components/${id}`, input);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/components/${id}`);
  },
};
