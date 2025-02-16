let layerColors = {}; // Stocke les couleurs attribuées à chaque layerType
var poiLayers=[];
var poiSearchControl;
var gData;



// Fonction pour ajouter les nouvelles propriétés au GeoJSON
function addSearchPropertyToGeoJSON(geoData, selectedProperty, fileName) {
    geoData.features.forEach(function (feature) {
        // Ajouter la propriété 'search' avec la valeur de la propriété sélectionnée
        feature.properties.search = feature.properties[selectedProperty] || '';
        // Ajouter la propriété 'layerType' avec le nom du fichier
        feature.properties.layerType = fileName;
    });
	gData=geoData;
}

function initializePOISearch(map, featureGroup) {
    // Si un control de recherche existe déjà, le retirer
    if (poiSearchControl) {
        map.removeControl(poiSearchControl);
    }

    // Créer et ajouter le contrôle de recherche avec la nouvelle couche GeoJSON
    window.poiSearchControl = new L.control.search({
        layer: featureGroup, // La couche GeoJSON
        initial: false,
        propertyName: 'search', // Utiliser la propriété 'search'
        buildTip: function (text, val) {
            var layerType = val.layer.feature.properties.layerType || "inconnu"; // Utiliser layerType de la feature
            var color = getLayerColor(layerType) || "#000"; // Utiliser une couleur par défaut si layerType n'est pas défini
            return `<a href="#" class="${layerType}" style="color:${color};">${text} - ${layerType.toUpperCase()}</a>`;
        }
    });
	
    map.addControl(window.poiSearchControl);
}


function addGeoJSONLayerToSearch(map, geojsonData, geojsonLayer) {
    // Si poiSearchLayerGroup n'existe pas encore, le créer
    if (!window.poiSearchLayerGroup) {
        window.poiSearchLayerGroup = L.featureGroup().addTo(map);
    }
    
    geojsonLayer.clearLayers();  // Vider l'ancienne couche
    geojsonLayer.addData(geojsonData);  // Charger les nouvelles données

    poiLayers.push(geojsonLayer);

    // Recréer un LayerGroup avec toutes les couches accumulées
    	if (!window.poiSearchLayerGroup) {
        	window.poiSearchLayerGroup = L.featureGroup().addTo(map);
    	} else {
        	window.poiSearchLayerGroup.clearLayers(); // Nettoyer avant de réajouter toutes les couches
    	}
    // Ajouter toutes les couches stockées
    	window.poiLayers.forEach(layer => {
       		window.poiSearchLayerGroup.addLayer(layer);
    	});


     // Vérifier si toutes les couches sont bien ajoutées
    console.log("Couches dans poiSearchLayerGroup :", window.poiSearchLayerGroup.getLayers());

    // Réinitialiser le contrôle de recherche pour prendre en compte toutes les couches
    initializePOISearch(map, window.poiSearchLayerGroup);
}

function DeleteGeoJSONLayerToSearch(map, geojsonLayer) {
    if (!window.poiSearchLayerGroup) return; // Si le groupe n'existe pas, ne rien faire

    // Supprimer la couche de poiLayers
    window.poiLayers = window.poiLayers.filter(layer => layer !== geojsonLayer);

    // Nettoyer le groupe avant de réajouter les couches restantes
    window.poiSearchLayerGroup.clearLayers();

    // Réajouter les couches restantes
    window.poiLayers.forEach(layer => {
        window.poiSearchLayerGroup.addLayer(layer);
    });

    // Vérifier si la couche est bien retirée
    console.log("Couches restantes dans poiSearchLayerGroup :", window.poiSearchLayerGroup.getLayers());

    // Réinitialiser le contrôle de recherche
    initializePOISearch(map, window.poiSearchLayerGroup);
}

function createSearchPropertySelector(map, geojsonData, layerName, geojsonLayer) {
    let firstFeature = geojsonData.features[0];
    if (!firstFeature) return;

    // Créer le HTML de la boîte modale
    let modalHtml = `
        <div id="searchPropertyModal" class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Sélectionner la propriété de recherche</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Fermer">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <label for="searchPropertySelect">Choisissez une propriété :</label>
                        <select id="searchPropertySelect" class="form-control">
                            <option value="">(Sélectionner une propriété)</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="confirmSearchProperty">Confirmer</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Annuler</button>
                    </div>
                </div>
            </div>
        </div>`;

    // Ajouter la boîte modale au body si elle n'existe pas
    if (!document.getElementById("searchPropertyModal")) {
        document.body.insertAdjacentHTML("beforeend", modalHtml);
    }

    // Remplir la liste déroulante avec les propriétés du GeoJSON
    let propSelect = document.getElementById("searchPropertySelect");
    propSelect.innerHTML = `<option value="">(Sélectionner une propriété)</option>`;
    Object.keys(firstFeature.properties).forEach(prop => {
        let option = document.createElement("option");
        option.value = prop;
        option.textContent = prop;
        propSelect.appendChild(option);
    });

    // Afficher la boîte modale
    $("#searchPropertyModal").modal("show");

    // Écouter le bouton de confirmation
    document.getElementById("confirmSearchProperty").addEventListener("click", function () {
        let selectedProperty = propSelect.value;
        if (selectedProperty) {
            addSearchPropertyToGeoJSON(geojsonData, selectedProperty, layerName);
            // Suppression de l'ancien L.control.search s'il existe
            if (window.poiSearchControl) {
                map.removeControl(window.poiSearchControl);
            }
		
            // Ajout de la recherche sur la carte
            addGeoJSONLayerToSearch(map, gData,geojsonLayer);

            // masquer la boîte modale
	    $("#searchPropertyModal").modal("hide"); 
            
            // Supprimer la boîte modale et la superposition
            $("#searchPropertyModal").remove();
            $(".modal-backdrop").remove(); // Supprimer la superposition de fond

            // Restaurer le focus sur la carte
            $("#map").focus();
        }
    });
	
}

function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}



function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function getLayerColor(layerType) {
    if (!layerColors[layerType]) {
        layerColors[layerType] = getRandomColor(); // Associe une couleur aléatoire si absente
    }
    return layerColors[layerType];
}