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
}

class PaymentService {
  private cashfree: any = null;
  private paymentMode: string;
  private isProduction: boolean;

  constructor() {
    this.paymentMode = import.meta.env.VITE_PAYMENT_MODE || 'mock';
    this.isProduction = import.meta.env.VITE_CASHFREE_ENV === 'PRODUCTION';
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
    console.log('Using Cashfree payment flow');
    
    try {
      // Call backend API to create Cashfree order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
            notify_url: paymentData.notifyUrl || `${window.location.origin}/api/payment/webhook`
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const orderData: CashfreeOrderResponse = await response.json();
      console.log('Cashfree order created:', orderData);
      
      return orderData.payment_session_id;
    } catch (error) {
      console.error('Error creating Cashfree payment session:', error);
      throw error;
    }
  }

  async processPayment(sessionId: string): Promise<void> {
    try {
      console.log('Processing payment with session:', sessionId, 'Mode:', this.paymentMode);

      switch (this.paymentMode) {
        case 'mock':
          return this.processMockPayment(sessionId);
        
        case 'cashfree-test':
        case 'cashfree-live':
          return this.processCashfreePayment(sessionId);
        
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

  private async processCashfreePayment(sessionId: string): Promise<void> {
    if (!this.cashfree) {
      throw new Error('Cashfree SDK not initialized');
    }

    console.log('Processing Cashfree payment');

    // Use the checkout options format you specified
    const checkoutOptions = {
      paymentSessionId: sessionId,
      returnUrl: `${window.location.origin}/payment/callback`
    };

    const cashfreeEnvironment = this.isProduction ? 'production' : 'sandbox';
    const cashfree = window.Cashfree({ mode: cashfreeEnvironment });

    return new Promise((resolve, reject) => {
      cashfree.checkout(checkoutOptions).then((result: any) => {
        console.log('Cashfree checkout result:', result);
        
        if (result.error) {
          console.error('Cashfree payment error:', result.error);
          reject(new Error(result.error.message || 'Payment failed'));
        } else if (result.redirect) {
          console.log('Redirection to Cashfree');
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
      // Call backend API to verify payment with Cashfree
      const response = await fetch(`/api/payment/verify/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const verificationData = await response.json();
      console.log('Cashfree payment verification result:', verificationData);
      
      return verificationData.payment_status === 'SUCCESS';
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
      const testData: PaymentRequest = {
        orderId: 'TEST_ORDER_123',
        amount: 100,
        currency: 'INR',
        customerDetails: {
          customerId: 'test_customer',
          customerPhone: '+919876543210',
          customerName: 'Test User',
          customerEmail: 'test@example.com'
        }
      };

      const sessionId = await this.createPaymentSession(testData);
      
      return {
        success: true,
        mode: this.paymentMode,
        message: `Payment service test successful in ${this.paymentMode} mode. Session ID: ${sessionId}`
      };
    } catch (error) {
      return {
        success: false,
        mode: this.paymentMode,
        message: `Payment service test failed: ${error.message}`
      };
    }
  }

  // Handle payment callback from Cashfree
  handlePaymentCallback(callbackData: any): { success: boolean; orderId: string; message: string } {
    try {
      console.log('Handling payment callback:', callbackData);
      
      const { order_id, order_status, payment_status } = callbackData;
      
      if (payment_status === 'SUCCESS' && order_status === 'PAID') {
        return {
          success: true,
          orderId: order_id,
          message: 'Payment completed successfully'
        };
      } else {
        return {
          success: false,
          orderId: order_id,
          message: `Payment failed. Status: ${payment_status}, Order Status: ${order_status}`
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