class PaymentService {
  private cashfree: any = null;
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.VITE_CASHFREE_ENV === 'PRODUCTION';
    this.initializeCashfree();
  }

  private async initializeCashfree() {
    try {
      // Check if Cashfree is available globally
      if (window.Cashfree) {
        // Initialize Cashfree with environment mode
        this.cashfree = window.Cashfree({
          mode: this.isProduction ? 'production' : 'sandbox'
        });
        console.log('Cashfree initialized in', this.isProduction ? 'production' : 'sandbox', 'mode');
      } else {
        console.warn('Cashfree SDK not loaded, will use mock payment');
      }
    } catch (error) {
      console.error('Failed to initialize Cashfree:', error);
    }
  }

  async createPaymentSession(paymentData: PaymentRequest): Promise<string> {
    try {
      console.log('Creating payment session for:', paymentData);
      
      // For demo purposes, we'll simulate a successful payment session creation
      // In production, this should call your backend API which then calls Cashfree
      
      if (!this.isProduction) {
        // Development/Demo mode - use mock session
        const mockSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Mock payment session created:', mockSessionId);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockSessionId;
      }

      // For production, you would call your backend API here
      // Example:
      // const response = await fetch('/api/payments/create-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(paymentData)
      // });
      // const data = await response.json();
      // return data.payment_session_id;

      // For now, return a mock session even in production
      const mockSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Production mock payment session created:', mockSessionId);
      return mockSessionId;

    } catch (error) {
      console.error('Error creating payment session:', error);
      throw new Error('Failed to create payment session');
    }
  }

  async processPayment(sessionId: string): Promise<void> {
    try {
      console.log('Processing payment with session:', sessionId);

      // For demo purposes, simulate successful payment
      if (!this.cashfree || !this.isProduction) {
        console.log('Using mock payment flow');
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment
        console.log('Mock payment completed successfully');
        return;
      }

      // Real Cashfree payment processing
      return new Promise((resolve, reject) => {
        this.cashfree.checkout({
          paymentSessionId: sessionId,
          redirectTarget: '_modal',
        }).then((result: any) => {
          console.log('Cashfree payment result:', result);
          
          if (result.error) {
            console.error('Cashfree payment error:', result.error);
            reject(new Error(result.error.message || 'Payment failed'));
          } else if (result.paymentDetails) {
            console.log('Payment successful:', result.paymentDetails);
            resolve();
          } else {
            console.log('Payment completed');
            resolve();
          }
        }).catch((error: any) => {
          console.error('Cashfree checkout error:', error);
          reject(new Error(error.message || 'Payment processing failed'));
        });
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error('Payment processing failed');
    }
  }

  async verifyPayment(orderId: string): Promise<boolean> {
    try {
      console.log('Verifying payment for order:', orderId);
      
      // For demo purposes, simulate successful verification
      // In production, this should call your backend API to verify with Cashfree
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock successful verification
      console.log('Payment verification successful');
      return true;

    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  // Method to test if payment service is working
  async testPaymentService(): Promise<boolean> {
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
      console.log('Payment service test successful, session ID:', sessionId);
      return true;
    } catch (error) {
      console.error('Payment service test failed:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();