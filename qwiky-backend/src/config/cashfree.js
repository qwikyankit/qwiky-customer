const axios = require('axios');
const { logger } = require('../utils/logger');

class CashfreeService {
  constructor() {
    this.isProduction = process.env.CASHFREE_ENV === 'PRODUCTION';
    
    if (this.isProduction) {
      this.baseUrl = 'https://api.cashfree.com/pg';
      this.appId = process.env.CASHFREE_APP_ID_PROD;
      this.secretKey = process.env.CASHFREE_SECRET_KEY_PROD;
    } else {
      this.baseUrl = 'https://sandbox.cashfree.com/pg';
      this.appId = process.env.CASHFREE_APP_ID;
      this.secretKey = process.env.CASHFREE_SECRET_KEY;
    }

    if (!this.appId || !this.secretKey) {
      logger.error('Missing Cashfree configuration for environment:', process.env.CASHFREE_ENV);
      throw new Error('Cashfree configuration missing');
    }

    this.headers = {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': this.appId,
      'x-client-secret': this.secretKey
    };

    logger.info(`🏦 Cashfree initialized in ${this.isProduction ? 'PRODUCTION' : 'TEST'} mode`);
  }

  async createOrder(orderData) {
    try {
      logger.info('Creating Cashfree order:', {
        orderId: orderData.order_id,
        amount: orderData.order_amount,
        environment: this.isProduction ? 'production' : 'sandbox'
      });

      const response = await axios.post(
        `${this.baseUrl}/orders`,
        orderData,
        { headers: this.headers }
      );

      logger.info('Cashfree order created successfully:', {
        orderId: response.data.order_id,
        sessionId: response.data.payment_session_id
      });

      return response.data;
    } catch (error) {
      logger.error('Cashfree create order error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async getOrderStatus(orderId) {
    try {
      logger.info('Getting Cashfree order status:', { orderId });

      const response = await axios.get(
        `${this.baseUrl}/orders/${orderId}`,
        { headers: this.headers }
      );

      logger.info('Cashfree order status retrieved:', {
        orderId: response.data.order_id,
        orderStatus: response.data.order_status,
        paymentStatus: response.data.payment_status
      });

      return response.data;
    } catch (error) {
      logger.error('Cashfree get order status error:', {
        orderId,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async getPaymentDetails(orderId, paymentId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/orders/${orderId}/payments/${paymentId}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      logger.error('Cashfree get payment details error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new CashfreeService();