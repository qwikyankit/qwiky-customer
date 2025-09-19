import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Chip
} from '@mui/material';
import { ExpandMore, PlayArrow, CheckCircle, Error, Warning } from '@mui/icons-material';
import { Header } from '../components/common/Header';
import { apiTester } from '../utils/apiTester';
import { dataFlowValidator } from '../utils/dataFlowValidator';

export const ApiTestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [validationResults, setValidationResults] = useState<any>(null);

  const runApiTests = async () => {
    setIsRunning(true);
    try {
      const results = await apiTester.runCompleteTest();
      setTestResults(results);
    } catch (error) {
      console.error('API Tests failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const runValidation = async () => {
    setIsRunning(true);
    try {
      const results = await dataFlowValidator.runCompleteValidation();
      setValidationResults(results);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle color="success" /> : <Error color="error" />;
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'success' : 'error';
  };

  const renderTestResult = (key: string, result: any) => {
    if (!result) return null;

    return (
      <Accordion key={key}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={1}>
            {getStatusIcon(result.success)}
            <Typography variant="h6">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Typography>
            <Chip 
              label={result.success ? 'PASS' : 'FAIL'} 
              color={getStatusColor(result.success) as any}
              size="small"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {result.success ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Test passed successfully
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                Test failed: {result.error}
              </Alert>
            )}
            
            {result.data && (
              <Box>
                <Typography variant="subtitle2" mb={1}>Response Data:</Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    bgcolor: 'grey.100', 
                    p: 2, 
                    borderRadius: 1, 
                    overflow: 'auto',
                    fontSize: '0.875rem'
                  }}
                >
                  {JSON.stringify(result.data, null, 2)}
                </Box>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Header title="API Testing & Validation" showBackButton />
      
      <Container maxWidth="md" sx={{ py: 2 }}>
        {/* Control Panel */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>Test Controls</Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={isRunning ? <CircularProgress size={20} /> : <PlayArrow />}
                onClick={runApiTests}
                disabled={isRunning}
              >
                Run API Tests
              </Button>
              <Button
                variant="outlined"
                startIcon={isRunning ? <CircularProgress size={20} /> : <PlayArrow />}
                onClick={runValidation}
                disabled={isRunning}
              >
                Run Data Flow Validation
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" mb={1}>How to use:</Typography>
          <Typography variant="body2" component="div">
            1. <strong>Run API Tests</strong> - Tests all CRUD operations for users, addresses, services, cart, orders, and transactions<br/>
            2. <strong>Run Data Flow Validation</strong> - Validates database connection, table structure, RLS policies, and relationships<br/>
            3. Check the console for detailed logs and expand accordions to see response data
          </Typography>
        </Alert>

        {/* API Test Results */}
        {testResults && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>API Test Results</Typography>
              {testResults.error ? (
                <Alert severity="error">
                  Test suite failed: {testResults.error}
                </Alert>
              ) : (
                <Box>
                  {Object.entries(testResults).map(([key, result]) => 
                    renderTestResult(key, result)
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Validation Results */}
        {validationResults && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Data Flow Validation Results</Typography>
              {validationResults.error ? (
                <Alert severity="error">
                  Validation failed: {validationResults.error}
                </Alert>
              ) : (
                <Box>
                  {Object.entries(validationResults).map(([key, result]) => 
                    renderTestResult(key, result)
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* API Documentation */}
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>API Endpoints Overview</Typography>
            <Box component="pre" sx={{ 
              bgcolor: 'grey.100', 
              p: 2, 
              borderRadius: 1, 
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
{`// User Operations
supabaseService.createUser(userData)
supabaseService.getUser(id)
supabaseService.updateUser(id, userData)

// Address Operations  
supabaseService.createGuestAddress(addressData)
supabaseService.getUserAddresses(userId)
supabaseService.updateGuestAddress(id, addressData)

// Service Operations
supabaseService.getServices()
supabaseService.getService(id)

// Cart Operations
supabaseService.addToCart(cartData)
supabaseService.getCartItems(userId)
supabaseService.updateCartItem(id, cartData)
supabaseService.removeFromCart(id)

// Order Operations
supabaseService.createOrder(orderData, orderItems)
supabaseService.getOrder(id)
supabaseService.getUserOrders(userId)
supabaseService.updateOrderStatus(id, status)

// Transaction Operations
supabaseService.createTransaction(transactionData)
supabaseService.updateTransaction(id, transactionData)`}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};