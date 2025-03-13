import React from 'react';
import { Container, Typography, Paper, Box, Divider } from '@mui/material';

const HomePage = () => {
return (
    <Container maxWidth="lg">
        <Box my={4}>
            <Paper elevation={3} style={{ padding: '20px' }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Bienvenue sur notre projet
                </Typography>
                <Typography variant="h6" component="h2" gutterBottom>
            Par Jeremy Rollo, Yann Rohan et Frederic Xucxai.
          </Typography>
          <Typography variant="body1">
            Notre dataset concerne les caractéristiques des voitures et leur prix. Nous avons décidé de créer un site web pour visualiser les données, les analyser et les prédire grâce à un modèle de Machine Learning.
          </Typography>
        </Paper>

        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <Box mb={4}>
            <Typography variant="h4" component="h2" gutterBottom>
              Contexte
            </Typography>
            <Typography variant="body1">
              Notre dataset concerne les caractéristiques des voitures et leur prix. Nous avons décidé de créer un site web pour visualiser les données, les analyser et les prédire grâce à un modèle de Machine Learning.
            </Typography>
          </Box>

          <Divider />

          <Box mb={4} mt={4}>
            <Typography variant="h4" component="h2" gutterBottom>
              Objectifs
            </Typography>
            <Typography variant="body1">
              Notre dataset concerne les caractéristiques des voitures et leur prix. Nous avons décidé de créer un site web pour visualiser les données, les analyser et les prédire grâce à un modèle de Machine Learning.
            </Typography>
          </Box>

          <Divider />

          <Box mb={4} mt={4}>
            <Typography variant="h4" component="h2" gutterBottom>
              Solution
            </Typography>
            <Typography variant="body1">
              Notre dataset concerne les caractéristiques des voitures et leur prix. Nous avons décidé de créer un site web pour visualiser les données, les analyser et les prédire grâce à un modèle de Machine Learning.
            </Typography>
          </Box>

          <Divider />

          <Box mb={4} mt={4}>
            <Typography variant="h4" component="h2" gutterBottom>
              Données Utilisées
            </Typography>
            <Typography variant="body1">
             
            Ce dataset sur les voitures neuves inclut des caractéristiques telles que la marque, le modèle, l'année, le type de moteur et d'autres propriétés des véhicules, utilisées pour prédire leur prix.
            Les données ont été extraites de sources telles qu'Edmunds et Twitter, offrant une vue d'ensemble complète des caractéristiques influençant le prix des voitures.
            Nous remercions Edmunds et Twitter pour la fourniture de ces informations précieuses. Ce projet a été réalisé par Sam Keene.
            Ce dataset permet d'explorer les effets des différentes caractéristiques sur le prix des voitures. Comment la marque influence-t-elle le prix ? Quels modèles peuvent être considérés comme surévalués ? Quelle est la relation entre le prix et la popularité ?

            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage;