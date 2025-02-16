var legend;

document.getElementById("legendCheck").addEventListener("change", function() {
    if (this.checked) {
        afficherLegend(map);
    } else {
        masquerLegend(map);
    }
});

// Créer la légende
function creerLegende(map) {
    legend = L.control({position: 'bottomright'});
    legend.onAdd = function(mymap) {
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML = '<strong>Légende : </strong><br>';
        return div;
    };
    legend.addTo(map);
}

// Afficher la légende
function afficherLegend(map) {
    if (legend) {
        var div = document.querySelector('.legend');
        if (div) {
            div.style.display = 'block'; // Réafficher la légende
        }
    } else {
        creerLegende(map);
    }
}

// Masquer la légende
function masquerLegend(map) {
    if (legend) {
        var div = document.querySelector('.legend');
        if (div) {
            div.style.display = 'none'; // Masquer la légende en changeant son display
        }
    }
}


function addElementsToLegend(geojsonLayer, layerName, selectedCategory) {
    if (!legend) return;
    var div = document.querySelector('.legend');
    if (!div) return;

    // Créer un item de légende pour la couche
    var legendItem = document.createElement("div");
    legendItem.setAttribute("data-layer", layerName);
    legendItem.classList.add("legendItem");  // Ajout de la classe CSS "legendItem"

    // Créer un conteneur pour les valeurs de catégorie
    var valuesList = document.createElement("div");

    // Si selectedCategory est null ou undefined, afficher le nom de la couche (layerName)
    if (!selectedCategory) {
        var valueItem = document.createElement("div");
        var valueSymbol = document.createElement("div");

        // Choisir un symbole en fonction du type de géométrie
        var color = "#000"; // Valeur par défaut
        geojsonLayer.eachLayer(function(layer) {
            if (layer.feature) {
                var geometryType = layer.feature.geometry.type;

                // Vérifier si c'est un Point ou un Polygon et définir le symbole et la couleur
                if (geometryType === "Point") {
                    valueSymbol.style.borderRadius = "50%"; // Rond pour les marqueurs
                    color = layer.options.fillColor || "#000"; // Utiliser la couleur du marqueur
                } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
                    valueSymbol.style.borderRadius = "0%"; // Carré pour les polygones
                    color = layer.options.fillColor || layer.options.color || "#000"; // Utiliser la couleur du polygone
                }
            }
        });

        valueSymbol.style.backgroundColor = color;
        valueSymbol.classList.add("symbol");  // Ajout de la classe CSS "symbol"
        
        // Créer un conteneur pour le symbole et le texte (nom de la couche)
        var symbolAndTextContainer = document.createElement("div");
        symbolAndTextContainer.classList.add("symbolTextContainer");  // Ajouter une classe personnalisée
        
        // Ajouter le symbole au conteneur
        symbolAndTextContainer.appendChild(valueSymbol);
        
        // Créer un label pour le nom de la couche
        var label = document.createElement("span");
        label.textContent = layerName; // Afficher le nom de la couche
        symbolAndTextContainer.appendChild(label);

        // Ajouter le tout au conteneur de valeurs
        valuesList.appendChild(symbolAndTextContainer);
    } else {
        // Si selectedCategory est renseigné, afficher les valeurs de cette catégorie
        var valuesText = new Set();
        var categoryColors = {}; // Stocker les couleurs pour chaque valeur de catégorie

        geojsonLayer.eachLayer(function(layer) {
            if (layer.feature && layer.feature.properties[selectedCategory]) {
                var categoryValue = layer.feature.properties[selectedCategory];
                valuesText.add(categoryValue);

                // Stocker la couleur associée à chaque valeur de catégorie
                var categoryColor = getCategoryColor(categoryValue);
                categoryColors[categoryValue] = categoryColor;
            }
        });

        // Ajouter chaque valeur de la catégorie à la légende avec sa couleur correspondante
        valuesText.forEach(function(value) {
            var valueItem = document.createElement("div");
            var valueSymbol = document.createElement("div");

            // Choisir un symbole en fonction du type de géométrie
            var color = categoryColors[value] || "#000"; // Utiliser la couleur de la catégorie

            geojsonLayer.eachLayer(function(layer) {
                if (layer.feature && layer.feature.properties[selectedCategory] === value) {
                    var geometryType = layer.feature.geometry.type;

                    if (geometryType === "Point") {
                        valueSymbol.style.borderRadius = "50%"; // Rond pour les points
                    } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
                        valueSymbol.style.borderRadius = "0%"; // Carré pour les polygones
                    }
                }
            });

            valueSymbol.style.backgroundColor = color;
            valueSymbol.classList.add("symbol");  // Ajout de la classe CSS "symbol"

            // Créer un conteneur pour le symbole et le texte (valeur de catégorie)
            var symbolAndTextContainer = document.createElement("div");
            symbolAndTextContainer.classList.add("symbolTextContainer");  // Ajouter une classe personnalisée

            // Ajouter le symbole au conteneur
            symbolAndTextContainer.appendChild(valueSymbol);

            // Créer un label pour le nom de la catégorie
            var label = document.createElement("span");
            label.textContent = value;
            symbolAndTextContainer.appendChild(label);

            // Ajouter le tout au conteneur de valeurs
            valuesList.appendChild(symbolAndTextContainer);
        });
    }

    // Ajouter la liste des valeurs à l'élément principal de la légende
    legendItem.appendChild(valuesList);
    div.appendChild(legendItem);
}


// Réinitialiser la légende pour une couche spécifique (ne pas effacer les autres)
function reinitialiserLegend(layerName) {
    var div = document.querySelector('.legend');
    if (div) {
        var layerItems = div.querySelectorAll('[data-layer="' + layerName + '"]');
        layerItems.forEach(function(item) {
            div.removeChild(item); // Supprimer seulement l'élément de la couche spécifique
        });
    }
}


// Fonction pour obtenir une couleur unique en fonction de la valeur de catégorie
function getCategoryColor(categoryValue) {
    var hash = 0;
    for (var i = 0; i < categoryValue.length; i++) {
        hash = ((hash << 5) - hash) + categoryValue.charCodeAt(i);
        hash = hash & hash; // Convertit en 32 bits
    }
    
    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;  // Obtenir une partie de la couleur
        color += ('00' + value.toString(16)).substr(-2); // Ajouter chaque composant RGB
    }

    return color; // Retourne une couleur unique pour cette valeur
}

// Fonction pour ajouter ou mettre à jour la légende en fonction de la catégorie choisie
function updateLegendWithCategory(geojsonLayer, layerName, selectedCategory) {
    removeElementsToLegend(geojsonLayer, layerName);
	addElementsToLegend(geojsonLayer, layerName, selectedCategory);
}

// Fonction pour renseigner la liste des catégories dans le label
function renseignerLabel(label, geojsonLayer) {

    var options = new Set();
    
    geojsonLayer.eachLayer(function(layer) {
        for (var key in layer.feature.properties) {
            options.add(key); // Ajouter chaque clé de propriété unique
        }
    });

    // Remplir la liste déroulante avec les options
    options.forEach(function(option) {
        var optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        label.appendChild(optionElement);
    });
}


// Supprimer l'élément de la légende
function removeElementsToLegend(geojsonLayer, layerName) {
    if (!legend) return;
    var div = document.querySelector('.legend');
    if (!div) return;

    // Chercher et supprimer l'élément de légende correspondant à la couche
    var legendItem = div.querySelector('[data-layer="' + layerName + '"]');
    if (legendItem) {
        div.removeChild(legendItem);
    }
}