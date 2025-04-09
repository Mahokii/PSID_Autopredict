import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import datacsv from "../data/voiture_clean.csv";

const Graph4 = () => {
  const [trace1, setTrace1] = useState([]);
  const [trace2, setTrace2] = useState([]);
  const [trace3, setTrace3] = useState([]);
  const [top5, setTop5] = useState([]);

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
        const clean2 = raw.filter(
          row => row.Make && row.Model && row["Market Category"] && row["Market Category"] !== "N/A"
        );        
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
        const clean3 = raw.filter(row =>
          row.Make &&
          row.Model &&
          row["Market Category"] &&
          row["Market Category"] !== "N/A" &&
          row.Popularity
        );        
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
         <div className="mt-6 space-y-4 text-sm text-gray-700">
  <p>
    Ce graphique met en évidence les marques proposant le plus grand nombre de modèles distincts dans la base de données AutoPredict.
    L’objectif est d’identifier les constructeurs ayant une offre étendue, ce qui peut influencer la recommandation de véhicules pour les clients.
  </p>

  <div>
    <strong className="block mb-1">Observations principales :</strong>
    <ul className="list-disc list-inside space-y-1">
      <li><strong>Chevrolet</strong>, <strong>Ford</strong> et <strong>Lexus</strong> dominent ce classement avec respectivement 63, 51 et 46 modèles distincts.</li>
      <li>On retrouve ensuite des marques comme <strong>Mercedes-Benz</strong>, <strong>BMW</strong>, <strong>Toyota</strong> ou <strong>Infiniti</strong>, avec 38 à 40 modèles.</li>
      <li>En bas du classement, <strong>Volvo</strong>, <strong>Cadillac</strong> ou <strong>GMC</strong> comptent autour de 26 à 31 modèles.</li>
    </ul>
  </div>

  <div>
    <strong className="block mb-1">Interprétations :</strong>
    <ul className="list-disc list-inside space-y-1">
      <li>Les marques en haut du classement adoptent généralement une stratégie généraliste : elles visent plusieurs types de clients avec des gammes variées (citadine, SUV, berline, utilitaire...).</li>
      <li>Les marques avec moins de modèles ont souvent un positionnement plus ciblé ou haut de gamme.</li>
      <li>Certaines marques comme <strong>Lexus</strong>, bien qu’étant premium, proposent tout de même une gamme étendue pour couvrir plusieurs segments premium.</li>
    </ul>
  </div>

  <div>
    <strong className="block mb-1">Implications pour AutoPredict :</strong>
    <ul className="list-disc list-inside space-y-1">
      <li>Une marque avec un large choix de modèles est <strong>plus susceptible d’être recommandée</strong>, car elle peut répondre à différents critères utilisateurs (prix, puissance, style...).</li>
      <li>À l'inverse, une marque avec peu de modèles peut tout de même être mise en avant pour des besoins spécifiques (ex : SUV de luxe, sécurité maximale, etc.).</li>
    </ul>
  </div>
</div>
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
<div className="mt-6 space-y-4 text-sm text-gray-700">
  <p>
    Ce graphique illustre comment les 5 marques ayant le plus grand nombre de modèles répartissent leur offre
    entre les différents segments de marché (ou "Market Categories").
    L’objectif est d’évaluer si ces marques ont une stratégie diversifiée et homogène, ou si elles se concentrent
    sur des segments spécifiques, révélant une spécialisation.
  </p>

  <div>
    <strong className="block mb-1">Observations principales :</strong>
    <ul className="list-disc list-inside space-y-1">
      <li><strong>BMW</strong> et <strong>Mercedes-Benz</strong> se distinguent par une très forte concentration de modèles dans le segment <strong>"Luxury"</strong> :
        <ul className="list-disc list-inside ml-5">
          <li><strong>BMW</strong> : 39 modèles "Luxury"</li>
          <li><strong>Mercedes-Benz</strong> : 40 modèles "Luxury"</li>
        </ul>
      </li>
      <li><strong>Mercedes-Benz</strong> est la marque la plus segmentée avec des modèles dans presque toutes les catégories : Crossover, Performance, Factory Tuner, etc.</li>
      <li><strong>Chevrolet</strong> et <strong>Ford</strong> présentent une répartition plus équilibrée entre les segments, bien que moins dense en nombre total de modèles.</li>
      <li><strong>Lexus</strong> affiche une structure proche de Mercedes-Benz mais dans une échelle plus réduite : fort sur le "Luxury", un peu de Performance, Hybrid, Crossover.</li>
    </ul>
  </div>

  <div>
    <strong className="block mb-1">Points clés à retenir :</strong>
    <ul className="list-disc list-inside space-y-1">
      <li><strong>BMW</strong> et <strong>Mercedes-Benz</strong> concentrent l’essentiel de leur offre sur le segment <strong>"Luxury"</strong> (respectivement 39 et 40 modèles), en cohérence avec leur positionnement haut de gamme.</li>
      <li><strong>Mercedes-Benz</strong> se démarque en couvrant presque <strong>tous les segments existants</strong>, révélant une <strong>stratégie à la fois premium et étendue</strong>.</li>
      <li><strong>Ford</strong> et <strong>Chevrolet</strong> adoptent une stratégie plus <strong>généraliste</strong>, avec une répartition équilibrée sur plusieurs segments (Crossover, Performance, Hybrid...).</li>
      <li><strong>Lexus</strong> suit une structure proche de <strong>Mercedes-Benz</strong>, mais avec un volume plus modeste.</li>
    </ul>
  </div>

  <div>
    <strong className="block mb-1">Ce que cela implique pour AutoPredict :</strong>
    <ul className="list-disc list-inside space-y-1">
      <li>Les marques aux offres <strong>diversifiées</strong> peuvent répondre à <strong>plusieurs profils clients</strong> : elles sont donc <strong>pertinentes pour les recommandations personnalisées</strong>.</li>
      <li>À l’inverse, les marques très <strong>spécialisées</strong> conviendront mieux à des utilisateurs avec des attentes ciblées.</li>
      <li>Comprendre cette répartition permet d’<strong>affiner notre moteur de suggestion</strong>, en croisant ces informations avec d’autres critères (prix, performance, consommation...).</li>
    </ul>
  </div>
</div>

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

<div className="mt-6 space-y-4 text-sm text-gray-700">
  <p>
    Ce graphique en boîte illustre la relation entre la diversité des segments couverts par une marque (axe X)
    et sa popularité moyenne (axe Y). Chaque boîte représente la distribution de la popularité des marques ayant
    un même nombre de segments distincts dans leur catalogue.
  </p>

  <div>
    <strong className="block mb-1">Points clés à retenir :</strong>
    <ul className="list-disc list-inside space-y-1">
      <li>Les marques avec une faible diversité (1 à 3 segments) ont généralement une popularité faible à modérée, avec peu d’écart entre elles.</li>
      <li>À partir de 6 segments, on observe une montée en popularité moyenne, mais surtout une variabilité plus importante.</li>
      <li>Les marques couvrant 8 à 9 segments présentent les niveaux de popularité les plus élevés, ainsi qu’une dispersion marquée, suggérant des positions très différenciées sur le marché.</li>
    </ul>
  </div>

  <div>
    <strong className="block mb-1">Interprétation :</strong>
    <ul className="list-disc list-inside space-y-1">
      <li>Une diversité élevée en segments semble être un facteur associé à une plus grande visibilité ou attractivité des marques.</li>
      <li>Cela pourrait refléter leur capacité à répondre à une demande plus large, ce qui les rend plus populaires sur le marché.</li>
      <li>Toutefois, la grande dispersion sur certains niveaux de diversité indique que la popularité ne dépend pas uniquement de la variété, mais aussi d’autres leviers comme l’image de marque, la stratégie marketing ou les prix.</li>
    </ul>
  </div>

  <div>
    <strong className="block mb-1">Conclusion globale de l’analyse :</strong>
    <ul className="list-disc list-inside ml-4 space-y-1">
      <li>Quelles marques proposent le plus de modèles (<strong>Chevrolet</strong>, <strong>Ford</strong>, <strong>Lexus</strong>)</li>
      <li>Comment ces modèles sont répartis entre les segments (<strong>BMW</strong>, <strong>Mercedes-Benz</strong>, <strong>Lexus</strong> très concentrées sur le luxe, <strong>Ford</strong> et <strong>Chevrolet</strong> plus généralistes)</li>
      <li>Et comment la diversité de l’offre influence la popularité</li>
    </ul>
  </div>

  <p>
    Ces résultats montrent que les marques les plus diversifiées sont généralement mieux positionnées pour toucher une audience large, et gagnent en popularité.
    Cependant, certaines marques plus spécialisées, comme <strong>Lexus</strong> ou <strong>Mercedes-Benz</strong>, conservent une forte notoriété grâce à leur positionnement haut de gamme.
  </p>

  <p>
    Cela confirme l’intérêt d’intégrer la diversité de l’offre comme critère dans notre moteur de recommandation AutoPredict,
    afin de mieux cibler les profils utilisateurs et proposer des véhicules réellement adaptés à leurs attentes.
  </p>
</div>

      </div>
    </div>
  );
};

export default Graph4;
