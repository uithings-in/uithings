import { apiClient } from "./client";

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  planId: string;
  planName: string;
  keyId?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    isQueued?: boolean;
    subscription?: PurchasedSubscriptionRecord;
    transaction?: SubscriptionTransaction;
  };
}

export interface SubscriptionData {
  status: string;
  endDate: string;
  maxComponents: number;
  componentCountUsed: number;
  remainingComponents: number;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  displayName: string;
  price: number;
  durationDays: number;
  componentLimit: number;
}

export interface CurrentSubscriptionData extends SubscriptionData {
  plan?: SubscriptionPlan;
  startDate?: string;
}

export interface SubscriptionTransaction {
  _id: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string | null;
  createdAt?: string;
}

export interface PurchasedSubscriptionRecord extends SubscriptionData {
  _id: string;
  planId?: SubscriptionPlan;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
  transactions?: SubscriptionTransaction[];
}

export interface CheckAccessResponse {
  hasAccess: boolean;
  isProUser: boolean;
  subscription: SubscriptionData | null;
}

export const paymentsApi = {
  async createOrder(planId: string): Promise<CreateOrderResponse> {
    const response = await apiClient.post("/payments/create-order", { planId });
    return response.data.data;
  },

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    planId: string
  ): Promise<PaymentVerificationResponse> {
    const response = await apiClient.post("/payments/verify", {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      planId,
    });
    return response.data;
  },

  async checkAccess(): Promise<CheckAccessResponse> {
    const response = await apiClient.get("/payments/check-access");
    return response.data.data;
  },

  async getCurrentSubscription(): Promise<CurrentSubscriptionData | null> {
    const response = await apiClient.get("/subscriptions/current");
    return response.data.data;
  },

  async getSubscriptionHistory(): Promise<PurchasedSubscriptionRecord[]> {
    const response = await apiClient.get("/subscriptions/history");
    return response.data.data;
  },

  async cancelSubscription(): Promise<void> {
    await apiClient.post("/subscriptions/cancel");
  },

  async activateSubscription(subscriptionId: string): Promise<void> {
    await apiClient.post(`/subscriptions/activate/${subscriptionId}`);
  },
};
