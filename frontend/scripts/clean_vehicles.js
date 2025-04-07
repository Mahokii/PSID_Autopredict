const fs = require('fs');
const Papa = require('papaparse');
const csv = require('csv-parser');

const INPUT_FILE = '../src/components/data/voiture.csv'
const OUTPUT_FILE = '../src/components/data/voiture_clean.csv'

const numericCols = ['Engine HP', 'Engine Cylinders', 'highway MPG', 'city mpg', 'MSRP'];
const cleanData = [];

fs.createReadStream(INPUT_FILE)
  .pipe(csv())
  .on('data', (row) => {
    cleanData.push(row);
  })
  .on('end', () => {
    // Supprimer les doublons
    const uniqueRows = Array.from(new Map(cleanData.map(item => [JSON.stringify(item), item])).values());

    // Nettoyage et conversion
    const filled = uniqueRows.map(row => {
      // Parsing
      const hp = parseFloat(row['Engine HP']) || 0;
      const cyl = parseFloat(row['Engine Cylinders']) || 0;
      const doors = parseFloat(row['Number of Doors']);
      const price = parseFloat(row['MSRP']) || 0;

      return {
        ...row,
        'Engine Fuel Type': row['Engine Fuel Type'] || 'regular unleaded',
        'Engine HP': hp,
        'Engine Cylinders': cyl,
        'Number of Doors': isNaN(doors) ? null : doors,
        'Transmission Type': row['Transmission Type'],
        'MSRP': price
      };
    });

    // Remplir la moyenne des portes manquantes
    const validDoors = filled.map(r => parseFloat(r['Number of Doors'])).filter(v => !isNaN(v));
    const doorsMean = validDoors.reduce((a, b) => a + b, 0) / validDoors.length;

    filled.forEach(row => {
      if (!row['Number of Doors'] || isNaN(row['Number of Doors'])) {
        row['Number of Doors'] = doorsMean;
      }
    });

    // Supprimer les transmissions inconnues
    const filtered = filled.filter(row => row['Transmission Type'] !== 'UNKNOWN');

    // Convertir les colonnes numériques
    filtered.forEach(row => {
      numericCols.forEach(col => {
        row[col] = parseFloat(row[col]);
      });
    });

    // Supprimer les outliers par IQR
    const bounds = {};
    numericCols.forEach(col => {
      const values = filtered.map(r => r[col]).filter(v => !isNaN(v));
      values.sort((a, b) => a - b);
      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1;
      bounds[col] = {
        min: q1 - 1.5 * iqr,
        max: q3 + 1.5 * iqr
      };
    });

    const cleaned = filtered.filter(row =>
      numericCols.every(col => row[col] >= bounds[col].min && row[col] <= bounds[col].max)
    );

    // Exporter en CSV
    const csvOutput = Papa.unparse(cleaned);
    fs.writeFileSync(OUTPUT_FILE, csvOutput);
    console.log(`Données nettoyées écrites dans : ${OUTPUT_FILE} (${cleaned.length} lignes)`);
  });
