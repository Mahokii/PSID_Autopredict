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
    Ce graphique nous livre une vue d’ensemble sur le marché de l’automobile (neuf + occasion) tel qu’il apparaît en 2017.
  </p>
  <p>
    Les véhicules les plus anciens (1990–1999) se vendent en moyenne <strong>sous la barre des 10 000 $</strong>, reflétant une forte dépréciation avec le temps.
  </p>
  <p>
    Entre 2000 et 2002, on observe une chute abrupte du prix moyen. Cela peut s'expliquer par l’impact de régulations environnementales (ex. ZFE en France) qui pénalisent les véhicules les plus anciens.
  </p>
  <p>
    À partir de 2005, la courbe évolue de façon régulière, atteignant près de <strong>37 000 $</strong> en 2017. Cela indique une montée en gamme du marché automobile.
  </p>
  <p>
    On peut ainsi déduire qu’il <strong>n’est pas rentable d’acheter un véhicule de plus de 15 ans</strong>, car il subit une dépréciation importante les années suivantes.
  </p>
  <p className="italic">
    Après avoir saisi cette tendance générale, une question logique émerge : <br />
    <strong>Est-ce que tous les véhicules se déprécient au même rythme ?</strong>
  </p>
  <p>
    Pour répondre, nous allons maintenant nous intéresser à un facteur visuel et fonctionnel : <strong>le style de carrosserie</strong>.
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
            Chaque courbe représente un style de carrosserie, et la hauteur de la courbe indique le <strong>prix moyen</strong> de ce style à chaque année.
          </p>
          <p>
            Les <strong>SUV 4 portes</strong>, <strong>Convertibles</strong> et <strong>Crew Cab Pickups</strong> affichent des prix élevés même plusieurs années après leur mise en circulation, témoignant d’une <strong>forte demande</strong> et d’une bonne <strong>retenue de valeur</strong>.
          </p>
          <p>
            À l’inverse, les <strong>Cargo Vans</strong>, <strong>2dr Hatchbacks</strong> ou <strong>Sedans</strong> se situent souvent sous la barre des <strong>20 000 $</strong> même pour des modèles récents. Ces styles, plus utilitaires ou classiques, sont <strong>moins valorisés à la revente</strong>.
          </p>
          <p>
            Le cas du <strong>Convertible SUV</strong>, bien que rare, se distingue par des valeurs très élevées, probablement dues à sa <strong>rareté</strong> et son <strong>image haut de gamme</strong>.
          </p>
          <p>
            Le style de carrosserie a donc un impact direct sur la dépréciation. Les véhicules <strong>familiaux, utilitaires ou économiques</strong> perdent de la valeur plus vite, tandis que les véhicules <strong>plaisir ou valorisants</strong> conservent mieux leur valeur.
          </p>
          <p>
            Cependant, il est important de noter qu’<strong>au-delà de 15 ans</strong>, la valeur de la plupart des véhicules converge vers <strong>10 000 $</strong>.
          </p>
          <p className="italic">
            Le style, c’est ce que l’on voit. C’est ce qui attire, ce qui influence l’usage. <br />
            Mais au-delà de l’esthétique, il y a aussi une logique stratégique de <strong>positionnement marketing</strong>.
          </p>
          <p>
            C’est ce que nous allons explorer dans le graphique suivant, à travers les <strong>catégories de marché</strong>.
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
            Ce graphique s'intéresse à la <strong>catégorie marketing</strong> des véhicules, c’est-à-dire à leur <strong>positionnement commercial</strong>.
          </p>
          <p>
            Les segments <strong>Exotic</strong>, <strong>High-Performance</strong> et <strong>Luxury</strong> dominent, avec des prix qui dépassent souvent les <strong>60 000 $</strong>, même pour des modèles de 5 à 10 ans. Ces véhicules sont hautement valorisés et souvent rares.
          </p>
          <p>
            À l’opposé, les catégories <strong>Diesel</strong>, <strong>Hatchback</strong> ou <strong>Flex Fuel</strong> affichent des valeurs nettement inférieures. Ils sont souvent conçus pour l’économie ou l’environnement, et subissent une dépréciation plus rapide.
          </p>
          <p>
            Le segment <strong>Crossover</strong>, en pleine expansion, montre une très bonne tenue de valeur : il combine polyvalence, confort et image moderne, ce qui en fait un choix stratégique.
          </p>
          <p className="font-semibold">
            En résumé, <strong>la perception marketing influence fortement la valeur résiduelle</strong> : un véhicule "exotique", "hybride" ou "haut de gamme" est vendu plus cher et conserve mieux sa valeur au fil du temps.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Graph1;