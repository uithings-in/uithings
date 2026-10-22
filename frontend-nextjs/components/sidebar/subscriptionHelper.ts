import type {
  CurrentSubscriptionData,
  SubscriptionData,
} from "../../api/payments";

export type SubscriptionSummary = CurrentSubscriptionData | SubscriptionData;

export type SubscriptionCardState =
  | "healthy"
  | "warning"
  | "urgent"
  | "expired"
  | "none";

export interface DerivedSubscriptionInfo {
  state: SubscriptionCardState;
  planName: string;
  priceFormatted: string;
  daysLeft: number;
  durationDays: number;
  percentRemaining: number;
  formattedEndDate: string | null;
  downloadsUsed: number;
  maxComponents: number;
  isUnlimited: boolean;
  statusLabel: string;
  headline: string;
  subline: string;
  buttonLabel: string;
}

export function formatPlanPrice(price?: number, durationDays?: number): string {
  if (price === undefined || price === null || !durationDays) {
    return "Active plan";
  }
  const num =
    price % 100 === 0 ? (price / 100).toFixed(0) : (price / 100).toFixed(2);
  return `₹${num} · ${durationDays} days`;
}

export function getDaysBetween(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
    return 0;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function getDaysLeft(endDate?: string, now = Date.now()): number {
  if (!endDate) return 0;
  const end = new Date(endDate).getTime();
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

export function formatDateLocale(
  dateString?: string,
  locale = "en-GB",
): string | null {
  if (!dateString) return null;
  const dateObj = new Date(dateString);
  if (Number.isNaN(dateObj.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(dateObj);
  } catch {
    return null;
  }
}

export function deriveSubscriptionInfo(
  subscription: SubscriptionSummary | null | undefined,
  options?: {
    now?: number;
    locale?: string;
  },
): DerivedSubscriptionInfo {
  const now = options?.now ?? Date.now();
  const locale = options?.locale ?? "en-GB";

  if (!subscription) {
    return {
      state: "none",
      planName: "Pro Member",
      priceFormatted: "Free tier",
      daysLeft: 0,
      durationDays: 0,
      percentRemaining: 0,
      formattedEndDate: null,
      downloadsUsed: 0,
      maxComponents: 0,
      isUnlimited: false,
      statusLabel: "Inactive",
      headline: "Unlock Pro components",
      subline: "Unlimited Figma downloads",
      buttonLabel: "View plans",
    };
  }

  const plan = "plan" in subscription ? subscription.plan : undefined;
  const planName = plan?.displayName ? `${plan.displayName} Plan` : "Pro Plan";

  const maxComponents = subscription.maxComponents ?? plan?.componentLimit ?? 0;
  const isUnlimited = maxComponents >= 999999;
  const downloadsUsed = Math.max(0, subscription.componentCountUsed ?? 0);

  const durationDays =
    plan?.durationDays ||
    getDaysBetween(
      "startDate" in subscription ? subscription.startDate : undefined,
      subscription.endDate,
    ) ||
    180;

  const daysLeft = getDaysLeft(subscription.endDate, now);
  const percentRemaining =
    durationDays > 0
      ? Math.min(100, Math.max(0, (daysLeft / durationDays) * 100))
      : 0;

  const formattedEndDate = formatDateLocale(subscription.endDate, locale);

  const rawStatus = (subscription.status || "").toLowerCase();
  let state: SubscriptionCardState;

  if (daysLeft <= 0 || rawStatus === "expired") {
    state = "expired";
  } else if (daysLeft <= 7) {
    state = "urgent";
  } else if (daysLeft <= 30) {
    state = "warning";
  } else {
    state = "healthy";
  }

  let statusLabel = "Active";
  let headline = `${daysLeft} days left`;
  let subline = formattedEndDate ? `Ends ${formattedEndDate}` : "";
  let buttonLabel = "Manage subscription";

  switch (state) {
    case "expired":
      statusLabel = "Expired";
      headline = "Plan expired";
      subline = formattedEndDate
        ? `Ended ${formattedEndDate}`
        : "Your plan has ended";
      buttonLabel = "Renew plan";
      break;

    case "urgent":
      statusLabel = "Expiring";
      headline =
        daysLeft === 1 ? "Only 1 day left" : `Only ${daysLeft} days left`;
      subline = formattedEndDate ? `Ends ${formattedEndDate}` : "";
      buttonLabel = "Renew plan";
      break;

    case "warning":
      statusLabel = "Active";
      headline = `${daysLeft} days left`;
      subline = formattedEndDate
        ? `Ends ${formattedEndDate} · Renew anytime`
        : "Renew anytime";
      buttonLabel = "Manage subscription";
      break;

    case "healthy":
      statusLabel = "Active";
      headline = `${daysLeft} days left`;
      subline = formattedEndDate ? `Ends ${formattedEndDate}` : "";
      buttonLabel = "Manage subscription";
      break;
  }

  const priceFormatted = formatPlanPrice(plan?.price, durationDays);

  return {
    state,
    planName,
    priceFormatted,
    daysLeft,
    durationDays,
    percentRemaining,
    formattedEndDate,
    downloadsUsed,
    maxComponents,
    isUnlimited,
    statusLabel,
    headline,
    subline,
    buttonLabel,
  };
}
