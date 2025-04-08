import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
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
  
    // Initialize groupedData with all transmission types and styles
    const allTransmissions = Array.from(new Set(data.map((row) => row["Transmission Type"])));
    allTransmissions.forEach((transmission) => {
      groupedData[transmission] = {};
      allStyles.forEach((style) => {
        groupedData[transmission][style] = 0;
      });
    });
  
    // Populate groupedData with actual counts
    data.forEach((row) => {
      const transmission = row["Transmission Type"];
      const style = row["Vehicle Style"];
      groupedData[transmission][style]++;
    });
  
    const labels = [];
    const parents = [];
    const values = [];
    const colors = [];
  
    // Define colors for each transmission type
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
      colors.push(transmissionColors[transmission] || "#8c564b");
  
      Object.entries(styles).forEach(([style, count]) => {
        labels.push(style);
        parents.push(transmission);
        values.push(count);
        colors.push(transmissionColors[transmission] ? transmissionColors[transmission] + "88" : "#8c564b88");
      });
    });
  
    return { labels, parents, values, colors };
  };

  // Obtenir les données formatées
  const barChartData = getBarChartData();
  const sunburstData = getSunburstData();

  return (
    <div className="space-y-6">
      {/* Tabs de navigation */}
      <div className="flex border-b">
        <button
          className={`py-2 px-4 ${activeTab === "quantile" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("quantile")}
        >
          Répartition par quantile de prix
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "sunburst" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("sunburst")}
        >
          Répartition par style de véhicule
        </button>
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
                orientation: "h",
                y: -0.2
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
                branchvalues: "total",
                textinfo: "label+percent entry",
                insidetextorientation: "radial",
                marker: { colors: sunburstData.colors }
              },
            ]}
            layout={{
              margin: { t: 0, l: 0, r: 0, b: 0 },
              width: 700,
              height: 700,
            }}
            config={{ responsive: true }}
          />
          <div className="mt-6 text-gray-700">
            <p className="mb-3">
              <strong>Analyse:</strong> Ce diagramme sunburst permet de visualiser la répartition des styles de véhicule 
              en fonction du type de transmission:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Les <strong>transmissions automatiques</strong> concernent principalement des véhicules de type <strong>SUV</strong> et <strong>berlines (Sedan)</strong>, 
                c'est-à-dire des modèles généralement plus spacieux, orientés vers le confort et souvent utilisés dans des contextes urbains ou familiaux.</li>
              <li>Les <strong>transmissions manuelles</strong> sont davantage associées à des <strong>coupés</strong>, <strong>hatchbacks</strong>, ou encore des <strong>pickups</strong>. 
                Ces styles sont souvent liés à des usages plus économiques, sportifs ou professionnels.</li>
              <li>Les transmissions automatisées et directes (DIRECT_DRIVE) sont très minoritaires, ce qui les rend peu représentatives pour l'analyse.</li>
            </ul>
            <p className="mt-4">
              Cette visualisation révèle une <strong>relation structurelle entre le type de transmission et le style du véhicule</strong>, 
              offrant des indications précieuses pour les recommandations d'achat selon les préférences des utilisateurs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Graph2;
