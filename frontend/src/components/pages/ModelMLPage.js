import React, { useState } from 'react';
import { Container, Typography, Paper, Box, TextField, Button, FormControl, FormControlLabel, Radio, RadioGroup, Collapse } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

const ModelMLPage = () => {
  const [formData, setFormData] = useState({
    mode: 'price', // 'price' or 'characteristics'
    make: '',
    model: '',
    year: '',
    engineFuelType: '',
    engineHp: '',
    engineCylinders: '',
    transmissionType: '',
    drivenWheels: '',
    numberOfDoors: '',
    marketCategory: '',
    vehicleSize: '',
    highwayMpg: '',
    cityMpg: '',
    popularity: '',
    msrp: ''
  });

  const [openOptional, setOpenOptional] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique pour soumettre les données du formulaire
    console.log(formData);
  };

  const requiredFieldsPrice = ['make', 'model', 'year', 'engineFuelType'];
  const requiredFieldsCharacteristics = ['msrp'];

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Car Price Predictor
          </Typography>
          <Typography variant="body1" gutterBottom>
            Utilisez ce formulaire pour prédire le prix d'un véhicule en fonction de ses caractéristiques ou pour déterminer les caractéristiques d'un véhicule en fonction de son prix.
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl component="fieldset">
              <RadioGroup
                row
                aria-label="mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
              >
                <FormControlLabel value="price" control={<Radio />} label="Prédire le prix" />
                <FormControlLabel value="characteristics" control={<Radio />} label="Prédire les caractéristiques" />
              </RadioGroup>
            </FormControl>

            {formData.mode === 'characteristics' && (
              <Box mb={2}>
                <TextField
                  fullWidth
                  required
                  label="Prix estimé"
                  name="msrp"
                  value={formData.msrp}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Box>
            )}

            {requiredFieldsPrice.map((field) => (
              <Box key={field} mb={2}>
                <TextField
                  fullWidth
                  required={formData.mode === 'price'}
                  label={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Box>
            ))}

            <Box mb={2}>
            <Button
              variant="outlined"
              onClick={() => setOpenOptional(!openOptional)}
              endIcon={<ExpandMoreIcon />}
            >
              {openOptional ? 'Masquer les caractéristiques optionnelles' : 'Afficher les caractéristiques optionnelles'}
            </Button>
            </Box>

            <Collapse in={openOptional}>
              {Object.keys(formData)
                .filter(key => !requiredFieldsPrice.includes(key) && key !== 'mode' && key !== 'msrp')
                .map((field) => (
                  <Box key={field} mb={2}>
                    <TextField
                      fullWidth
                      label={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Box>
                ))}
            </Collapse>

            <Button type="submit" variant="contained" color="primary">
              Soumettre
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ModelMLPage;
