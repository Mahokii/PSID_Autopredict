import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, TextField, Button, MenuItem, Select } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Papa from 'papaparse';
import brandcsv from '../ressources/companies.csv';
import { predictPrice } from '../services/api';

const ModelMLPage = () => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    fuel_type: '',
    hp: '',
    transmission: ''
  });

  const [brands, setBrands] = useState([]);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    fetch(brandcsv)
      .then(response => response.text())
      .then(data => {
        Papa.parse(data, {
          header: true,
          complete: results => {
            setBrands(results.data);
          }
        });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulated backend response
      const mockResponse = {
        predict_price: 25000,
        "RMSE%": 5,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        fuel_type: formData.fuel_type,
        hp: formData.hp,
        transmission: formData.transmission
      };
      setPrediction(mockResponse);
    } catch (error) {
      console.error('Error fetching prediction:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      make: '',
      model: '',
      year: '',
      fuel_type: '',
      hp: '',
      transmission: ''
    });
    setPrediction(null);
  };

  const handleDateChange = (newValue) => {
    setFormData({
      ...formData,
      year: newValue ? newValue.getFullYear() : '' // Conserver l'année comme chaîne pour le formulaire
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Box my={4}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Car Price Predictor
            </Typography>
            {prediction ? (
              <Box textAlign="center">
                <Typography variant="h2" color="primary">
                  Prix estimé: {prediction.predict_price} €
                </Typography>
                <Typography variant="h5" color="textSecondary">
                  Erreur (RMSE%): {prediction['RMSE%']}%
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Marque: {prediction.make}, Modèle: {prediction.model}, Année: {prediction.year},
                  Carburant: {prediction.fuel_type}, Puissance: {prediction.hp} HP, Transmission: {prediction.transmission}
                </Typography>
                <Button variant="contained" color="secondary" onClick={handleReset} style={{ marginTop: '20px' }}>
                  Faire une autre prédiction
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Box mb={2}>
                  <Select
                    fullWidth
                    required
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Selectionnez la marque
                    </MenuItem>
                    {brands.map((brand, index) => (
                      <MenuItem key={index} value={brand.name}>
                        <Box display="flex" alignItems="center">
                          <img src={brand.logo_link} alt={brand.name} style={{ width: '30px', marginRight: '10px' }} />
                          {brand.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box mb={2}>
                  <TextField
                    fullWidth
                    required
                    label="Modèle"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Box>

                <Box mb={2}>
                  <DatePicker
                    views={['year']}
                    label="Année"
                    value={formData.year ? new Date(formData.year, 0) : null} // Convertir l'année en objet Date
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true, error: false } }}
                  />
                </Box>


                <Box mb={2}>
                  <Select
                    fullWidth
                    required
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Selectionnez le type de carburant
                    </MenuItem>
                    <MenuItem value="essence">Essence</MenuItem>
                    <MenuItem value="flex-fuel">Flex-Fuel</MenuItem>
                    <MenuItem value="diesel">Diesel</MenuItem>
                    <MenuItem value="electrique">Electrique</MenuItem>
                    <MenuItem value="gaz naturel">Gaz Naturel</MenuItem>
                  </Select>
                </Box>

                <Box mb={2}>
                  <TextField
                    fullWidth
                    required
                    label="Puissance DIN (HP)"
                    name="hp"
                    type="number"
                    value={formData.hp}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Box>

                <Box mb={2}>
                  <Select
                    fullWidth
                    required
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Selectionnez la transmission
                    </MenuItem>
                    <MenuItem value="manual">Manuel</MenuItem>
                    <MenuItem value="automatic">Automatique</MenuItem>
                    <MenuItem value="automated_manual">Automatique manuel</MenuItem>
                    <MenuItem value="direct_drive">Direct Drive</MenuItem>
                  </Select>
                </Box>

                <Button type="submit" variant="contained" color="primary">
                  Soumettre
                </Button>
              </form>
            )}
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default ModelMLPage;