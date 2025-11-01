import { supabase } from '@/integrations/supabase/client';
import { subscriptionService, SUBSCRIPTION_TIERS, type SubscriptionTier } from './subscriptionService';

// Apple Pay interfaces
interface ApplePaySession {
  begin(): void;
  abort(): void;
  completePayment(result: ApplePayPaymentAuthorizationResult): void;
  completeMerchantValidation(merchantSession: Record<string, unknown>): void;
  canMakePayments(): boolean;
  canMakePaymentsWithActiveCard(merchantIdentifier: string): Promise<boolean>;
  onvalidatemerchant?: (event: ApplePayValidateEvent) => void;
  onpaymentauthorized?: (event: ApplePayPaymentEvent) => void;
  oncancel?: () => void;
}

interface ApplePayValidateEvent {
  validationURL: string;
}

interface ApplePayPaymentEvent {
  payment: {
    token: Record<string, unknown>;
  };
}

interface ApplePayPaymentRequest {
  countryCode: string;
  currencyCode: string;
  supportedNetworks: string[];
  merchantCapabilities: string[];
  total: {
    label: string;
    amount: string;
  };
  lineItems?: Array<{
    label: string;
    amount: string;
  }>;
}

interface ApplePayPaymentAuthorizationResult {
  status: number;
}

// Google Pay interfaces
interface GooglePayPaymentMethod {
  type: string;
  parameters: {
    allowedAuthMethods: string[];
    allowedCardNetworks: string[];
  };
  tokenizationSpecification: {
    type: string;
    parameters: Record<string, string>;
  };
}

interface GooglePayPaymentDataRequest {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: GooglePayPaymentMethod[];
  transactionInfo: {
    totalPriceStatus: string;
    totalPrice: string;
    currencyCode: string;
    countryCode: string;
  };
  merchantInfo: {
    merchantName: string;
    merchantId: string;
  };
}

interface GooglePayClient {
  isReadyToPay(request: Record<string, unknown>): Promise<{ result: boolean }>;
  loadPaymentData(request: GooglePayPaymentDataRequest): Promise<{
    paymentMethodData: {
      tokenizationData: {
        token: string;
      };
    };
  }>;
}

// Payment method types
export type PaymentMethod = 'stripe' | 'apple_pay' | 'google_pay';

// Payment result interface
export interface PaymentResult {
  success: boolean;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  error?: string;
  subscriptionData?: {
    tier: string;
    status: 'active' | 'pending';
    expiresAt?: string;
  };
}

// Payment options interface
export interface PaymentOptions {
  tier: typeof SUBSCRIPTION_TIERS[0];
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string | number>;
}

class PaymentService {
  private googlePayClient: GooglePayClient | null = null;
  private applePaySession: ApplePaySession | null = null;

  // Environment configuration
  private config = {
    // Apple Pay configuration
    applePay: {
      merchantIdentifier: import.meta.env.VITE_APPLE_PAY_MERCHANT_ID || 'merchant.com.2sweety.app',
      displayName: '2Sweety',
      domainName: import.meta.env.VITE_APPLE_PAY_DOMAIN || '2sweety.app',
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
      merchantCapabilities: ['supports3DS'],
      countryCode: 'US',
      currencyCode: 'USD'
    },

    // Google Pay configuration
    googlePay: {
      merchantId: import.meta.env.VITE_GOOGLE_PAY_MERCHANT_ID || '1234567890',
      merchantName: '2Sweety',
      environment: import.meta.env.MODE === 'production' ? 'PRODUCTION' : 'TEST',
      apiVersion: 2,
      apiVersionMinor: 0
    }
  };

  constructor() {
    this.initializePaymentMethods();
  }

  // Initialize payment methods on startup
  private async initializePaymentMethods(): Promise<void> {
    try {
      // Check if running in browser
      if (typeof window === 'undefined') return;

      // Initialize Google Pay
      await this.initializeGooglePay();

      // Apple Pay is initialized on demand
      console.log('✅ Payment methods initialized');
    } catch (error) {
      console.error('Payment initialization error:', error);
    }
  }

