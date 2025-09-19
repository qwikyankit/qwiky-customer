import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Person, Phone, History, ExitToApp, LocationOn, Edit } from '@mui/icons-material';
import { BugReport } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { Header } from '../components/common/Header';
import { getText } from '../resources/text';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { clearBooking } = useBooking();
  const [editDialog, setEditDialog] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  const handleLogout = () => {
    clearBooking();
    logout();
    navigate('/');
  };

  const handleOrderHistory = () => {
    navigate('/orders');
  };

  const handleManageAddresses = () => {
    navigate('/manage-addresses');
  };

  const handleApiTest = () => {
    navigate('/api-test');
  };

  const handleEditProfile = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditDialog(true);
  };

  const handleSaveProfile = () => {
    if (user) {
      const updatedUser = {
        ...user,
        name: editName.trim(),
        email: editEmail.trim(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      // Update auth context would be ideal here
    }
    setEditDialog(false);
  };
  return (
    <Box sx={{ pb: 8 }}>
      <Header title={getText('profile.title')} showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box textAlign="center" py={2} position="relative">
              <Person sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" mb={1}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +91 {user?.mobile}
              </Typography>
              <Button
                startIcon={<Edit />}
                onClick={handleEditProfile}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                size="small"
              >
                Edit
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleOrderHistory}>
                <ListItemIcon>
                  <History />
                </ListItemIcon>
                <ListItemText primary={getText('profile.orderHistory')} />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleManageAddresses}>
                <ListItemIcon>
                  <LocationOn />
                </ListItemIcon>
                <ListItemText primary="Manage Addresses" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleApiTest}>
                <ListItemIcon>
                  <BugReport />
                </ListItemIcon>
                <ListItemText primary="API Testing" />
              </ListItemButton>
            </ListItem>
          </List>
        </Card>

        <Card>
          <CardContent>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
            >
              {getText('profile.logout')}
            </Button>
          </CardContent>
        </Card>
      </Container>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};