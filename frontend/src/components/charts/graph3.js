import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
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
                font: { size: 16, color: '#333' }
              },
              categoryorder: "array",
              categoryarray: ["Très faible", "Faible", "Moyenne", "Élevée", "Très élevée"]
            },
            yaxis: {
              title: { 
                text: "Consommation moyenne (MPG)",
                font: { size: 16, color: '#333' }
              }
            },
            legend: { title: { text: "Nb Cylindres" } },
            margin: { t: 50, b: 100 }
          }}
          config={{ responsive: true }}
          style={{ width: "100%" }}
        />
        <div className="mt-6 text-gray-700 leading-relaxed space-y-4">
          <h3 className="text-lg font-semibold">Analyse croisée de la consommation moyenne selon la puissance moteur et le nombre de cylindres</h3>
          <p>
            Ce graphique interactif illustre la consommation moyenne de carburant (exprimée en miles par gallon – MPG) 
            en fonction de deux caractéristiques mécaniques clés : la puissance du moteur et le nombre de cylindres. 
            L’objectif est de mettre en évidence les liens entre performance moteur et rendement énergétique.
          </p>

          <h4 className="text-md font-semibold">Distribution générale : plus de puissance, moins de sobriété</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>On observe une <strong>diminution progressive de la consommation moyenne (MPG)</strong> à mesure que la puissance augmente.</li>
            <li>Les véhicules plus puissants sont souvent <strong>plus lourds, rapides, orientés performance</strong>, et donc plus gourmands.</li>
            <li>Une <strong>sollicitation accrue du moteur</strong> entraîne des pertes énergétiques.</li>
          </ul>

          <h4 className="text-md font-semibold">L'influence du nombre de cylindres</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>Les <strong>3 et 4 cylindres</strong> sont généralement les plus sobres.</li>
            <li>Les moteurs à <strong>6 cylindres ou plus</strong> consomment davantage, avec une montée constante.</li>
            <li>Les <strong>10, 12 ou 16 cylindres</strong> affichent une consommation extrême, typique des véhicules de luxe ou sportifs.</li>
          </ul>

          <h4 className="text-md font-semibold">Hypothèses explicatives</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Technologie</strong> : turbo, hybridation, désactivation des cylindres permettent à certains moteurs d’être performants et sobres.</li>
            <li><strong>Catégories de véhicules</strong> : SUV, sportives ou utilitaires sont naturellement plus énergivores.</li>
            <li><strong>Pression réglementaire</strong> : les moteurs downsizés deviennent fréquents pour combiner puissance et économie.</li>
          </ul>

          <h4 className="text-md font-semibold">Conclusion</h4>
          <p>
            La consommation moyenne est <strong>étroitement liée à la puissance et au nombre de cylindres</strong>. 
            Si la règle générale veut qu’un moteur plus puissant consomme plus, les avancées technologiques 
            et les choix de catégorie nuancent cette relation. 
            Cette analyse aide à <strong>mieux positionner les modèles selon les préférences client</strong> entre performance et sobriété.
          </p>
          <p className="mt-2">
            Il serait pertinent de compléter cette étude par une <strong>analyse comparative des prix</strong> 
            selon la puissance moteur, pour identifier les modèles les plus rentables.
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
                font: { size: 16, color: '#333' }
              },
              categoryorder: "array",
              categoryarray: ["Très faible", "Faible", "Moyenne", "Élevée", "Très élevée"]
            },
            yaxis: {
              title: {
                text: "Prix moyen ($)",
                font: { size: 16, color: '#333' }
              },
              tickprefix: "$",
            },
            legend: {
              title: { text: "Catégorie de véhicule" },
              orientation: "v",    // affichage vertical
              x: 1.05,              // position à droite du graphique
              y: 1,
              xanchor: "left"
            },
            margin: { t: 60, b: 100, r: 200 } // espace à droite pour la légende
          }}
          
          config={{ responsive: true }}
          style={{ width: "100%" }}
        />
        <div className="mt-6 text-gray-700 leading-relaxed space-y-4">
          <h3 className="text-lg font-semibold">Analyse croisée : prix moyen des véhicules par catégorie de voitures et puissance moteur</h3>

          <p>
            Le graphique représente le <strong>prix moyen (MSRP)</strong> des véhicules selon leur <strong>catégorie de voitures</strong> et leur <strong>type de puissance moteur</strong>,
            tout en indiquant le <strong>nombre de véhicules</strong> disponibles dans chaque groupe. Cette visualisation vise à évaluer dans quelle mesure il est possible
            pour un client d’opter pour un véhicule <strong>puissant</strong> tout en maîtrisant son <strong>budget</strong>, malgré une consommation potentiellement plus élevée.
          </p>

          <h4 className="text-md font-semibold">Plus de puissance veut dire plus cher ?</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>La catégorie <strong>"Luxury"</strong> s’étend sur toutes les tranches de puissance, avec des prix relativement <strong>stables</strong> autour de 60 000 $ à 90 000 $.</li>
            <li>Les catégories <strong>"High-Performance"</strong> et <strong>"Exotic"</strong> affichent des <strong>prix très élevés</strong> dès les tranches "Élevée" et "Très élevée", culminant jusqu’à 250 000 $ pour "Exotic".</li>
            <li>Certaines catégories comme <strong>"Crossover"</strong> ou <strong>"Performance"</strong> présentent une <strong>croissance plus modérée</strong> du prix malgré l’augmentation de la puissance.</li>
          </ul>

          <h4 className="text-md font-semibold">Des compromis accessibles</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>Les véhicules <strong>"Performance"</strong>, présents dans les tranches "Élevée" et "Très élevée", affichent un <strong>prix moyen de 40 000 à 60 000 $</strong>, bien en dessous des "Luxury" ou "Exotic".</li>
            <li>La catégorie <strong>"Crossover"</strong> reste présente dans toutes les tranches de puissance avec un <strong>prix relativement stable (~40 000 $)</strong>.</li>
          </ul>

          <h4 className="text-md font-semibold">Hypothèse de rentabilité pour faire une concession sur la consommation</h4>
          <p>
            Il peut être <strong>pertinent</strong> de faire une <strong>concession sur la consommation</strong> si le <strong>prix d’acquisition reste abordable</strong> :
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Les véhicules <strong>puissants mais abordables</strong> comme certains "Performance" ou "Flex Fuel" peuvent être <strong>rentables à long terme</strong>, surtout en usage modéré.</li>
            <li>À l’inverse, les véhicules très puissants des catégories <strong>"Exotic"</strong> ou <strong>"High-Performance"</strong> exigent un <strong>investissement initial très élevé</strong>, réduisant leur rentabilité.</li>
          </ul>

          <h4 className="text-md font-semibold">Équilibre entre performance et budget</h4>
          <p>
            Ce graphique met en évidence un <strong>équilibre atteignable</strong> entre puissance moteur et prix d’achat dans certaines catégories :
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>"Performance"</strong>, <strong>"Crossover"</strong> ou certains véhicules <strong>"Luxury"</strong> intermédiaires offrent des compromis intéressants.</li>
            <li>Ils permettent d’accéder à des véhicules <strong>puissants mais non excessifs en prix</strong>, idéaux pour un public à la recherche d’un bon rapport performance/budget.</li>
          </ul>

          <h4 className="text-md font-semibold">Conclusion</h4>
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
            Il est possible pour un client d’acheter une <strong>voiture puissante</strong> en acceptant une <strong>consommation plus élevée</strong>, à condition de bien choisir la <strong>catégorie de véhicule</strong>.
            L’analyse montre que certaines <strong>catégories de marché offrent une puissance élevée à un prix modéré</strong>, ouvrant la voie à une rentabilité acceptable malgré la consommation.
          </blockquote>

          <p className="mt-2">
            Ainsi, l’acheteur rationnel dispose d’une <strong>marge de manœuvre</strong> pour arbitrer entre puissance, consommation et coût,
            selon ses priorités (performance, budget, confort ou image).
          </p>
        </div>

      </div>
    </div>
  );
};

export default Graph3;
