import React from 'react';
import Plot from 'react-plotly.js';

const DataChart = ({ data }) => {
  return (
    <Plot
      data={[
        {
          x: data.map(row => row.x),
          y: data.map(row => row.y),
          mode: 'markers',
          type: 'scatter',
          marker: { color: 'blue' },
        },
      ]}
      layout={{ title: 'Analyse Multivariée' }}
    />
  );
};

export default DataChart;
