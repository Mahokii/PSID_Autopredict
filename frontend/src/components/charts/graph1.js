import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import datacsv from "../data/voiture_clean.csv";
import { useMemo } from "react";
import Button from "@mui/material/Button";



const Graph1 = () => {
  const [data, setData] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetch(datacsv)
      .then(res => res.text())
      .then(text => {
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const clean = parsed.data.filter(row => row.MSRP && row.Year && +row.MSRP > 1000 && +row.Year > 1990);
        setData(clean);
      });
  }, []);

  // Calculer la dépréciation moyenne par année
  const getAvgMsrpByYear = () => {
    const map = {};
    data.forEach(row => {
      const year = +row.Year;
      const msrp = +row.MSRP;
      if (!map[year]) map[year] = [];
      map[year].push(msrp);
    });
    return Object.entries(map).map(([year, values]) => ({
      year: +year,
      avgMsrp: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length
    })).sort((a, b) => a.year - b.year);
  };

  // Calculer la dépréciation par style de véhicule
  const getDepreciationByStyle = () => {
    const styles = {};
    data.forEach(row => {
      const style = row["Vehicle Style"] || "Unknown";
      const year = +row.Year;
      const msrp = +row.MSRP;
      
      if (!styles[style]) styles[style] = {};
      if (!styles[style][year]) styles[style][year] = [];
      styles[style][year].push(msrp);
    });

    return Object.entries(styles).map(([style, yearData]) => {
      const years = Object.keys(yearData).map(Number).sort();
      return {
        name: style,
        x: years,
        y: years.map(y => {
          const prices = yearData[y];
          return prices.reduce((a, b) => a + b, 0) / prices.length;
        }),
        mode: "lines+markers",
        type: "scatter",
        marker: { size: 6 },
        visible: selectedStyles.length === 0 || selectedStyles.includes(style) ? true : "legendonly"
      };
    });
  };

  // Calculer la dépréciation par catégorie de marché
  const getDepreciationByCategory = () => {
    const categories = {};
    data.forEach(row => {
      // Diviser les catégories multiples (ex: "Luxury,Performance")
      const cats = (row["Market Category"] || "Uncategorized").split(",");
      const year = +row.Year;
      const msrp = +row.MSRP;
      
      cats.forEach(category => {
        category = category.trim();
        if (!categories[category]) categories[category] = {};
        if (!categories[category][year]) categories[category][year] = [];
        categories[category][year].push(msrp);
      });
    });

    return Object.entries(categories).map(([category, yearData]) => {
      const years = Object.keys(yearData).map(Number).sort();
      return {
        name: category,
        x: years,
        y: years.map(y => {
          const prices = yearData[y];
          return prices.reduce((a, b) => a + b, 0) / prices.length;
        }),
        mode: "lines+markers",
        type: "scatter",
        marker: { size: 6 },
        visible: selectedCategories.length === 0 || selectedCategories.includes(category) ? true : "legendonly"
      };
    });
  };

  // Obtenir les marques représentatives par segment
  const getTopBrandsByCategory = () => {
    const segmentMap = {};
    
    // Regrouper par segment et marque
    data.forEach(row => {
      const categories = (row["Market Category"] || "Other").split(",");
      const make = row["Make"];
      const msrp = +row.MSRP;
      
      categories.forEach(cat => {
        const category = cat.trim();
        if (!segmentMap[category]) segmentMap[category] = {};
        if (!segmentMap[category][make]) segmentMap[category][make] = [];
        segmentMap[category][make].push(msrp);
      });
    });

    // Pour chaque segment, calculer la marque ayant le plus de véhicules et le prix moyen
    const result = [];
    Object.entries(segmentMap).forEach(([segment, brandMap]) => {
      // Calculer le prix moyen pour chaque marque dans ce segment
      const brandStats = Object.entries(brandMap).map(([brand, prices]) => ({
        brand,
        count: prices.length,
        avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length
      }));

      // Trier par nombre de véhicules (popularité)
      const sortedBrands = brandStats.sort((a, b) => b.count - a.count);
      
      // Prendre les 3 marques les plus représentées
      sortedBrands.slice(0, 3).forEach(item => {
        result.push({
          segment,
          brand: item.brand,
          count: item.count,
          avgPrice: item.avgPrice
        });
      });
    });

    return result;
  };

  // Préparation des données
  const yearData = getAvgMsrpByYear();
  const styleTraces = getDepreciationByStyle();
  const categoryTraces = getDepreciationByCategory();
  const topBrands = getTopBrandsByCategory();

  // Obtenir la liste de tous les styles et catégories pour les filtres
  const allStyles = [...new Set(data.map(row => row["Vehicle Style"]))].filter(Boolean);
  const allCategories = [...new Set(
    data.flatMap(row => (row["Market Category"] || "").split(",").map(cat => cat.trim()))
  )].filter(Boolean);

  // Fonction pour gérer la sélection/déselection des styles
  const handleStyleChange = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  // Fonction pour gérer la sélection/déselection des catégories
  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Ajouter cet état et cette fonction de filtrage
    const [selectedSegment, setSelectedSegment] = useState("all");

    // Définir les marques filtrées selon le segment sélectionné
    const filteredBrands = useMemo(() => {
    if (selectedSegment === "all") {
        return topBrands;
    } else {
        return topBrands.filter(brand => brand.segment === selectedSegment);
    }
    }, [topBrands, selectedSegment]);


  // Nouvelle fonction pour obtenir des statistiques par marque avec leur style de véhicule majoritaire
