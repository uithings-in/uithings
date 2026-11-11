import { apiClient } from "./client";

export interface ContactReply {
  _id?: string;
  author: "user" | "admin";
  body: string;
  readByUser?: boolean;
  readByAdmin?: boolean;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  company?: string;
  country: string;
  subject?: string;
  message: string;
  status: "submitted" | "emailed" | "failed" | "replied";
  replies?: ContactReply[];
  mailError?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactInput {
  name: string;
  email: string;
  company?: string;
  country: string;
  subject?: string;
  message: string;
}

export const contactApi = {
  async create(input: ContactInput): Promise<{
    id: string;
    subject?: string;
    status: ContactMessage["status"];
    createdAt: string;
  }> {
    const response = await apiClient.post("/contacts", input);
    return response.data.data;
  },

  async listMine(): Promise<ContactMessage[]> {
    const response = await apiClient.get("/contacts/mine");
    return response.data.data.items;
  },

  async reply(
    id: string,
    body: string,
  ): Promise<{
    id: string;
    status: ContactMessage["status"];
    replies: ContactReply[];
    updatedAt?: string;
  }> {
    const response = await apiClient.post(`/contacts/${id}/replies`, { body });
    return response.data.data;
  },

  async markRead(
    id: string,
  ): Promise<{ id: string; replies: ContactReply[] }> {
    const response = await apiClient.patch(`/contacts/${id}/read`);
    return response.data.data;
  },
};