  // Check which payment methods are available
  async getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
    const methods: PaymentMethod[] = ['stripe']; // Stripe is always available

    // Check Apple Pay availability
    if (await this.isApplePayAvailable()) {
      methods.push('apple_pay');
    }

    // Check Google Pay availability
    if (await this.isGooglePayAvailable()) {
      methods.push('google_pay');
    }

    return methods;
  }

  // Process payment with selected method
  async processPayment(method: PaymentMethod, options: PaymentOptions): Promise<PaymentResult> {
    try {
      console.log(`💳 Processing ${method} payment for ${options.tier.displayName}`);

      switch (method) {
        case 'stripe':
          return await this.processStripePayment(options);
        case 'apple_pay':
          return await this.processApplePayPayment(options);
        case 'google_pay':
          return await this.processGooglePayPayment(options);
        default:
          throw new Error(`Unsupported payment method: ${method}`);
      }
    } catch (error) {
      console.error(`Payment processing error (${method}):`, error);
      return {
        success: false,
        paymentMethod: method,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Stripe payment processing (existing method)
  private async processStripePayment(options: PaymentOptions): Promise<PaymentResult> {
    try {
      const successUrl = options.returnUrl || `${window.location.origin}/subscription/success?tier=${options.tier.name}`;
      const cancelUrl = options.cancelUrl || `${window.location.origin}/subscription/cancel`;

      const checkoutResult = await subscriptionService.createStripeCheckout(
        options.tier.stripePriceId,
        successUrl,
        cancelUrl
      );

      if (checkoutResult?.url) {
        // Redirect to Stripe checkout
        window.location.href = checkoutResult.url;
        
        return {
          success: true,
          paymentMethod: 'stripe',
          subscriptionData: {
            tier: options.tier.name,
            status: 'pending'
          }
        };
      } else {
        throw new Error('Failed to create Stripe checkout session');
      }
    } catch (error) {
      return {
        success: false,
        paymentMethod: 'stripe',
        error: error instanceof Error ? error.message : 'Stripe payment failed'
      };
    }
  }

  // Apple Pay payment processing
  private async processApplePayPayment(options: PaymentOptions): Promise<PaymentResult> {
    return new Promise((resolve) => {
      try {
        if (!this.isApplePaySupported()) {
          resolve({
            success: false,
            paymentMethod: 'apple_pay',
            error: 'Apple Pay not supported on this device'
          });
          return;
        }

        const paymentRequest: ApplePayPaymentRequest = {
          countryCode: this.config.applePay.countryCode,
          currencyCode: this.config.applePay.currencyCode,
          supportedNetworks: this.config.applePay.supportedNetworks,
          merchantCapabilities: this.config.applePay.merchantCapabilities,
          total: {
            label: options.tier.displayName,
            amount: options.tier.price.toFixed(2)
          },
          lineItems: [
            {
              label: `${options.tier.displayName} Subscription`,
              amount: options.tier.price.toFixed(2)
            }
          ]
        };

        // Create Apple Pay session
        const ApplePaySession = window.ApplePaySession;
        if (!ApplePaySession) throw new Error('Apple Pay not available');

        const session = new ApplePaySession(3, paymentRequest);

        // Handle merchant validation
        session.onvalidatemerchant = async (event: ApplePayValidateEvent) => {
          try {
            // Call your backend to validate merchant
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase.functions.invoke('apple-pay-validate', {
              body: {
                validationURL: event.validationURL,
                displayName: this.config.applePay.displayName,
                domainName: this.config.applePay.domainName
              }
            });

            if (error) throw error;
            session.completeMerchantValidation(data.merchantSession);
          } catch (error) {
            console.error('Apple Pay merchant validation failed:', error);
            session.abort();
            resolve({
              success: false,
              paymentMethod: 'apple_pay',
              error: 'Merchant validation failed'
            });
          }
        };

        // Handle payment authorization
        session.onpaymentauthorized = async (event: ApplePayPaymentEvent) => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Process the payment token with your backend
            const { data, error } = await supabase.functions.invoke('apple-pay-process', {
              body: {
                paymentToken: event.payment.token,
                amount: options.tier.price,
                currency: this.config.applePay.currencyCode,
                tier: options.tier.name,
                userId: user.id
              }
            });

            if (error) throw error;

            // Complete the payment
            session.completePayment({ status: ApplePaySession.STATUS_SUCCESS });

            // Update subscription
            await subscriptionService.syncSubscriptionWithRole(user.id, {
              status: 'active',
              tier: options.tier.name,
              role: this.mapTierToRole(options.tier.name),
              endDate: this.calculateEndDate(options.tier.interval)
            });

            resolve({
              success: true,
              paymentMethod: 'apple_pay',
              transactionId: data.transactionId,
              subscriptionData: {
                tier: options.tier.name,
                status: 'active',
                expiresAt: this.calculateEndDate(options.tier.interval)
              }
            });

          } catch (error) {
            console.error('Apple Pay processing failed:', error);
            session.completePayment({ status: ApplePaySession.STATUS_FAILURE });
            resolve({
              success: false,
              paymentMethod: 'apple_pay',
              error: 'Payment processing failed'
            });
          }
        };

        // Handle cancellation
        session.oncancel = () => {
          resolve({
            success: false,
            paymentMethod: 'apple_pay',
            error: 'Payment cancelled by user'
          });
        };

        // Start the session
        session.begin();
        this.applePaySession = session;

      } catch (error) {
        resolve({
          success: false,
          paymentMethod: 'apple_pay',
          error: error instanceof Error ? error.message : 'Apple Pay initialization failed'
        });
      }
    });
  }

  // Google Pay payment processing
  private async processGooglePayPayment(options: PaymentOptions): Promise<PaymentResult> {
    try {
      if (!this.googlePayClient) {
        throw new Error('Google Pay not initialized');
      }

      const paymentDataRequest: GooglePayPaymentDataRequest = {
        apiVersion: this.config.googlePay.apiVersion,
        apiVersionMinor: this.config.googlePay.apiVersionMinor,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'stripe',
                'stripe:version': '2023-10-16',
                'stripe:publishableKey': import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
              }
            }
          }
        ],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: options.tier.price.toFixed(2),
          currencyCode: 'USD',
          countryCode: 'US'
        },
        merchantInfo: {
          merchantName: this.config.googlePay.merchantName,
          merchantId: this.config.googlePay.merchantId
        }
      };

      // Request payment data
      const paymentData = await this.googlePayClient.loadPaymentData(paymentDataRequest);

      // Process the payment token
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('google-pay-process', {
        body: {
          paymentToken: paymentData.paymentMethodData.tokenizationData.token,
          amount: options.tier.price,
          currency: 'USD',
          tier: options.tier.name,
          userId: user.id
        }
      });

      if (error) throw error;

      // Update subscription
      await subscriptionService.syncSubscriptionWithRole(user.id, {
        status: 'active',
        tier: options.tier.name,
        role: this.mapTierToRole(options.tier.name),
        endDate: this.calculateEndDate(options.tier.interval)
      });

      return {
        success: true,
        paymentMethod: 'google_pay',
        transactionId: data.transactionId,
        subscriptionData: {
          tier: options.tier.name,
          status: 'active',
          expiresAt: this.calculateEndDate(options.tier.interval)
        }
      };

    } catch (error) {
      console.error('Google Pay processing failed:', error);
      return {
        success: false,
        paymentMethod: 'google_pay',
        error: error instanceof Error ? error.message : 'Google Pay payment failed'
      };
    }
  }

  // Apple Pay availability check
  private async isApplePayAvailable(): Promise<boolean> {
    try {
      if (!this.isApplePaySupported()) return false;

      const ApplePaySession = window.ApplePaySession;
      if (!ApplePaySession || !ApplePaySession.canMakePayments()) return false;

      // Check if active card is available
      return await ApplePaySession.canMakePaymentsWithActiveCard(this.config.applePay.merchantIdentifier);
    } catch (error) {
      console.error('Apple Pay availability check failed:', error);
      return false;
    }
  }

  // Google Pay availability check
  private async isGooglePayAvailable(): Promise<boolean> {
    try {
      if (!this.googlePayClient) return false;

      const isReadyToPay = await this.googlePayClient.isReadyToPay({
        apiVersion: this.config.googlePay.apiVersion,
        apiVersionMinor: this.config.googlePay.apiVersionMinor,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
            }
          }
        ]
      });

      return isReadyToPay.result;
    } catch (error) {
      console.error('Google Pay availability check failed:', error);
      return false;
    }
  }

  // Apple Pay support check
  private isApplePaySupported(): boolean {
    return typeof window !== 'undefined' &&
           'ApplePaySession' in window &&
           window.ApplePaySession?.supportsVersion(3) === true;
  }

  // Initialize Google Pay
  private async initializeGooglePay(): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.google?.payments?.api) {
        console.log('Google Pay API not available');
        return;
      }

      this.googlePayClient = new window.google.payments.api.PaymentsClient({
        environment: this.config.googlePay.environment,
        merchantInfo: {
          merchantName: this.config.googlePay.merchantName,
          merchantId: this.config.googlePay.merchantId
        }
      });

      console.log('✅ Google Pay initialized');
    } catch (error) {
      console.error('Google Pay initialization failed:', error);
    }
  }

  // Helper: Map tier to role
  private mapTierToRole(tier: string): string {
    const tierToRole: Record<string, string> = {
      'gold': 'silver',
      'premium': 'gold',
      'vip': 'platinum'
    };
    return tierToRole[tier] || 'registered';
  }

  // Helper: Calculate subscription end date
  private calculateEndDate(interval: 'month' | 'year'): string {
    const endDate = new Date();
    if (interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    return endDate.toISOString();
  }

  // Load Google Pay API script
  static loadGooglePayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }

      if (window.google?.payments?.api) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  // Cancel ongoing payment
  cancelPayment(method: PaymentMethod): void {
    switch (method) {
      case 'apple_pay':
        if (this.applePaySession) {
          this.applePaySession.abort?.();
          this.applePaySession = null;
        }
        break;
      case 'google_pay':
        // Google Pay handles cancellation internally
        break;
      case 'stripe':
        // Stripe cancellation is handled by redirecting back
        break;
    }
  }

  // Get payment method display info
  getPaymentMethodInfo(method: PaymentMethod): {
    name: string;
    icon: string;
    description: string;
  } {
    const methodInfo = {
      stripe: {
        name: 'Credit Card',
        icon: '💳',
        description: 'Pay securely with Stripe'
      },
      apple_pay: {
        name: 'Apple Pay',
        icon: '🍎',
        description: 'Pay with Touch ID or Face ID'
      },
      google_pay: {
        name: 'Google Pay',
        icon: '🎯',
        description: 'Pay with Google'
      }
    };

    return methodInfo[method];
  }
}

// Global payment service instance
export const paymentService = new PaymentService();
export default paymentService;

// Apple Pay global declarations
interface ApplePaySessionConstructor {
  new (version: number, paymentRequest: ApplePayPaymentRequest): ApplePaySession;
  canMakePayments(): boolean;
  canMakePaymentsWithActiveCard(merchantIdentifier: string): Promise<boolean>;
  supportsVersion(version: number): boolean;
  STATUS_SUCCESS: number;
  STATUS_FAILURE: number;
}

// Google Pay global declarations
interface GooglePaymentsApi {
  PaymentsClient: new (config: {
    environment: string;
    merchantInfo: {
      merchantName: string;
      merchantId: string;
    };
  }) => GooglePayClient;
}

// Type declarations for global objects
declare global {
  interface Window {
    google?: {
      payments?: {
        api?: GooglePaymentsApi;
      };
    };
    ApplePaySession?: ApplePaySessionConstructor;
  }
}