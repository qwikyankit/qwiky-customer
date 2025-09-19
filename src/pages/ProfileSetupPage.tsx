import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';

export const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      
      // Update user profile
      const updatedUser = {
        ...user,
        name: name.trim(),
        email: email.trim(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Process referral code if provided
      if (referralCode.trim()) {
        // Store referral code for processing
        localStorage.setItem(`referral_${user?.id}`, referralCode.trim());
      }
      
      // Navigate to home
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header title="" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography variant="h6" mb={1}>
          User Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Please provide your details
        </Typography>

        <TextField
          fullWidth
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          placeholder="E-mail ID (Optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          placeholder="Qwiky Referral Code (Optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          sx={{ mb: 4 }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSignUp}
          disabled={!name.trim() || isLoading}
          sx={{ py: 2 }}
        >
          {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
        </Button>
      </Container>
    </Box>
  );
};