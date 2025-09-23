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
  cashfree_order_id?: string;
}

class PaymentService {
  private cashfree: any = null;
  private paymentMode: string;
  private isProduction: boolean;
  private backendBaseUrl: string;

  constructor() {
    this.paymentMode = import.meta.env.VITE_PAYMENT_MODE || 'mock';
    this.isProduction = import.meta.env.VITE_CASHFREE_ENV === 'PRODUCTION';
    this.backendBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    this.initializeCashfree();
  }

  private async initializeCashfree() {
    try {
      // Only initialize Cashfree SDK for real payment modes
      if (this.paymentMode !== 'mock' && window.Cashfree) {
        this.cashfree = window.Cashfree({
          mode: this.isProduction ? 'production' : 'sandbox'
        });
        console.log('Cashfree initialized in', this.isProduction ? 'production' : 'sandbox', 'mode');
      }
    } catch (error) {
      console.error('Failed to initialize Cashfree:', error);
    }
  }

  async createPaymentSession(paymentData: PaymentRequest): Promise<string> {
    try {
      console.log('Creating payment session with mode:', this.paymentMode);
      console.log('Payment data:', paymentData);
      
      switch (this.paymentMode) {
        case 'mock':
          return this.createMockPaymentSession(paymentData);
        
        case 'cashfree-test':
        case 'cashfree-live':
          return this.createCashfreePaymentSession(paymentData);
        
        default:
          throw new Error(`Unsupported payment mode: ${this.paymentMode}`);
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      throw new Error('Failed to create payment session');
    }
  }

  private async createMockPaymentSession(paymentData: PaymentRequest): Promise<string> {
    console.log('Using mock payment flow');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockSessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Mock payment session created:', mockSessionId);
    
    return mockSessionId;
  }

  private async createCashfreePaymentSession(paymentData: PaymentRequest): Promise<string> {
    console.log('Creating real Cashfree payment session');
    
    try {
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
      const response = await fetch(`${this.backendBaseUrl}/api/payment/create-order`, {
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

      return orderResponse.payment_session_id;
    } catch (error) {
      console.error('Error creating Cashfree payment session:', error);
      throw error;
    }
  }

  async processPayment(sessionId: string, paymentData?: PaymentRequest): Promise<void> {
    try {
      console.log('Processing payment with session:', sessionId, 'Mode:', this.paymentMode);

      switch (this.paymentMode) {
        case 'mock':
          return this.processMockPayment(sessionId);
        
        case 'cashfree-test':
        case 'cashfree-live':
          return this.processCashfreePayment(sessionId, paymentData);
        
        default:
          throw new Error(`Unsupported payment mode: ${this.paymentMode}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error('Payment processing failed');
    }
  }

  private async processMockPayment(sessionId: string): Promise<void> {
    console.log('Processing mock payment');
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      console.log('Mock payment completed successfully');
      return;
    } else {
      throw new Error('Mock payment failed (simulated failure)');
    }
  }

  private async processCashfreePayment(sessionId: string, paymentData?: PaymentRequest): Promise<void> {
    if (!this.cashfree) {
      // Try to initialize if not already done
      await this.initializeCashfree();
      if (!this.cashfree) {
        throw new Error('Cashfree SDK not initialized. Please check if Cashfree script is loaded.');
      }
    }

    console.log('Processing real Cashfree payment with session:', sessionId);

    // Prepare checkout options as per your specification
    const checkoutOptions = {
      paymentSessionId: sessionId,
      returnUrl: paymentData?.returnUrl || `${window.location.origin}/payment/callback`
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
          // We resolve here as the redirect is successful
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
  }

  async verifyPayment(orderId: string): Promise<boolean> {
    try {
      console.log('Verifying payment for order:', orderId, 'Mode:', this.paymentMode);
      
      switch (this.paymentMode) {
        case 'mock':
          return this.verifyMockPayment(orderId);
        
        case 'cashfree-test':
        case 'cashfree-live':
          return this.verifyCashfreePayment(orderId);
        
        default:
          console.warn('Unknown payment mode, defaulting to mock verification');
          return this.verifyMockPayment(orderId);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  private async verifyMockPayment(orderId: string): Promise<boolean> {
    console.log('Verifying mock payment');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful verification
    console.log('Mock payment verification successful');
    return true;
  }

  private async verifyCashfreePayment(orderId: string): Promise<boolean> {
    try {
      console.log('Verifying real Cashfree payment for order:', orderId);

      // Call backend API to verify payment with Cashfree
      const response = await fetch(`${this.backendBaseUrl}/api/payment/verify/${orderId}`, {
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

  // Get current payment mode
  getPaymentMode(): string {
    return this.paymentMode;
  }

  // Check if payment service is properly configured
  async testPaymentService(): Promise<{ success: boolean; mode: string; message: string }> {
    try {
      console.log('Testing payment service configuration...');
      
      // Test different aspects based on payment mode
      if (this.paymentMode === 'mock') {
        return {
          success: true,
          mode: this.paymentMode,
          message: 'Mock payment mode - ready for testing'
        };
      }

      // For Cashfree modes, test if SDK is available
      if (!window.Cashfree) {
        return {
          success: false,
          mode: this.paymentMode,
          message: 'Cashfree SDK not loaded. Please check if the script is included.'
        };
      }

      // Test backend connectivity
      try {
        const testResponse = await fetch(`${this.backendBaseUrl}/api/payment/test`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!testResponse.ok) {
          return {
            success: false,
            mode: this.paymentMode,
            message: `Backend API not accessible at ${this.backendBaseUrl}`
          };
        }
      } catch (error) {
        return {
          success: false,
          mode: this.paymentMode,
          message: `Backend API connection failed: ${error.message}`
        };
      }

      return {
        success: true,
        mode: this.paymentMode,
        message: `${this.paymentMode} mode configured and ready`
      };
    } catch (error) {
      return {
        success: false,
        mode: this.paymentMode,
        message: `Configuration test failed: ${error.message}`
      };
    }
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
}

export const paymentService = new PaymentService();