const getBrandStats = () => {
  const brandData = {};
  
  // Regrouper les véhicules par marque
  data.forEach(row => {
    const make = row["Make"];
    const msrp = +row.MSRP;
    const style = row["Vehicle Style"] || "Unknown"; // Utiliser Vehicle Style au lieu de Market Category
    
    if (!brandData[make]) {
      brandData[make] = {
        totalVehicles: 0,
        totalPrice: 0,
        styles: {}
      };
    }
    
    brandData[make].totalVehicles += 1;
    brandData[make].totalPrice += msrp;
    
    // Compter les occurrences de chaque style pour cette marque
    if (!brandData[make].styles[style]) {
      brandData[make].styles[style] = {
        count: 0,
        totalPrice: 0
      };
    }
    brandData[make].styles[style].count += 1;
    brandData[make].styles[style].totalPrice += msrp;
  });
  
  // Calculer les statistiques pour chaque marque
  return Object.entries(brandData)
    .filter(([_, data]) => data.totalVehicles >= 5) // Filtrer pour avoir au moins 5 véhicules
    .map(([make, data]) => {
      // Trouver le style majoritaire
      const mainStyle = Object.entries(data.styles)
        .sort((a, b) => b[1].count - a[1].count)[0];
      
      return {
        brand: make,
        count: data.totalVehicles,
        avgPrice: data.totalPrice / data.totalVehicles,
        mainStyle: mainStyle[0],
        mainStyleCount: mainStyle[1].count,
        mainStyleAvgPrice: mainStyle[1].totalPrice / mainStyle[1].count
      };
    })
    .sort((a, b) => b.count - a.count) // Trier par popularité
    .slice(0, 20); // Limiter aux 20 marques les plus populaires
};

  return (
    <div className="space-y-12 p-4">      
      {/* Q4 - Dépréciation par ancienneté */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Dépréciation par année des véhicules</h2>
        <Plot
          data={[
            {
              x: yearData.map(d => d.year),
              y: yearData.map(d => d.avgMsrp),
              type: "scatter",
              mode: "lines+markers",
              name: "Prix moyen",
              marker: { size: 8 },
              hovertemplate: "Année: %{x}<br>Prix moyen: $%{y:.2f}<br>Nb véhicules: %{text}<extra></extra>",
              text: yearData.map(d => d.count)
            },
          ]}
          layout={{
            autosize: true,
            height: 500,
            title: "",
            xaxis: { 
                title: { 
                  text: "Année du véhicule",
                  font: {
                    size: 16,
                    color: '#333'
                  }
                },
                tickangle: -45,
                automargin: true
              },
            yaxis: { 
                title: {
                  text: "Prix moyen (USD)",
                  font: {
                    size: 16,
                    color: '#333'
                  }
                },
                tickformat: "$,.0f" 
              },
            hovermode: "closest",
            margin: { t: 50, b: 100 }
          }}
          config={{ responsive: true }}
          style={{ width: "100%" }}
        />
<div className="mt-4 text-gray-700 leading-relaxed space-y-4">
  <p>
    Ce graphique nous livre une vue d’ensemble sur le marché de l’automobile (neuf + occasion) tel qu’il apparaît dans notre jeu de données.
  </p>
  <p>
    Les véhicules les plus anciens (1990–1999) se vendent en moyenne <strong>sous la barre des 10 000 $</strong>, illustrant une dépréciation naturelle avec le temps.
  </p>
  <p>
    Un saut notable apparaît autour de l’an 2000, où le prix moyen grimpe rapidement, probablement dû à l’intégration de modèles plus récents et mieux équipés.
  </p>
  <p>
    Entre 2005 et 2015, le prix moyen oscille entre <strong>45 000 $</strong> et <strong>60 000 $</strong>, ce qui reflète une part croissante de véhicules premium ou haut de gamme dans le dataset.
  </p>
  <p>
    On observe que les véhicules de plus de <strong>15 ans</strong> subissent une forte décote, souvent sous les <strong>15 000 $</strong>, ce qui remet en question leur rentabilité à long terme.
  </p>
  <p className="italic">
    Après avoir saisi cette tendance globale, une question s’impose : <br />
    <strong>Est-ce que tous les véhicules se déprécient de la même façon ?</strong>
  </p>
  <p>
    Pour y répondre, examinons maintenant un facteur lié à l’aspect visuel et fonctionnel : <strong>le style de carrosserie</strong>.
  </p>
</div>

      </div>

      {/* Q5 - Comparaison par Style de véhicule */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Dépréciation par style de véhicule</h2>
        <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setSelectedStyles([])}
        >
          Tous les styles
        </Button>
          {allStyles.slice(0, 10).map(style => (
            <Button
            key={style}
            variant={selectedStyles.includes(style) ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleStyleChange(style)}
            sx={{ textTransform: 'none' }}
          >
            {style}
          </Button>
          
          ))}
        </div>
        <Plot
          data={styleTraces}
          layout={{
            autosize: true,
            height: 500,
            title: "",
            xaxis: { 
                title: { 
                  text: "Année du véhicule",
                  font: {
                    size: 16,
                    color: '#333'
                  }
                },
                tickangle: -45,
                automargin: true
              },
            yaxis: { 
              title: 
                { 
                    text: "Prix moyen (USD)",
                    font: {
                        size: 16,
                        color: '#333'
                    }
                },
              tickformat: "$,.0f",
            },
            hovermode: "closest",
            showlegend: true,
            legend: { orientation: "h", y: -0.2 },
            margin: { t: 50, b: 150 }
          }}
          config={{ responsive: true }}
          style={{ width: "100%" }}
        />
<div className="mt-4 text-gray-700 leading-relaxed space-y-4">
  <p>
    Chaque courbe représente un style de carrosserie, et la hauteur indique le <strong>prix moyen</strong> par année.
  </p>
  <p>
    Les <strong>SUV 4 portes</strong>, <strong>Convertibles</strong> et <strong>Crew Cab Pickups</strong> conservent des prix élevés, même plusieurs années après leur sortie, témoignant d’une <strong>bonne rétention de valeur</strong>.
  </p>
  <p>
    À l’opposé, les <strong>Cargo Vans</strong>, <strong>2dr Hatchbacks</strong> ou <strong>Sedans</strong> restent sous les <strong>25 000 $</strong> pour la majorité des années, ce qui reflète un positionnement plus économique ou utilitaire.
  </p>
  <p>
    Certains styles rares comme les <strong>Convertible SUV</strong> affichent des pics de prix, mais leur représentation est marginale.
  </p>
  <p>
    Le style influence donc directement la valeur résiduelle : les véhicules <strong>plaisir ou statutaires</strong> conservent mieux leur prix, tandis que les véhicules <strong>utilitaires ou classiques</strong> subissent une dépréciation plus marquée.
  </p>
  <p>
    On note enfin qu’au-delà de 15 ans, la plupart des styles convergent vers une zone de <strong>dépréciation avancée</strong>, en dessous des <strong>15 000 $</strong>.
  </p>
  <p className="italic">
    Le style de carrosserie n’est pas qu’une question d’esthétique : c’est un levier marketing puissant, que nous allons maintenant relier à la notion de <strong>segment de marché</strong>.
  </p>
</div>


      </div>

      {/* Q5 - Comparaison par Catégorie de marché */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Dépréciation par catégorie de marché</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setSelectedCategories([])}
          >
            Toutes les catégories
          </Button>
          {allCategories.slice(0, 10).map(category => (
            <Button
              key={category}
              variant={selectedCategories.includes(category) ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <Plot
          data={categoryTraces}
          layout={{
            autosize: true,
            height: 500,
            title: "",
            xaxis: { 
                title: { 
                  text: "Année du véhicule",
                  font: {
                    size: 16,
                    color: '#333'
                  }
                },
                tickangle: -45,
                automargin: true
              },
              yaxis: { 
                title: 
                  { 
                      text: "Prix moyen (USD)",
                      font: {
                          size: 16,
                          color: '#333'
                      }
                  },
                tickformat: "$,.0f",
              },
            hovermode: "closest",
            showlegend: true,
            legend: { orientation: "h", y: -0.2 },
            margin: { t: 50, b: 150 }
          }}
          config={{ responsive: true }}
          style={{ width: "100%" }}
        />
<div className="mt-4 text-gray-700 leading-relaxed space-y-4">
  <p>
    Ce graphique explore les <strong>catégories marketing</strong>, c’est-à-dire la manière dont les véhicules sont positionnés commercialement (luxe, performance, écolo, etc.).
  </p>
  <p>
    Les segments <strong>Exotic</strong>, <strong>High-Performance</strong> et <strong>Luxury</strong> dépassent souvent les <strong>100 000 $</strong>, même pour des modèles anciens, ce qui reflète leur rareté et leur image valorisante.
  </p>
  <p>
    À l’opposé, les catégories <strong>Diesel</strong>, <strong>Hatchback</strong> ou <strong>Flex Fuel</strong> conservent des valeurs plus faibles et tendent à décroître rapidement.
  </p>
  <p>
    Le segment <strong>Crossover</strong> se distingue par sa régularité : il affiche une bonne stabilité de prix dans le temps, illustrant son attrait polyvalent.
  </p>
  <p className="font-semibold">
    En somme, <strong>la perception marketing joue un rôle central</strong> : plus une catégorie évoque la performance, le prestige ou la rareté, plus elle garde de la valeur.
  </p>
</div>

      </div>

    </div>
  );
};

export default Graph1;