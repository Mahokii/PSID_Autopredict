import Button from "@mui/material/Button";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import datacsv from "../data/voiture_clean.csv";

const Graph2 = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("quantile"); // quantile ou sunburst

  useEffect(() => {
    fetch(datacsv)
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const clean = parsed.data.filter(
          (row) => 
            row["Transmission Type"] && 
            row.MSRP && 
            +row.MSRP > 1000 &&
            row["Vehicle Style"]
        );
        setData(clean);
      });
  }, []);

  const getBarChartData = () => {
    // Utilisation de 5 quantiles pour correspondre à l'analyse du notebook
    const quantiles = [0, 0.2, 0.4, 0.6, 0.8, 1];    const prices = data.map((row) => +row.MSRP).sort((a, b) => a - b);
    const quantileValues = quantiles.map((q) => 
      Math.round(prices[Math.floor(q * prices.length)] || 0)
    );

    const groupedData = {};    data.forEach((row) => {
      const price = +row.MSRP;
      const transmission = row["Transmission Type"];      // Récupération du prix maximum réel pour le dernier quantile
      const maxPrice = Math.max(...prices);
      
      // Par défaut, on met la dernière tranche de quantile au lieu de "Unknown"
      let quantile = `${quantileValues.length-1}e quantile ($${quantileValues[quantileValues.length-2].toLocaleString()}-$${maxPrice.toLocaleString()})`;
      
      // On vérifie si le prix appartient à une autre tranche
      for (let i = 0; i < quantileValues.length - 2; i++) {
        if (price >= quantileValues[i] && price < quantileValues[i + 1]) {
          quantile = `${i+1}e quantile ($${quantileValues[i].toLocaleString()}-$${quantileValues[i+1].toLocaleString()})`;
          break;
        }
      }
      
      // Cas spécial pour l'avant-dernière tranche (entre les deux dernières valeurs)
      if (price >= quantileValues[quantileValues.length - 2] && price <= quantileValues[quantileValues.length - 1]) {
        quantile = `${quantileValues.length-1}e quantile ($${quantileValues[quantileValues.length-2].toLocaleString()}-$${maxPrice.toLocaleString()})`;
      }

      if (!groupedData[quantile]) {
        groupedData[quantile] = {};
      }
      if (!groupedData[quantile][transmission]) {
        groupedData[quantile][transmission] = 0;
      }
      groupedData[quantile][transmission]++;
    });

    const x = Object.keys(groupedData).sort((a, b) => {
      // Trier par numéro de quantile
      return a.charAt(0) - b.charAt(0);
    });
    
    const transmissions = Array.from(
      new Set(data.map((row) => row["Transmission Type"]))
    );

    const traces = transmissions.map((transmission) => {
      return {
        x,
        y: x.map((quantile) => groupedData[quantile][transmission] || 0),
        name: transmission,
        type: "bar",
        text: x.map((quantile) => 
          groupedData[quantile][transmission] 
            ? groupedData[quantile][transmission].toString() 
            : "0"
        ),
        textposition: "auto",
      };
    });

    return traces;
  };

  const getSunburstData = () => {
    const groupedData = {};
    const allStyles = Array.from(new Set(data.map((row) => row["Vehicle Style"])));
  
    // Initialiser les transmissions avec tous les styles
    const allTransmissions = Array.from(new Set(data.map((row) => row["Transmission Type"])));
    allTransmissions.forEach((transmission) => {
      groupedData[transmission] = {};
      allStyles.forEach((style) => {
        groupedData[transmission][style] = 0;
      });
    });
  
    // Compter les styles réels
    data.forEach((row) => {
      const transmission = row["Transmission Type"];
      const style = row["Vehicle Style"];
      groupedData[transmission][style]++;
    });
  
    const labels = [];
    const parents = [];
    const values = [];
    const colors = [];
    const ids = [];
  
    const transmissionColors = {
      AUTOMATIC: "#1f77b4",
      MANUAL: "#ff7f0e",
      DIRECT_DRIVE: "#2ca02c",
      AUTOMATED_MANUAL: "#d62728",
      UNKNOWN: "#9467bd",
    };
  
    Object.entries(groupedData).forEach(([transmission, styles]) => {
      const transmissionTotal = Object.values(styles).reduce((a, b) => a + b, 0);
  
      labels.push(transmission);
      parents.push("");
      values.push(transmissionTotal);
      ids.push(transmission);
      colors.push(transmissionColors[transmission] || "#8c564b");
  
      Object.entries(styles)
        .sort(([, a], [, b]) => b - a) // tri décroissant des styles par nombre
        .forEach(([style, count]) => {
          labels.push(style);
          parents.push(transmission);
          values.push(count);
          ids.push(`${transmission}/${style}`);
          colors.push(
            transmissionColors[transmission]
              ? transmissionColors[transmission] + "aa"
              : "#8c564baa"
          );
        });
    });
  
    return { labels, parents, values, colors, ids };
  };
  
    
  // Obtenir les données formatées
  const barChartData = getBarChartData();
  const sunburstData = getSunburstData();

  return (
    <div className="space-y-6">      {/* Tabs de navigation */}
      <div className="flex border-b gap-2 mb-4">
        <Button
          variant={activeTab === "quantile" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setActiveTab("quantile")}
          sx={{ textTransform: 'none' }}
        >
          Répartition par quantile de prix
        </Button>
        <Button
          variant={activeTab === "sunburst" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setActiveTab("sunburst")}
          sx={{ textTransform: 'none' }}
        >
          Répartition par style de véhicule
        </Button>
      </div>

      {/* Graphiques */}
      {activeTab === "quantile" && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Répartition des types de transmission par quantile de prix
          </h2>
          <Plot
            data={barChartData}
            layout={{
              barmode: "stack",
              xaxis: { 
                title: "Quantiles de prix",
                tickangle: -30
              },
              yaxis: { 
                title: "Nombre de véhicules" 
              },
              margin: { t: 50, b: 100 },
              legend: {
                title: { text: "Type de transmission" },
                orientation: "v", // vertical
                x: 1.05,           // en dehors du graphique, à droite
                y: 1,              // aligné en haut
              },              
              height: 500
            }}
            config={{ responsive: true }}
          />
          <div className="mt-6 text-gray-700">
            <p className="mb-3">
              <strong>Analyse:</strong> Ce graphique présente la distribution des types de transmission (automatique, manuelle, etc.) 
              au sein de cinq quantiles de prix. Une tendance nette se dégage:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Les <strong>véhicules à transmission automatique</strong> dominent largement dans les <strong>quantiles intermédiaires à élevés</strong>, 
                représentant souvent plus de 80% des véhicules de ces catégories.</li>
              <li>Les <strong>transmissions manuelles</strong> sont <strong>majoritairement présentes dans les véhicules les moins chers</strong> (1er quantile), 
                puis décroissent fortement à mesure que le prix augmente.</li>
              <li>Les <strong>transmissions automatisées manuelles</strong> apparaissent de manière marginale, 
                surtout dans les véhicules haut de gamme.</li>
            </ul>
          </div>
        </div>
      )}

