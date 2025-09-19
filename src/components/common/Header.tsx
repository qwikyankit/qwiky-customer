import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { ArrowBack, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showProfile?: boolean;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showProfile = false,
  onProfileClick
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackClick}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {showProfile && (
          <IconButton color="inherit" onClick={onProfileClick}>
            <Person />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};