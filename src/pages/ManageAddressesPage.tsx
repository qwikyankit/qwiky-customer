import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Add, Edit, Delete, LocationOn, Home, Business } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';

interface Address {
  id: string;
  location: string;
  houseNumber: string;
  apartmentArea: string;
  addressType: 'Home' | 'Office' | 'Custom';
  isPetParent: boolean;
  rooms: number;
  washrooms: number;
  residents: number;
  homeSize: string;
  isDefault: boolean;
  createdAt: string;
}

export const ManageAddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; addressId: string | null }>({
    open: false,
    addressId: null
  });

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = () => {
    if (user) {
      const savedAddresses = JSON.parse(localStorage.getItem(`addresses_${user.id}`) || '[]');
      setAddresses(savedAddresses);
    }
  };

  const handleAddAddress = () => {
    navigate('/address-setup');
  };

  const handleEditAddress = (addressId: string) => {
    navigate('/address-setup', { state: { editAddressId: addressId } });
  };

  const handleDeleteAddress = (addressId: string) => {
    setDeleteDialog({ open: true, addressId });
  };

  const confirmDelete = () => {
    if (deleteDialog.addressId && user) {
      const updatedAddresses = addresses.filter(addr => addr.id !== deleteDialog.addressId);
      
      // If deleting default address and there are other addresses, make the first one default
      if (addresses.find(addr => addr.id === deleteDialog.addressId)?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }
      
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
    }
    setDeleteDialog({ open: false, addressId: null });
  };

  const handleSetDefault = (addressId: string) => {
    if (user) {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'Home': return <Home />;
      case 'Office': return <Business />;
      default: return <LocationOn />;
    }
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Header title="Manage Addresses" showBackButton />
      
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* Add Address Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Add />}
          onClick={handleAddAddress}
          sx={{ mb: 3, py: 2 }}
        >
          Add New Address
        </Button>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Box textAlign="center" py={8}>
            <LocationOn sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={2}>
              No addresses saved
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add your first address to get started
            </Typography>
          </Box>
        ) : (
          <List>
            {addresses.map((address) => (
              <Card key={address.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box display="flex" alignItems="flex-start" flex={1}>
                      {getAddressIcon(address.addressType)}
                      <Box ml={2} flex={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="h6">
                            {address.addressType}
                          </Typography>
                          {address.isDefault && (
                            <Chip label="Default" size="small" color="primary" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {address.houseNumber}, {address.apartmentArea}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {address.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {address.rooms} rooms • {address.washrooms} washrooms • {address.residents} residents • {address.homeSize} sqft
                        </Typography>
                        {address.isPetParent && (
                          <Chip label="Pet Parent" size="small" sx={{ mt: 1 }} />
                        )}
                      </Box>
                    </Box>
                    
                    <Box display="flex" flexDirection="column" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditAddress(address.id)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {!address.isDefault && (
                    <Button
                      size="small"
                      onClick={() => handleSetDefault(address.id)}
                      sx={{ mt: 2 }}
                    >
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, addressId: null })}
      >
        <DialogTitle>Delete Address</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this address? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, addressId: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};