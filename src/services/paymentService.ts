import { PaymentRequest } from '../types';

declare global {
  interface Window {
    Cashfree?: any;
  }
}

class PaymentService {
  private cashfree: any = null;

  constructor() {
    this.initializeCashfree();
  }

  private async initializeCashfree() {
    try {
      // Check if Cashfree is available globally
      if (window.Cashfree) {
        // Initialize Cashfree with environment mode
        this.cashfree = window.Cashfree({
          mode: import.meta.env.VITE_CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox'
        });
      } else {
        console.error('Cashfree SDK not loaded');
      }
    } catch (error) {
      console.error('Failed to initialize Cashfree:', error);
    }
  }

  async createPaymentSession(paymentData: PaymentRequest): Promise<string> {
    // For development, create a mock session ID
    // In production, this should call your backend API
    const mockSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockSessionId;
  }

  async processPayment(sessionId: string): Promise<void> {
    if (!this.cashfree) {
      await this.initializeCashfree();
    }

    if (!this.cashfree) {
      throw new Error('Cashfree SDK not initialized');
    }

    return new Promise((resolve, reject) => {
      this.cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: '_modal',
      }).then((result: any) => {
        if (result.error) {
          reject(new Error(result.error.message));
        } else if (result.paymentDetails) {
          resolve();
        }
      }).catch((error: any) => {
        reject(new Error(error.message));
      });
    });
  }

  async verifyPayment(orderId: string): Promise<boolean> {
    // For development, simulate payment verification
    // In production, this should call your backend API to verify with Cashfree
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful verification
    return true;
  }
}

export const paymentService = new PaymentService();