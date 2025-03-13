import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const DashboardPage = () => {
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tableau de Bord des Données
          </Typography>
          <Typography variant="body1">
            Explorez ici des statistiques détaillées notre jeux de données sur les caractéristiques des voitures. Grâce aux graphiques interactifs ci-dessous, vous pourrez approfondir votre compréhension des tendances et des facteurs clés liés à ces véhicules.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default DashboardPage;
