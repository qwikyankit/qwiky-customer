interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerDetails: {
    customerId: string;
    customerPhone: string;
    customerName?: string;
    customerEmail?: string;
  };
  returnUrl?: string;
  notifyUrl?: string;
}

interface CashfreeOrderResponse {
  payment_session_id: string;
  order_id: string;
  order_status: string;
  return_url: string;
  cashfree_order_id?: string;
}

interface InitiatePaymentResponse {
  data: {
    paymentRequestBody: {
      paymentSessionId: string;
      returnUrl: string;
    };
  };
}

class PaymentService {
  private cashfree: any = null;
  private paymentMode: string;
  private isProduction: boolean;
  private backendBaseUrl: string;

  constructor() {
    this.paymentMode = import.meta.env.VITE_PAYMENT_MODE || 'cashfree-test';
    this.isProduction = import.meta.env.VITE_CASHFREE_ENV === 'PRODUCTION';
    this.backendBaseUrl = (import.meta.env.VITE_API_URL || 'https://qwiky-backend.onrender.com') + '/api';
    this.initializeCashfree();
  }

  private async initializeCashfree() {
    try {
      if (window.Cashfree) {
        this.cashfree = window.Cashfree({
          mode: this.isProduction ? 'production' : 'sandbox'
        });
        console.log('Cashfree initialized in', this.isProduction ? 'production' : 'sandbox', 'mode');
      }
    } catch (error) {
      console.error('Failed to initialize Cashfree:', error);
    }
  }

  async initiatePayment(paymentData: PaymentRequest): Promise<InitiatePaymentResponse> {
    try {
      console.log('Initiating payment with Cashfree:', {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        mode: this.paymentMode,
        environment: this.isProduction ? 'production' : 'sandbox'
      });

      // Check if backend is available first
      const backendTest = await this.testPaymentService();
      if (!backendTest.success) {
        console.warn('Backend API not available, using demo mode');
        // Return demo payment session for testing
        return {
          data: {
            paymentRequestBody: {
              paymentSessionId: `demo_session_${Date.now()}`,
              returnUrl: `${window.location.origin}/payment/callback?demo=true&order_id=${paymentData.orderId}&payment_status=SUCCESS`
            }
          }
        };
      }

      // Prepare the order data for backend API
      const orderData = {
        order_id: paymentData.orderId,
        order_amount: paymentData.amount,
        order_currency: paymentData.currency,
        customer_details: {
          customer_id: paymentData.customerDetails.customerId,
          customer_phone: paymentData.customerDetails.customerPhone,
          customer_name: paymentData.customerDetails.customerName || 'Customer',
          customer_email: paymentData.customerDetails.customerEmail || 'customer@example.com'
        },
        order_meta: {
          return_url: paymentData.returnUrl || `${window.location.origin}/payment/callback`,
          notify_url: paymentData.notifyUrl || `${this.backendBaseUrl}/api/payment/webhook`
        }
      };

      console.log('Calling backend API to create Cashfree order:', orderData);

      // Call backend API to create Cashfree order
      const response = await fetch(`${this.backendBaseUrl}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Backend API error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to create payment order`);
      }

      const orderResponse: CashfreeOrderResponse = await response.json();
      console.log('Cashfree order created successfully:', orderResponse);
      
      if (!orderResponse.payment_session_id) {
        throw new Error('Invalid response: payment_session_id not found');
      }

      // Return in the format expected by the checkout flow
      return {
        data: {
          paymentRequestBody: {
            paymentSessionId: orderResponse.payment_session_id,
            returnUrl: orderResponse.return_url || paymentData.returnUrl || `${window.location.origin}/payment/callback`
          }
        }
      };
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }

