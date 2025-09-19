import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CardMedia,
  Button,
  Alert,
} from '@mui/material';
import { Service } from '../../types';
import { getText } from '../../resources/text';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface ServiceSelectorProps {
  onServiceSelect: (service: Service) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onServiceSelect }) => {
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Using dummy data for development - replace with API call in production
      const servicesData: Service[] = [
        {
          id: '1',
          name: '60 Minutes → "The Quick Fix Hour"',
          description: 'Perfect for quick chores like cleaning, utensils, or a light tidy-up. 60 mins',
          price: 99,
          durationMinutes: 60,
          categoryId: 'cleaning',
          imageUrl: 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=300',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: '90 Minutes → "The Power Hour & a Half"',
          description: 'Ideal for medium tasks such as sweeping, mopping, laundry, and a mix of daily needs.',
          price: 149,
          durationMinutes: 90,
          categoryId: 'cleaning',
          imageUrl: 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=300',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: '120 Minutes → "The Full Care Session"',
          description: 'Best for deep cleaning, multiple chores, or when you want everything done at once.',
          price: 199,
          durationMinutes: 120,
          categoryId: 'cleaning',
          imageUrl: 'https://images.pexels.com/photos/4239140/pexels-photo-4239140.jpeg?auto=compress&cs=tinysrgb&w=300',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setServices(servicesData);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadServices} />;
  }

  if (services.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="h6" mb={2}>
          {getText('booking.selectService')}
        </Typography>
        <Alert severity="info">
          No services available at the moment. Please try again later.
        </Alert>
      </Box>
    );
  }
  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>
        {getText('booking.selectService')}
      </Typography>

      <Grid container spacing={2}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} key={service.id}>
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {service.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={service.imageUrl}
                  alt={service.name}
                />
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  {service.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {service.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" color="primary">
                    ₹{service.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.durationMinutes} mins
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onServiceSelect(service)}
                  sx={{ mt: 'auto' }}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};