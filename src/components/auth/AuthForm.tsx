import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getText } from '../../resources/text';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AuthForm: React.FC = () => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const { login, verifyOtp, isLoading, error, clearError } = useAuth();

  const validateMobile = (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const validateOtp = (otp: string): boolean => {
    return /^\d{4}$/.test(otp);
  };

  const handleSendOtp = async () => {
    if (!validateMobile(mobile)) {
      return;
    }

    clearError();
    try {
      await login(mobile);
      setStep('otp');
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp(otp)) {
      return;
    }

    clearError();
    try {
      await verifyOtp(mobile, otp);
      // Check if user has address, if not redirect to address setup
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const addresses = JSON.parse(localStorage.getItem(`addresses_${user.id}`) || '[]');
      
      if (addresses.length === 0) {
        navigate('/address-setup', { state: { fromSignup: true } });
      }
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleResendOtp = async () => {
    clearError();
    setOtp('');
    try {
      await login(mobile);
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleBackToMobile = () => {
    setStep('mobile');
    setOtp('');
    clearError();
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="primary.main"
      p={2}
    >
      <Box textAlign="center" mb={4}>
        <img
          src="/qwiky.png"
          alt="Qwiky"
          style={{ width: 162, height: 52, marginBottom: 16 }}
        />
        <Box
          width={200}
          height="1px"
          bgcolor="white"
          mx="auto"
          mb={2}
        />
        <Typography
          variant="h5"
          color="white"
          fontWeight={600}
        >
          {getText('auth.subtitle')}
        </Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h6" mb={3} textAlign="center">
            {getText('auth.title')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {step === 'mobile' ? (
            <Box>
              <TextField
                fullWidth
                label={getText('auth.mobileLabel')}
                placeholder={getText('auth.mobilePlaceholder')}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                error={mobile && !validateMobile(mobile)}
                helperText={mobile && !validateMobile(mobile) ? getText('auth.invalidMobile') : ''}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>+91</Typography>,
                }}
                sx={{ mb: 3 }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSendOtp}
                disabled={!validateMobile(mobile)}
              >
                {getText('auth.sendOtp')}
              </Button>
            </Box>
          ) : (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <IconButton onClick={handleBackToMobile} sx={{ mr: 1 }}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Enter OTP
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {getText('auth.otpSent')} +91 {mobile}
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                For testing, use OTP: <strong>9999</strong>
              </Alert>
              <TextField
                fullWidth
                label={getText('auth.otpLabel')}
                placeholder={getText('auth.otpPlaceholder')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                error={otp && !validateOtp(otp)}
                helperText={otp && !validateOtp(otp) ? getText('auth.invalidOtp') : ''}
                inputProps={{ maxLength: 4 }}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleVerifyOtp}
                disabled={!validateOtp(otp)}
                sx={{ mb: 2 }}
              >
                {getText('auth.verifyOtp')}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={handleResendOtp}
              >
                {getText('auth.resendOtp')}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};