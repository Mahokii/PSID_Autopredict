import React from 'react';
import { Container, Typography } from '@mui/material';

const Footer = () => {
  return (
    <footer>
      <Container maxWidth="lg">
        <Typography variant="body2" color="textSecondary" align="center">
          &copy; {new Date().getFullYear()} PSID. Tous droits réservés.
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;