{activeTab === "sunburst" && (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">
      Répartition des styles de véhicule selon le type de transmission
    </h2>
    <Plot
  data={[
    {
      type: "sunburst",
      labels: sunburstData.labels,
      parents: sunburstData.parents,
      values: sunburstData.values,
      ids: sunburstData.ids,
      branchvalues: "total",
      textinfo: "label+percent entry+value",
      hoverinfo: "label+value+percent parent+percent entry",
      insidetextorientation: "radial",
      marker: { colors: sunburstData.colors },
      maxdepth: 2,
      leaf: { opacity: 1 },
    },
  ]}
  layout={{
    margin: { t: 40, l: 40, r: 40, b: 40 },
    width: 900,
    height: 800,
    sunburstcolorway: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
    extendsunburstcolorway: true
  }}
  config={{ responsive: true }}
/>

    <div className="mt-6 text-gray-700">
      <h4 className="text-lg font-semibold mb-2">
        Répartition des styles de véhicule selon le type de transmission
      </h4>
      <p className="mb-3">
        Le second graphique, un diagramme sunburst, permet de visualiser la répartition des <strong>styles de véhicule</strong> en fonction du <strong>type de transmission</strong> :
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Les <strong>transmissions automatiques</strong> concernent principalement des véhicules de type <strong>SUV</strong> et <strong>berlines (Sedan)</strong>, c’est-à-dire des modèles généralement plus spacieux, orientés vers le confort et souvent utilisés dans des contextes urbains ou familiaux.</li>
        <li>Les <strong>transmissions manuelles</strong> sont davantage associées à des <strong>coupés</strong>, <strong>hatchbacks</strong>, ou encore des <strong>pickups</strong>. Ces styles sont souvent liés à des usages plus économiques, sportifs ou professionnels.</li>
        <li>Les transmissions <strong>automatisées et directes</strong> (<code>DIRECT_DRIVE</code>) sont très minoritaires, ce qui les rend peu représentatives pour l’analyse.</li>
      </ul>

      <h4 className="text-lg font-semibold mt-6 mb-2">
        Corrélation entre les deux graphiques
      </h4>
      <p className="mb-3">
        Les deux visualisations convergent vers une <strong>relation structurelle entre le prix, le type de transmission et le style du véhicule</strong> :
      </p>
      <table className="table-auto border-collapse border border-gray-400 text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-4 py-2">Type de transmission</th>
            <th className="border border-gray-400 px-4 py-2">Styles dominants</th>
            <th className="border border-gray-400 px-4 py-2">Gamme de prix associée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 px-4 py-2">Automatique</td>
            <td className="border border-gray-400 px-4 py-2">SUV, Sedan</td>
            <td className="border border-gray-400 px-4 py-2">Moyenne à élevée</td>
          </tr>
          <tr>
            <td className="border border-gray-400 px-4 py-2">Manuelle</td>
            <td className="border border-gray-400 px-4 py-2">Coupé, Hatchback, Pickup</td>
            <td className="border border-gray-400 px-4 py-2">Basse à moyenne</td>
          </tr>
          <tr>
            <td className="border border-gray-400 px-4 py-2">Semi-automatique</td>
            <td className="border border-gray-400 px-4 py-2">Divers véhicules haut de gamme</td>
            <td className="border border-gray-400 px-4 py-2">Élevée</td>
          </tr>
        </tbody>
      </table>

      <h4 className="text-lg font-semibold mb-2">En tant que vendeur :</h4>
      <p className="mb-3">
        Dans une optique de vente ou de recommandation :
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Pour un <strong>client recherchant le confort ou un usage familial</strong>, les véhicules <strong>automatiques de type SUV ou berline</strong> seront les plus adaptés.</li>
        <li>Pour un <strong>client au budget restreint</strong>, un <strong>véhicule manuel</strong> de type <strong>compact</strong> ou <strong>coupé</strong> sera plus accessible.</li>
        <li>Pour un <strong>profil professionnel ou rural</strong>, le <strong>pickup manuel</strong> reste un bon compromis entre robustesse et maîtrise du budget.</li>
      </ul>

      <p className="mt-4">
        On peut <strong>établir un profil type des acheteurs selon leur budget, leur usage et leurs attentes en matière de confort ou performance.</strong>
      </p>
    </div>

  </div>
)}

    </div>
  );
};

export default Graph2;
