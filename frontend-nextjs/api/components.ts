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

  // Owner/admin scoped fetch of the original payload. Unlike getComponentData
  // this never consumes a subscription credit, so opening the editor never
  // spends a download and never makes the stored payload look missing.
  async getComponentFigma(id: string): Promise<{ figmaDataBase64: string }> {
    const response = await apiClient.get(`/components/${id}/figma`);
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

/**
 * Loads a component for editing together with its original Figma payload.
 *
 * GET /components/:id omits the payload for Pro components, so the editor has to
 * ask for it explicitly. The owner-scoped endpoint is used (instead of the
 * download endpoint) because it neither consumes a subscription credit nor
 * requires an active Pro subscription — without it the editor renders an empty
 * payload box and any edit would overwrite the stored payload with whatever the
 * user re-pasted.
 *
 * `figmaPayloadUnavailable` marks the case where the stored payload could not
 * be retrieved. Callers must then treat the payload as unknown (and leave it
 * untouched) rather than as "the user cleared it".
 */
export interface ComponentForEdit extends ComponentItem {
  figmaPayloadUnavailable?: boolean;
}

export async function fetchComponentForEdit(id: string): Promise<ComponentForEdit> {
  const component = (await componentsApi.getById(id)) as ComponentForEdit;

  if (!component.figmaDataBase64) {
    try {
      const { figmaDataBase64 } = await componentsApi.getComponentFigma(id);
      component.figmaDataBase64 = figmaDataBase64 || "";
    } catch {
      // The payload could not be retrieved. It is unknown rather than empty, so
      // flag it — the stored payload is left untouched.
      component.figmaDataBase64 = "";
      component.figmaPayloadUnavailable = true;
    }
  }

  return component;
}
