import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import datacsv from "../data/voiture_clean.csv";

const Graph4 = () => {
  const [trace1, setTrace1] = useState([]);
  const [trace2, setTrace2] = useState([]);
  const [trace3, setTrace3] = useState([]);
  const [setTop5] = useState([]);

  useEffect(() => {
    fetch(datacsv)
      .then(res => res.text())
      .then(text => {
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const raw = parsed.data;

        // Graphique 1 : Top 15 des marques avec le plus de modèles
        const clean = raw.filter(row => row.Make && row.Model);
        const uniqueModels = [];
        const seen = new Set();
        clean.forEach(row => {
          const key = `${row.Make}___${row.Model}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueModels.push(row);
          }
        });
        const brandMap = {};
        uniqueModels.forEach(row => {
          const make = row.Make;
          if (!brandMap[make]) brandMap[make] = new Set();
          brandMap[make].add(row.Model);
        });
        const countData = Object.entries(brandMap).map(([make, models]) => ({
          Marque: make,
          "Nombre de modèles": models.size
        })).sort((a, b) => b["Nombre de modèles"] - a["Nombre de modèles"]);
        const top15 = countData.slice(0, 15);
        setTop5(countData.slice(0, 5).map(d => d.Marque));
        const traceData1 = [{
          type: "bar",
          x: top15.map(d => d.Marque),
          y: top15.map(d => d["Nombre de modèles"]),
          text: top15.map(d => d["Nombre de modèles"]),
          textposition: "outside",
          marker: {
            color: "#4682B4",
            line: {
              color: "black",
              width: 1
            }
          }
        }];
        setTrace1(traceData1);

        // Graphique 2 : Répartition des segments pour les 5 marques principales
        const clean2 = raw.filter(row => row.Make && row.Model && row["Market Category"]);
        const uniqueMarketModels = [];
        const seen2 = new Set();
        clean2.forEach(row => {
          const key = `${row.Make}___${row.Model}___${row["Market Category"]}`;
          if (!seen2.has(key)) {
            seen2.add(key);
            uniqueMarketModels.push(row);
          }
        });
        const exploded = [];
        uniqueMarketModels.forEach(row => {
          const markets = row["Market Category"].split(",").map(m => m.trim());
          markets.forEach(market => {
            exploded.push({
              make: row.Make,
              market,
              model: row.Model
            });
          });
        });
        const top5makes = countData.slice(0, 5).map(d => d.Marque);
        const filtered = exploded.filter(row => top5makes.includes(row.make));
        const segmentMap = {};
        filtered.forEach(row => {
          const key = `${row.make}___${row.market}`;
          if (!segmentMap[key]) segmentMap[key] = new Set();
          segmentMap[key].add(row.model);
        });
        const segmentData = {};
        Object.entries(segmentMap).forEach(([key, modelSet]) => {
          const [make, market] = key.split("___");
          if (!segmentData[market]) segmentData[market] = { x: [], y: [], text: [] };
          segmentData[market].x.push(make);
          segmentData[market].y.push(modelSet.size);
          segmentData[market].text.push(modelSet.size);
        });
        const traceData2 = Object.entries(segmentData).map(([market, values]) => ({
          type: "bar",
          name: market,
          x: values.x,
          y: values.y,
          text: values.text,
          textposition: "inside",
          marker: {
            line: { width: 0.5, color: 'black' }
          }
        }));
        setTrace2(traceData2);

        // Graphique 3 : Diversité des segments vs popularité moyenne
        const clean3 = raw.filter(row => row.Make && row.Model && row["Market Category"] && row.Popularity);
        const seen3 = new Set();
        const uniqueMarketModels3 = [];
        clean3.forEach(row => {
          const key = `${row.Make}___${row.Model}___${row["Market Category"]}`;
          if (!seen3.has(key)) {
            seen3.add(key);
            uniqueMarketModels3.push(row);
          }
        });
        const exploded3 = [];
        uniqueMarketModels3.forEach(row => {
          const markets = row["Market Category"].split(",").map(m => m.trim());
          markets.forEach(market => {
            exploded3.push({
              make: row.Make,
              market,
              popularity: parseFloat(row.Popularity)
            });
          });
        });
        const marketDiversity = {};
        const popularityMap = {};
        exploded3.forEach(row => {
          if (!marketDiversity[row.make]) marketDiversity[row.make] = new Set();
          marketDiversity[row.make].add(row.market);

          if (!popularityMap[row.make]) popularityMap[row.make] = [];
          popularityMap[row.make].push(row.popularity);
        });
        const diversityData = Object.keys(marketDiversity).map(make => ({
          make,
          diversity: marketDiversity[make].size,
          popularity: popularityMap[make].reduce((a, b) => a + b, 0) / popularityMap[make].length
        }));
        const traceData3 = [{
          type: "box",
          x: diversityData.map(d => d.diversity),
          y: diversityData.map(d => d.popularity),
          marker: { line: { width: 1.5 } },
          boxpoints: false,
          hoverinfo: "x+y"
        }];
        setTrace3(traceData3);
      });
  }, []);

  return (
    <div className="space-y-12 p-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Top 15 des marques avec le plus grand nombre de modèles distincts</h2>
        <Plot
          data={trace1}
          layout={{
            title: { text: "", x: 0.5, font: { size: 20 } },
            font: { size: 14 },
            height: 600,
            xaxis: {
              title: { text: "Marque", font: { size: 16 } },
              tickangle: -30,
              tickfont: { size: 13 }
            },
            yaxis: {
              title: { text: "Nombre de modèles", font: { size: 16 } },
              tickfont: { size: 13 },
              gridcolor: "lightgrey"
            },
            margin: { t: 80, b: 60, l: 60, r: 40 },
            plot_bgcolor: "white",
            showlegend: false
          }}
          config={{ responsive: true }}
          style={{ width: "100%" }}
        />
                  <p>
            Ce graphique s'intéresse à la <strong>...</strong> des véhicules.
          </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Répartition des segments pour les 5 marques principales</h2>
        <Plot
          data={trace2}
          layout={{
            barmode: "stack",
            title: { text: "", x: 0.5, font: { size: 20 } },
            font: { size: 14 },
            height: 600,
            xaxis: {
              title: { text: "Marque", font: { size: 16 } },
              tickangle: 0,
              tickfont: { size: 13, family: 'Arial', color: 'black' }
            },
            yaxis: {
              title: { text: "Nombre de modèles", font: { size: 16 } },
              tickfont: { size: 13 },
              gridcolor: "lightgrey"
            },
            legend: { title: { text: "Segment (Market Category)" } },
            plot_bgcolor: "white",
            margin: { t: 80, b: 60, l: 60, r: 40 }
          }}
          config={{ responsive: true }}
          style={{ width: "100%" }}
        />
                  <p>
            Ce graphique s'intéresse à la <strong>...</strong> des véhicules.
          </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Distribution de la popularité moyenne selon la diversité des segments</h2>
        <Plot
          data={trace3}
          layout={{
            title: { text: "", x: 0.5, font: { size: 20 } },
            font: { size: 14 },
            height: 600,
            xaxis: {
              title: { text: "Nombre de segments distincts", font: { size: 16 } },
              tickmode: 'linear',
              tickfont: { size: 13 }
            },
            yaxis: {
              title: { text: "Popularité moyenne", font: { size: 16 } },
              tickfont: { size: 13 },
              gridcolor: "lightgrey"
            },
            showlegend: false,
            plot_bgcolor: "white",
            margin: { t: 80, b: 40, l: 60, r: 40 }
          }}
          config={{ responsive: true }}
          style={{ width: "100%" }}
        />

        <p>
            Ce graphique s'intéresse à la <strong>...</strong> des véhicules.
          </p>
      </div>
    </div>
  );
};

export default Graph4;
