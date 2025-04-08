import React from 'react';
import { Container, Typography, Paper, Box, Divider } from '@mui/material';

const HomePage = () => {
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Bienvenue sur le projet PSID
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom>
            Par Jérémy Rollo, Yann Rohan et Frédéric Xucxai.
          </Typography>
          <Typography variant="body1">
            Ce site web a été développé dans le cadre du projet PSID pour le Master 2 MIAGE. 
            Il permet d'explorer un jeu de données automobiles, d’analyser les caractéristiques 
            influençant le prix des véhicules et de prédire ce dernier grâce à un modèle de Machine Learning.
          </Typography>
        </Paper>

        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <Box mb={4}>
            <Typography variant="h4" component="h2" gutterBottom>
              Contexte
            </Typography>
            <Typography variant="body1">
              Le marché automobile est vaste et complexe, avec une multitude de facteurs influençant 
              le prix des véhicules. Grâce aux données disponibles, nous avons entrepris de développer 
              une solution permettant d’analyser ces éléments en temps réel et d’apporter une aide à la décision 
              pour le choix d’un véhicule adapté.
            </Typography>
          </Box>

          <Divider />

          <Box mb={4} mt={4}>
            <Typography variant="h4" component="h2" gutterBottom>
              Objectifs
            </Typography>
            <Typography variant="body1">
              Notre objectif est triple : 
              (1) explorer les données automobiles, 
              (2) construire des visualisations interactives pour mettre en évidence les relations entre variables, 
              et (3) proposer un modèle de prédiction du prix des véhicules basé sur leurs caractéristiques.
            </Typography>
          </Box>

          <Divider />

          <Box mb={4} mt={4}>
            <Typography variant="h4" component="h2" gutterBottom>
              Solution
            </Typography>
            <Typography variant="body1">
              Nous avons développé une application web complète intégrant des visualisations en React avec Plotly, 
              une analyse approfondie dans un notebook Jupyter, et un modèle de régression pour prédire les prix. 
              Ce travail permet d’identifier les modèles pertinents et de comprendre les critères qui influencent 
              réellement la valeur d’un véhicule.
            </Typography>
          </Box>

          <Divider />

          <Box mb={4} mt={4}>
            <Typography variant="h4" component="h2" gutterBottom>
              Données utilisées
            </Typography>
            <Typography variant="body1">
              Le dataset utilisé contient des informations sur des voitures neuves, incluant la marque, le modèle, 
              l’année, la puissance, la consommation, le type de moteur, la catégorie de marché et bien d’autres. 
              Les données proviennent notamment d’Edmunds et de Twitter, nous permettant une analyse croisée 
              entre spécificités techniques et perception sociale. Ce projet s’appuie sur une base de données 
              nettoyée et enrichie dans un but pédagogique et analytique.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage;
