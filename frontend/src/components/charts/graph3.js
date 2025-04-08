import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import datacsv from "../data/voiture_clean.csv";

const Graph3 = () => {
  const [tracesMPG, setTracesMPG] = useState([]);
  const [tracesPrice, setTracesPrice] = useState([]);

  useEffect(() => {
    fetch(datacsv)
      .then(res => res.text())
      .then(text => {
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const raw = parsed.data;

        const data = raw.map(row => ({
          hp: parseFloat(row["Engine HP"]),
          city: parseFloat(row["city mpg"]),
          highway: parseFloat(row["highway MPG"]),
          cylinders: parseInt(row["Engine Cylinders"]),
          market: row["Market Category"],
          price: parseFloat(row.MSRP)
        })).filter(row =>
          !isNaN(row.hp) && !isNaN(row.city) && !isNaN(row.highway) &&
          row.cylinders > 0 && !isNaN(row.price) && row.market
        );

        // Graphique 1 : Consommation moyenne
        const mpgData = data.map(d => ({
          ...d,
          avg_mpg: (d.city + d.highway) / 2
        }));

        const hpValues = mpgData.map(d => d.hp).sort((a, b) => a - b);
        const quantiles = [0, 0.2, 0.4, 0.6, 0.8, 1].map(q => hpValues[Math.floor(q * (hpValues.length - 1))]);
        const hpLabels = ["Très faible", "Faible", "Moyenne", "Élevée", "Très élevée"];

        mpgData.forEach(d => {
          for (let i = 0; i < quantiles.length - 1; i++) {
            if (d.hp >= quantiles[i] && d.hp <= quantiles[i + 1]) {
              d.hp_range = hpLabels[i];
              break;
            }
          }
        });

        const groupedMPG = {};
        mpgData.forEach(d => {
          const key = `${d.hp_range}_${d.cylinders}`;
          if (!groupedMPG[key]) groupedMPG[key] = [];
          groupedMPG[key].push(d.avg_mpg);
        });

        const mpgResult = {};
        Object.entries(groupedMPG).forEach(([key, values]) => {
          const [hp_range, cylinders] = key.split("_");
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const std = Math.sqrt(values.reduce((sum, x) => sum + Math.pow(x - avg, 2), 0) / values.length);
          if (!mpgResult[cylinders]) mpgResult[cylinders] = { x: [], y: [], error_y: [] };
          mpgResult[cylinders].x.push(hp_range);
          mpgResult[cylinders].y.push(avg);
          mpgResult[cylinders].error_y.push(std);
        });

        const traces1 = Object.entries(mpgResult).map(([cyl, obj]) => ({
          x: hpLabels,
          y: hpLabels.map(label => {
            const idx = obj.x.indexOf(label);
            return idx !== -1 ? obj.y[idx] : null;
          }),
          error_y: {
            type: "data",
            array: hpLabels.map(label => {
              const idx = obj.x.indexOf(label);
              return idx !== -1 ? obj.error_y[idx] : null;
            }),
            visible: true
          },
          type: "scatter",
          mode: "lines+markers",
          name: `${cyl} cylindres`,
          marker: { size: 8 }
        }));

        setTracesMPG(traces1);

        // Graphique 2 : Prix moyen par catégorie de marché
        // Graphique 2 : Prix moyen par catégorie de marché
            const explodedData = [];

            data.forEach(d => {
            if (d.market && d.market.trim() !== "") {
                // Attention : certaines valeurs sont entre guillemets avec virgules internes
                const marketList = d.market.split(",").map(c => c.trim()).filter(Boolean);
                marketList.forEach(cat => {
                explodedData.push({
                    hp: d.hp,
                    price: d.price,
                    market: cat
                });
                });
            }
            });

        const hpValues2 = explodedData.map(d => d.hp).sort((a, b) => a - b);
        const quantiles2 = [0, 0.2, 0.4, 0.6, 0.8, 1].map(q => hpValues2[Math.floor(q * (hpValues2.length - 1))]);
        const hpLabels2 = ["Très faible", "Faible", "Moyenne", "Élevée", "Très élevée"];

        explodedData.forEach(d => {
          for (let i = 0; i < quantiles2.length - 1; i++) {
            if (d.hp >= quantiles2[i] && d.hp <= quantiles2[i + 1]) {
              d.hp_range = hpLabels2[i];
              break;
            }
          }
        });

        const groupedPrice = {};
            const counts = {};
            const marketSet = new Set();

            explodedData.forEach(d => {
            const key = JSON.stringify([d.hp_range, d.market]);
            if (!groupedPrice[key]) groupedPrice[key] = [];
            groupedPrice[key].push(d.price);
            counts[key] = (counts[key] || 0) + 1;
            marketSet.add(d.market);
            });

        console.log("Grouped Price:", groupedPrice);
        console.log("Counts:", counts);
        console.log("Market Set:", Array.from(marketSet));

        const traces2 = [];
        Array.from(marketSet).forEach(market => {
          const y = [];
          const text = [];
          hpLabels2.forEach(hp => {
            const key = JSON.stringify([hp, market]);
            const prices = groupedPrice[key];
            if (prices && prices.length > 0) {
              const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
              y.push(Math.round(avg));
              text.push(counts[key]);
            } else {
              y.push(0); // Remplace null par 0 pour éviter les barres manquantes
              text.push(0); // Remplace null par 0 pour les textes
            }
          });

          if (y.some(val => val !== 0)) { // Vérifie si au moins une valeur est non nulle
            traces2.push({
              type: "bar",
              name: market,
              x: hpLabels2,
              y,
              text,
              textposition: "outside",
              hovertemplate: `<b>%{x}</b><br>Catégorie: ${market}<br>Prix moyen: $%{y}<br>Nombre de véhicules: %{text}`,
            });
          }
        });

        setTracesPrice(traces2);
      });
  }, []);

  return (
    <div className="space-y-12 p-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Consommation moyenne par puissance moteur</h2>
        <Plot
          data={tracesMPG}
          layout={{
            autosize: true,
            height: 500,
            xaxis: {
              title: { 
                text: "Type de puissance moteur",
                font: {
                  size: 16,
                  color: '#333'
                }
              },
              categoryorder: "array",
              categoryarray: ["Très faible", "Faible", "Moyenne", "Élevée", "Très élevée"]
            },
            yaxis: {
              title: { 
                text: "Consommation moyenne (MPG)",
                font: {
                  size: 16,
                  color: '#333'
                }
                
              },
            },
            legend: { title: { text: "Nb Cylindres" } },
            margin: { t: 50, b: 100 }
          }}
          config={{ responsive: true }}
          style={{ width: "100%" }}
        />
                <div className="mt-4 text-gray-700 leading-relaxed space-y-4">
          <p>
            Ce graphique s'intéresse à la <strong>...</strong> des véhicules.
          </p>

           
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Prix moyen par catégorie de véhicule et puissance moteur</h2>
        <Plot
          data={tracesPrice}
          layout={{
            barmode: "group",
            autosize: true,
            height: 600,
            xaxis: {
              title: { 
                text: "Type de puissance moteur",
                font: {
                  size: 16,
                  color: '#333'
                }
                },
              categoryorder: "array",
              categoryarray: ["Très faible", "Faible", "Moyenne", "Élevée", "Très élevée"]
            },
            yaxis: {
              title: {
                text: "Prix moyen ($)",
                font: {
                  size: 16,
                  color: '#333'
                }
              },
              tickprefix: "$",
            },
            legend: {
              title: { text: "Catégorie de véhicule" },
              orientation: "h",
              y: -0.3
            },
            margin: { t: 50, b: 120 }
          }}
          config={{ responsive: true }}
          style={{ width: "100%" }}
        />
        <div className="mt-4 text-gray-700 leading-relaxed space-y-4">
          <p>
            Ce graphique s'intéresse à la <strong>...</strong> des véhicules.
          </p>

           
        </div>
      </div>
    </div>
  );
};

export default Graph3;
