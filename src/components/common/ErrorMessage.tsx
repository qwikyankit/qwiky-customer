import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { getText } from '../../resources/text';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  severity?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  severity = 'error'
}) => {
  return (
    <Box p={2}>
      <Alert severity={severity}>
        <AlertTitle>{getText('common.error')}</AlertTitle>
        {message}
        {onRetry && (
          <Box mt={1}>
            <Button size="small" onClick={onRetry} color="inherit">
              {getText('common.retry')}
            </Button>
          </Box>
        )}
      </Alert>
    </Box>
  );
};