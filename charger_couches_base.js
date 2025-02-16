function InitialiseCouches(map,geojsonFiles) {
    for (const item of geojsonFiles) {
        var geojsonData = item.data;
        var layerName = geojsonData.name;
		var selectedProperty=item.property;
		
        // Génération des couleurs par défaut
        var defaultFillColor = getRandomColor();
        var defaultBorderColor = "#000000"; // Bordure noire par défaut
        var defaultLabelTextColor = "#FFFFFF"; // Texte blanc par défaut
        var defaultLabelBgColor = "#000000"; // Fond noir par défaut
        var defaultOpacity = 0.6;

        // Création de la couche GeoJSON
        var geojsonLayer = L.geoJSON(geojsonData, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 5,
                    fillColor: defaultFillColor,
                    color: defaultBorderColor,
                    weight: 2,
                    opacity: 1,
                    fillOpacity: defaultOpacity
                });
            },
            style: function (feature) {
                return {
                    color: defaultBorderColor,
                    fillColor: defaultFillColor,
                    weight: 2,
                    opacity: 1,
                    fillOpacity: defaultOpacity
                };
            },
            onEachFeature: function (feature, layer) {
                var popupContent = `<div class="popup-content-class">
									<div class="popup-title">INFORMATIONS :</div>
									<hr>`;
                for (var key in feature.properties) {
                    popupContent += key + ": " + feature.properties[key] + "<br>";
                }
                layer.bindPopup(popupContent)+"</div>";
            }
        }).addTo(map);

        // Ajuste la carte pour englober la couche
        map.fitBounds(geojsonLayer.getBounds());

        // Ajout des contrôles pour personnaliser la couche
        addLayerControlOptions(layerName, geojsonLayer, defaultFillColor, defaultBorderColor, defaultLabelTextColor, defaultLabelBgColor);
		
		// ðŸ”¹ Utilisation de la fonction externe pour gÃ©rer la recherche
		creerSearchPropertySelector(map, geojsonData, layerName, geojsonLayer, selectedProperty);
	}
}
            


// Fonction pour gÃ©rer l'upload GeoJSON
function chargerCouche(geojsonData, map, layerList) {
    
	
    if (!map) {
        console.error("Erreur : 'map' est indÃ©fini !");
        return;
    }
              
	var layerName = geojsonData.name;
	
	var defaultColor = getRandomColor();
	var defaultOpacity = 0.6;

	var geojsonLayer = L.geoJSON(geojsonData, {
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, {
				radius: 5,
				fillColor: defaultColor,
				color: '#000',
				weight: 1,
				opacity: 1,
				fillOpacity: defaultOpacity
			});
		},
		style: function (feature) {
			return {
				color: defaultColor,
				weight: 2,
				opacity: defaultOpacity,
				fillOpacity: defaultOpacity
			};
		},
		onEachFeature: function (feature, layer) {
			var popupContent = "<b>Informations:</b><br>";
			for (var key in feature.properties) {
				popupContent += key + ": " + feature.properties[key] + "<br>";
			}
			layer.bindPopup(popupContent);
		}
	}).addTo(map);

	map.fitBounds(geojsonLayer.getBounds());
	

		
				
	// Ajout du menu de configuration de la couche
	addLayerControlOptions(layerName, geojsonLayer, defaultColor);

	// ðŸ”¹ Utilisation de la fonction externe pour gÃ©rer la recherche
	creerSearchPropertySelector(map, geojsonData, layerName, geojsonLayer, selectedProperty);
			
        
	

}



function creerSearchPropertySelector(map, geojsonData, layerName, geojsonLayer, selectedProperty) {
    let firstFeature = geojsonData.features[0];
    if (!firstFeature) return;

    addSearchPropertyToGeoJSON(geojsonData, selectedProperty, layerName);
	// Suppression de l'ancien L.control.search s'il existe
	if (window.poiSearchControl) {
		map.removeControl(window.poiSearchControl);
	}

	// Ajout de la recherche sur la carte
	addGeoJSONLayerToSearch(map, gData,geojsonLayer);

}
