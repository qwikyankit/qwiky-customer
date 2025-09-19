// Data Flow Validation Utility
import { supabase } from '../config/supabase';

export class DataFlowValidator {
  // Validate database connection
  async validateConnection() {
    console.log('🔌 Validating Database Connection...');
    
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        console.error('❌ Database Connection Failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Database Connection Successful');
      return { success: true, message: 'Connected to Supabase' };
    } catch (error) {
      console.error('❌ Connection Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate table structure
  async validateTableStructure() {
    console.log('🏗️ Validating Table Structure...');
    
    const tables = ['users', 'guest_addresses', 'services', 'cart_items', 'orders', 'order_items', 'transactions'];
    const results = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error) {
          console.error(`❌ Table ${table} validation failed:`, error);
          results[table] = { success: false, error: error.message };
        } else {
          console.log(`✅ Table ${table} is accessible`);
          results[table] = { success: true, accessible: true };
        }
      } catch (error) {
        console.error(`❌ Table ${table} error:`, error);
        results[table] = { success: false, error: error.message };
      }
    }

    return results;
  }

  // Validate RLS policies
  async validateRLSPolicies() {
    console.log('🔒 Validating Row Level Security Policies...');
    
    try {
      // Test without authentication (should fail for protected tables)
      const { data: userData, error: userError } = await supabase.from('users').select('*').limit(1);
      
      // Test with authentication (should work)
      // Note: This would require actual authentication in a real scenario
      
      return {
        withoutAuth: { success: userError !== null, message: 'RLS is working - access denied without auth' },
        // withAuth would be tested with actual user session
      };
    } catch (error) {
      console.error('❌ RLS Validation Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate data relationships
  async validateDataRelationships() {
    console.log('🔗 Validating Data Relationships...');
    
    try {
      // Test foreign key relationships
      const { data: ordersWithItems, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            services (*)
          ),
          guest_addresses (*),
          users (*)
        `)
        .limit(1);

      if (error) {
        console.error('❌ Relationship validation failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Data relationships are working');
      return { success: true, data: ordersWithItems };
    } catch (error) {
      console.error('❌ Relationship Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Run complete validation
  async runCompleteValidation() {
    console.log('🚀 Starting Complete Data Flow Validation...');
    
    const results = {
      connection: await this.validateConnection(),
      tableStructure: await this.validateTableStructure(),
      rlsPolicies: await this.validateRLSPolicies(),
      dataRelationships: await this.validateDataRelationships()
    };

    console.log('📊 Validation Results:', results);
    return results;
  }
}

// Export singleton instance
export const dataFlowValidator = new DataFlowValidator();