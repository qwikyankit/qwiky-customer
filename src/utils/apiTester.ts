// API Testing and Validation Utility
import { supabaseService } from '../services/supabaseService';
import { User, GuestAddress, Service, Order, Transaction } from '../types';

export class ApiTester {
  private testResults: { [key: string]: any } = {};

  // Test User Operations
  async testUserOperations() {
    console.log('🧪 Testing User Operations...');
    
    try {
      // Test user creation
      const testUser = await supabaseService.createUser({
        mobile: '9876543210',
        name: 'Test User',
        email: 'test@example.com'
      });
      console.log('✅ User Created:', testUser);
      this.testResults.userCreation = { success: true, data: testUser };

      // Test user retrieval
      const retrievedUser = await supabaseService.getUser(testUser.id);
      console.log('✅ User Retrieved:', retrievedUser);
      this.testResults.userRetrieval = { success: true, data: retrievedUser };

      // Test user update
      const updatedUser = await supabaseService.updateUser(testUser.id, {
        name: 'Updated Test User'
      });
      console.log('✅ User Updated:', updatedUser);
      this.testResults.userUpdate = { success: true, data: updatedUser };

      return testUser;
    } catch (error) {
      console.error('❌ User Operations Failed:', error);
      this.testResults.userOperations = { success: false, error: error.message };
      throw error;
    }
  }

  // Test Address Operations
  async testAddressOperations(userId: string) {
    console.log('🧪 Testing Address Operations...');
    
    try {
      // Test address creation
      const testAddress = await supabaseService.createGuestAddress({
        userId,
        addressLine1: 'Test House 123',
        addressLine2: 'Test Area',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
        country: 'India',
        isDefault: true
      });
      console.log('✅ Address Created:', testAddress);
      this.testResults.addressCreation = { success: true, data: testAddress };

      // Test address retrieval
      const userAddresses = await supabaseService.getUserAddresses(userId);
      console.log('✅ Addresses Retrieved:', userAddresses);
      this.testResults.addressRetrieval = { success: true, data: userAddresses };

      return testAddress;
    } catch (error) {
      console.error('❌ Address Operations Failed:', error);
      this.testResults.addressOperations = { success: false, error: error.message };
      throw error;
    }
  }

  // Test Service Operations
  async testServiceOperations() {
    console.log('🧪 Testing Service Operations...');
    
    try {
      // Test service retrieval
      const services = await supabaseService.getServices();
      console.log('✅ Services Retrieved:', services);
      this.testResults.serviceRetrieval = { success: true, data: services };

      return services;
    } catch (error) {
      console.error('❌ Service Operations Failed:', error);
      this.testResults.serviceOperations = { success: false, error: error.message };
      throw error;
    }
  }

  // Test Cart Operations
  async testCartOperations(userId: string, serviceId: string) {
    console.log('🧪 Testing Cart Operations...');
    
    try {
      // Test add to cart
      const cartItem = await supabaseService.addToCart({
        userId,
        serviceId,
        quantity: 1,
        scheduledDate: '2025-01-20',
        scheduledTime: '10:00'
      });
      console.log('✅ Item Added to Cart:', cartItem);
      this.testResults.addToCart = { success: true, data: cartItem };

      // Test get cart items
      const cartItems = await supabaseService.getCartItems(userId);
      console.log('✅ Cart Items Retrieved:', cartItems);
      this.testResults.getCartItems = { success: true, data: cartItems };

      // Test update cart item
      const updatedCartItem = await supabaseService.updateCartItem(cartItem.id, {
        quantity: 2
      });
      console.log('✅ Cart Item Updated:', updatedCartItem);
      this.testResults.updateCartItem = { success: true, data: updatedCartItem };

      return cartItem;
    } catch (error) {
      console.error('❌ Cart Operations Failed:', error);
      this.testResults.cartOperations = { success: false, error: error.message };
      throw error;
    }
  }

  // Test Order Operations
  async testOrderOperations(userId: string, addressId: string, serviceId: string) {
    console.log('🧪 Testing Order Operations...');
    
    try {
      // Test order creation
      const orderData = {
        userId,
        guestAddressId: addressId,
        subtotal: 154,
        discountAmount: 0,
        totalAmount: 154,
        scheduledDate: '2025-01-20',
        scheduledTime: '10:00',
        notes: 'Test booking'
      };

      const orderItems = [{
        serviceId,
        quantity: 1,
        unitPrice: 154,
        totalPrice: 154
      }];

      const order = await supabaseService.createOrder(orderData, orderItems);
      console.log('✅ Order Created:', order);
      this.testResults.orderCreation = { success: true, data: order };

      // Test order retrieval
      const retrievedOrder = await supabaseService.getOrder(order.id);
      console.log('✅ Order Retrieved:', retrievedOrder);
      this.testResults.orderRetrieval = { success: true, data: retrievedOrder };

      // Test user orders
      const userOrders = await supabaseService.getUserOrders(userId);
      console.log('✅ User Orders Retrieved:', userOrders);
      this.testResults.userOrders = { success: true, data: userOrders };

      return order;
    } catch (error) {
      console.error('❌ Order Operations Failed:', error);
      this.testResults.orderOperations = { success: false, error: error.message };
      throw error;
    }
  }

  // Test Transaction Operations
  async testTransactionOperations(orderId: string) {
    console.log('🧪 Testing Transaction Operations...');
    
    try {
      // Test transaction creation
      const transaction = await supabaseService.createTransaction({
        orderId,
        paymentGateway: 'Cashfree',
        amount: 154,
        currency: 'INR',
        status: 'pending'
      });
      console.log('✅ Transaction Created:', transaction);
      this.testResults.transactionCreation = { success: true, data: transaction };

      // Test transaction update
      const updatedTransaction = await supabaseService.updateTransaction(transaction.id, {
        status: 'success',
        gatewayTransactionId: 'CF_TEST_123456'
      });
      console.log('✅ Transaction Updated:', updatedTransaction);
      this.testResults.transactionUpdate = { success: true, data: updatedTransaction };

      return transaction;
    } catch (error) {
      console.error('❌ Transaction Operations Failed:', error);
      this.testResults.transactionOperations = { success: false, error: error.message };
      throw error;
    }
  }

  // Run Complete API Test Suite
  async runCompleteTest() {
    console.log('🚀 Starting Complete API Test Suite...');
    
    try {
      // Test user operations
      const user = await this.testUserOperations();
      
      // Test address operations
      const address = await this.testAddressOperations(user.id);
      
      // Test service operations
      const services = await this.testServiceOperations();
      
      // Test cart operations
      if (services.length > 0) {
        const cartItem = await this.testCartOperations(user.id, services[0].id);
      }
      
      // Test order operations
      if (services.length > 0) {
        const order = await this.testOrderOperations(user.id, address.id, services[0].id);
        
        // Test transaction operations
        await this.testTransactionOperations(order.id);
      }

      console.log('🎉 All API Tests Completed Successfully!');
      console.log('📊 Test Results Summary:', this.testResults);
      
      return this.testResults;
    } catch (error) {
      console.error('💥 API Test Suite Failed:', error);
      console.log('📊 Partial Test Results:', this.testResults);
      throw error;
    }
  }

  // Get test results
  getTestResults() {
    return this.testResults;
  }

  // Clear test results
  clearTestResults() {
    this.testResults = {};
  }
}

// Export singleton instance
export const apiTester = new ApiTester();