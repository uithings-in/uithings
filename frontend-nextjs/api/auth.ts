import { apiClient } from "./client";
import type { AuthPayload, User } from "../lib/types";

export const authApi = {
  async register(input: { name: string; email: string; password: string }): Promise<AuthPayload> {
    const response = await apiClient.post("/auth/register", input);
    return response.data.data;
  },

  async login(input: { email: string; password: string }): Promise<AuthPayload> {
    const response = await apiClient.post("/auth/login", input);
    return response.data.data;
  },

  async googleLogin(idToken: string): Promise<AuthPayload> {
    const response = await apiClient.post("/auth/google", { idToken });
    return response.data.data;
  },


  async me(): Promise<User> {
    const response = await apiClient.get("/auth/me");
    const user = response.data.data;
    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role,
      isProUser: user.isProUser,
      canUploadPro: user.canUploadPro,
      subscription: user.subscription,
    };
  },
};
