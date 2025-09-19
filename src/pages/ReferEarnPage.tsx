import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { Share, ContentCopy, CardGiftcard, Person } from '@mui/icons-material';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';

export const ReferEarnPage: React.FC = () => {
  const { user } = useAuth();
  const [referralCode] = useState('QWIKY' + user?.mobile?.slice(-4) || '1234');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Qwiky with my referral code',
        text: `Use my referral code ${referralCode} and get ₹50 off on your first booking!`,
        url: `https://qwiky.app/ref/${referralCode}`
      });
    }
  };

  const referrals = [
    { name: 'John Doe', status: 'completed', reward: 100, date: '2025-01-15' },
    { name: 'Jane Smith', status: 'pending', reward: 100, date: '2025-01-10' }
  ];

  const totalEarnings = referrals.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.reward, 0);

  return (
    <Box>
      <Header title="Refer & Earn" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* Referral Program Info */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #4E2780 0%, #6B46A3 100%)', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CardGiftcard sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h5" fontWeight={600} mb={1}>
              Refer Friends & Earn ₹100
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              For every successful referral, you get ₹100 discount on your next booking
            </Typography>
          </CardContent>
        </Card>

        {/* Your Referral Code */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>Your Referral Code</Typography>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                value={referralCode}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleCopyCode}
                startIcon={<ContentCopy />}
                sx={{ minWidth: 100 }}
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </Button>
            </Box>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Share />}
              onClick={handleShare}
            >
              Share with Friends
            </Button>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>How it Works</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="1. Share your referral code"
                  secondary="Send your unique code to friends and family"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2. Friend signs up & books"
                  secondary="They use your code and complete their first booking"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="3. You earn ₹100 discount"
                  secondary="Get ₹100 off on your next booking within 90 days"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Your Earnings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Your Earnings</Typography>
              <Chip
                label={`₹${totalEarnings} Earned`}
                color="success"
                variant="outlined"
              />
            </Box>
            
            {referrals.length > 0 ? (
              <List>
                {referrals.map((referral, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <Person sx={{ mr: 2, color: 'text.secondary' }} />
                      <ListItemText
                        primary={referral.name}
                        secondary={`Referred on ${referral.date}`}
                      />
                      <Chip
                        label={referral.status === 'completed' ? `+₹${referral.reward}` : 'Pending'}
                        color={referral.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                    {index < referrals.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No referrals yet. Start sharing your code to earn rewards!
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Terms & Conditions</Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <ul style={{ paddingLeft: 20 }}>
                <li>Referral reward is valid for 90 days from the date earned</li>
                <li>Friend must complete their first booking to qualify</li>
                <li>No limit on number of referrals</li>
                <li>Rewards cannot be transferred or exchanged for cash</li>
                <li>Qwiky reserves the right to modify terms at any time</li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};