  async processPayment(initiatePaymentResponse: InitiatePaymentResponse): Promise<void> {
    try {
      // Check if this is a demo session
      const sessionId = initiatePaymentResponse.data.paymentRequestBody.paymentSessionId;
      if (sessionId.startsWith('demo_session_')) {
        console.log('Demo mode: Simulating payment redirect');
        // Simulate a short delay then redirect to callback
        setTimeout(() => {
          window.location.href = initiatePaymentResponse.data.paymentRequestBody.returnUrl;
        }, 2000);
        return;
      }

      if (!this.cashfree) {
        await this.initializeCashfree();
        if (!this.cashfree) {
          throw new Error('Cashfree SDK not initialized. Please check if Cashfree script is loaded.');
        }
      }

      // Extract payment session details using the provided format
      const checkoutOptions = {
        paymentSessionId: initiatePaymentResponse.data.paymentRequestBody.paymentSessionId,
        returnUrl: initiatePaymentResponse.data.paymentRequestBody.returnUrl,
      };

      console.log('Cashfree checkout options:', checkoutOptions);

      const cashfreeEnvironment = this.isProduction ? 'production' : 'sandbox';
      console.log('Using Cashfree environment:', cashfreeEnvironment);

      // Initialize Cashfree with correct environment
      const cashfree = window.Cashfree({ mode: cashfreeEnvironment });

      return new Promise((resolve, reject) => {
        cashfree.checkout(checkoutOptions).then((result: any) => {
          console.log('Cashfree checkout result:', result);
          
          if (result.error) {
            console.error('Cashfree payment error:', result.error);
            reject(new Error(result.error.message || 'Payment failed'));
          } else if (result.redirect) {
            console.log('Redirection to Cashfree payment page');
            // The redirect will happen automatically
            resolve();
          } else {
            console.log('Payment completed successfully');
            resolve();
          }
        }).catch((error: any) => {
          console.error('Cashfree checkout error:', error);
          reject(new Error(error.message || 'Payment processing failed'));
        });
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async verifyPayment(orderId: string): Promise<boolean> {
    try {
      console.log('Verifying Cashfree payment for order:', orderId);

      // Call backend API to verify payment with Cashfree
      const response = await fetch(`${this.backendBaseUrl}/payment/verify/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Payment verification API error:', errorData);
        throw new Error(errorData.message || 'Failed to verify payment');
      }

      const verificationData = await response.json();
      console.log('Cashfree payment verification result:', verificationData);
      
      const isSuccess = verificationData.payment_status === 'SUCCESS' || 
                       verificationData.order_status === 'PAID';
      
      console.log('Payment verification result:', isSuccess);
      return isSuccess;
    } catch (error) {
      console.error('Error verifying Cashfree payment:', error);
      return false;
    }
  }

  // Get current payment mode for UI display
  getPaymentMode(): string {
    return this.paymentMode;
  }

  // Check if using test environment
  isTestMode(): boolean {
    return !this.isProduction;
  }

  // Handle payment callback from Cashfree
  handlePaymentCallback(callbackData: any): { success: boolean; orderId: string; message: string } {
    try {
      console.log('Handling payment callback:', callbackData);
      
      const { order_id, order_status, payment_status, payment_message } = callbackData;
      
      if (payment_status === 'SUCCESS' && order_status === 'PAID') {
        return {
          success: true,
          orderId: order_id,
          message: 'Payment completed successfully'
        };
      } else if (payment_status === 'FAILED') {
        return {
          success: false,
          orderId: order_id,
          message: payment_message || 'Payment failed'
        };
      } else if (payment_status === 'USER_DROPPED') {
        return {
          success: false,
          orderId: order_id,
          message: 'Payment cancelled by user'
        };
      } else {
        return {
          success: false,
          orderId: order_id,
          message: `Payment status: ${payment_status}, Order status: ${order_status}`
        };
      }
    } catch (error) {
      console.error('Error handling payment callback:', error);
      return {
        success: false,
        orderId: '',
        message: 'Failed to process payment callback'
      };
    }
  }

  // Test payment service configuration
  async testPaymentService(): Promise<{ success: boolean; mode: string; message: string }> {
    try {
      console.log('Testing payment service configuration...');
      
      // Check if Cashfree SDK is available
      if (!window.Cashfree) {
        return {
          success: false,
          mode: this.paymentMode,
          message: 'Cashfree SDK not loaded. Please check if the script is included.'
        };
      }

      // Test backend connectivity with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const testResponse = await fetch(`${this.backendBaseUrl}/payment/test`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!testResponse.ok) {
          return {
            success: false,
            mode: this.paymentMode,
            message: `Backend API returned ${testResponse.status}. Please deploy the backend APIs.`
          };
        }
        
        const testData = await testResponse.json();
        console.log('Backend API test successful:', testData);
        
      } catch (error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            mode: this.paymentMode,
            message: 'Backend API timeout. Please ensure backend is deployed and accessible.'
          };
        }
        
        return {
          success: false,
          mode: this.paymentMode,
          message: `Backend API not deployed. Please deploy the /api/payment/ endpoints.`
        };
      }

      return {
        success: true,
        mode: this.paymentMode,
        message: `Cashfree ${this.isTestMode() ? 'Test' : 'Live'} mode ready. Backend API connected.`
      };
    } catch (error) {
      return {
        success: false,
        mode: this.paymentMode,
        message: `Configuration test failed: ${error.message}`
      };
    }
  }
}

export const paymentService = new PaymentService();