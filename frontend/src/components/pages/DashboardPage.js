import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import DataChart from '../charts/DataChart';
import DepreciationCharts from '../charts/graph1';

const data = [
  { x: 1, y: 2, z: 3 },
  { x: 4, y: 5, z: 6 },
  { x: 7, y: 8, z: 9 },
];

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

          <Box mt={6}>
            <Typography variant="h4" gutterBottom>
              Commment l'ancienneté d'une voiture affecte-t-elle son prix ?
            </Typography>
            <DepreciationCharts />
          </Box>

        </Paper>
      </Box>
    </Container>
  );
};

export default DashboardPage;
