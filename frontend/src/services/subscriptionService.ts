import api from './api';
import { SubscriptionEndpoints, PaymentEndpoints, SUBSCRIPTION_URL, PAYMENT_URL } from '../constants/apiUrls';
import type { PremiumStatus } from '../types';

function mapStatus(data: any): PremiumStatus {
  return {
    premium: !!data?.premium,
    status: data?.status ?? 'INACTIVE',
    expiresAt: data?.expiresAt ?? null,
  };
}

// GET /subscriptions/me - check current premium status independent of the
// payment flow (e.g. on app launch, to decide whether to show the badge or
// unlock the premium section of Player Details).
export async function getMyPremiumStatus(signal?: AbortSignal): Promise<PremiumStatus> {
  const { data } = await api.get<any>(SubscriptionEndpoints.ME, { baseURL: SUBSCRIPTION_URL, signal });
  return mapStatus(data);
}

export interface InitializePaymentResult {
  authorizationUrl: string;
  reference: string;
  amountPesewas: number;
}

// POST /payments/initialize - starts a Paystack transaction. Returns the
// hosted checkout URL to open in a WebView; the app never sees card details.
export async function initializePremiumPayment(): Promise<InitializePaymentResult> {
  const { data } = await api.post<any>(PaymentEndpoints.INITIALIZE, {}, { baseURL: PAYMENT_URL });
  return {
    authorizationUrl: data.authorizationUrl,
    reference: data.reference,
    amountPesewas: data.amountPesewas,
  };
}

// POST /payments/verify/{reference} - server-to-server confirmation the
// payment succeeded, called right after the checkout WebView's redirect
// fires. Returns the resulting premium status so the caller can update the
// UI immediately without a second round-trip.
export async function verifyPremiumPayment(reference: string): Promise<PremiumStatus> {
  const { data } = await api.post<any>(`${PaymentEndpoints.VERIFY}/${reference}`, {}, { baseURL: PAYMENT_URL });
  return mapStatus(data);
}
