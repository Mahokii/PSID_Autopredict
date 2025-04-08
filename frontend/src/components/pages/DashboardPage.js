import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import Graph1 from '../charts/graph1';
import Graph2 from '../charts/graph2';
import Graph3 from '../charts/graph3';
import Graph4 from '../charts/graph4'; 

const DashboardPage = () => {
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tableau de Bord des Données
          </Typography>
          <Typography variant="body1">
            Explorez ici des statistiques détaillées de notre jeu de données sur les caractéristiques des voitures. Grâce aux graphiques interactifs ci-dessous, vous pourrez approfondir votre compréhension des tendances et des facteurs clés liés à ces véhicules.
          </Typography>

          <Box mt={6}>
            <Typography variant="h4" gutterBottom>
              Comment l'ancienneté d'une voiture affecte-t-elle son prix ?
            </Typography>
            <Graph1 />
          </Box>

          <Box mt={6}>
            <Typography variant="h4" gutterBottom>
              Quel type de transmission est le plus économique ?
            </Typography>
            <Graph2 />
          </Box>

          <Box mt={6}>
            <Typography variant="h4" gutterBottom>
              Est-il possible d'allier performance, économie de carburant et prix d'achat faible ?
            </Typography>
            <Graph3 /> 
          </Box>
          
          <Box mt={6}>
            <Typography variant="h4" gutterBottom>
              La diversité des gammes constructeurs a-t-elle un impact sur leurs popularités ?
            </Typography>
            <Graph4 />
          </Box>

        </Paper>
      </Box>
    </Container>
  );
};

export default DashboardPage;
