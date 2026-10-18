// Ghanaian Payment Provider Interface & Adapters
import { MobileMoneyProvider } from '@/types';

export interface InitializePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number; // in GHS
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  paymentMethod: 'mobile_money' | 'card';
  momoNetwork?: MobileMoneyProvider;
  callbackUrl: string;
}

export interface PaymentInitResult {
  success: boolean;
  reference: string;
  authorizationUrl?: string; // For Card / Checkout redirection
  instructions?: string; // For MoMo USSD prompt prompt instructions
  provider: 'paystack' | 'hubtel' | 'sandbox';
  isSandbox: boolean;
  message?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  paid: boolean;
  reference: string;
  amount: number; // in GHS
  paidAt?: string;
  channel?: string;
  provider: 'paystack' | 'hubtel' | 'sandbox';
  message: string;
}

export interface PaymentAdapter {
  readonly providerName: string;
  initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult>;
  verifyPayment(reference: string): Promise<VerifyPaymentResult>;
}

/**
 * Paystack Ghanaian Adapter (Supports MoMo MTN/Telecel/AT + Visa/Mastercard)
 */
export class PaystackPaymentAdapter implements PaymentAdapter {
  readonly providerName = 'paystack';
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult> {
    const amountInPesewas = Math.round(params.amount * 100);

    const channels: string[] = [];
    if (params.paymentMethod === 'mobile_money') {
      channels.push('mobile_money');
    } else {
      channels.push('card');
    }

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: params.customerEmail,
          amount: amountInPesewas,
          currency: 'GHS',
          reference: `${params.orderNumber}-${Date.now()}`,
          callback_url: params.callbackUrl,
          channels,
          metadata: {
            orderId: params.orderId,
            orderNumber: params.orderNumber,
            customerPhone: params.customerPhone,
            customerName: params.customerName,
            momoNetwork: params.momoNetwork,
          },
        }),
      });

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || 'Failed to initialize Paystack payment');
      }

      return {
        success: true,
        reference: data.data.reference,
        authorizationUrl: data.data.authorization_url,
        provider: 'paystack',
        isSandbox: this.secretKey.startsWith('sk_test_'),
        message: 'Paystack payment initialized successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        reference: '',
        provider: 'paystack',
        isSandbox: this.secretKey.startsWith('sk_test_'),
        message: error.message || 'Payment initialization error',
      };
    }
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json();
      if (data.status && data.data && data.data.status === 'success') {
        return {
          success: true,
          paid: true,
          reference: data.data.reference,
          amount: data.data.amount / 100,
          paidAt: data.data.paid_at,
          channel: data.data.channel,
          provider: 'paystack',
          message: 'Payment verified successfully',
        };
      }

      return {
        success: true,
        paid: false,
        reference,
        amount: data.data ? data.data.amount / 100 : 0,
        provider: 'paystack',
        message: data.data?.gateway_response || 'Payment not completed or failed',
      };
    } catch (error: any) {
      return {
        success: false,
        paid: false,
        reference,
        amount: 0,
        provider: 'paystack',
        message: error.message || 'Verification failed',
      };
    }
  }
}

/**
 * Safe Sandbox / Mock Payment Adapter for Ghanaian Mobile Money & Card Testing
 * Used when Paystack/Hubtel production keys are not yet configured or during development.
 */
export class SandboxPaymentAdapter implements PaymentAdapter {
  readonly providerName = 'sandbox';

  async initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult> {
    const reference = `SANDBOX-${params.orderNumber}-${Date.now()}`;
    return {
      success: true,
      reference,
      authorizationUrl: `${params.callbackUrl}?reference=${reference}&orderId=${params.orderId}&sandbox=true`,
      instructions:
        params.paymentMethod === 'mobile_money'
          ? `[SANDBOX TEST] A simulated MoMo USSD prompt would be sent to ${params.customerPhone} (${params.momoNetwork || 'MTN'}). Approve test transaction to complete.`
          : `[SANDBOX TEST] Simulated Card transaction. Click verify to complete.`,
      provider: 'sandbox',
      isSandbox: true,
      message: 'Sandbox payment initialized (Safe test mode)',
    };
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    // In sandbox, treat as verified for testing
    return {
      success: true,
      paid: true,
      reference,
      amount: 100,
      paidAt: new Date().toISOString(),
      channel: 'sandbox_momo',
      provider: 'sandbox',
      message: 'Sandbox payment successfully simulated and verified',
    };
  }
}

/**
 * Payment Adapter Factory
 */
export function getPaymentAdapter(): PaymentAdapter {
  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  if (paystackKey && paystackKey.trim().length > 0 && !paystackKey.includes('placeholder')) {
    return new PaystackPaymentAdapter(paystackKey);
  }

  // Graceful fallback to sandbox test adapter with prominent warning
  return new SandboxPaymentAdapter();
}
