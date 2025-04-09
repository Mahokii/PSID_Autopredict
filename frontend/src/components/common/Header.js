import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import logo from '../../logo512.png';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} /> {/* Use the SVG as an image */}
        <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'white' }}>
          AutoPredict - Votre compagnon de recommandation de véhicules 
        </Typography>
        <div style={{ flexGrow: 1 }} />
        <Button color="inherit" component={Link} to="/">Accueil</Button>
        <Button color="inherit" component={Link} to="/model-ml">Modèle ML</Button>
        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
