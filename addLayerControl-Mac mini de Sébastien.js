
var poiSearchLayerGroup;

function addGeoJSONUploadControl(map) {
    var fileInput = document.getElementById('geojsonInput');
    var layerList = document.getElementById('layerList');

    if (!fileInput || !layerList) {
        console.error("L'élément #geojsonInput ou #layerList est introuvable.");
        return;
    }

    fileInput.addEventListener('change', function (event) {
        handleGeoJSONUpload(event, map, layerList);
    });
}

// Fonction pour gérer l'upload GeoJSON
function handleGeoJSONUpload(event, map, layerList) {
    
	var file = event.target.files[0];
    if (!map) {
        console.error("Erreur : 'map' est indéfini !");
        return;
    }
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var geojsonData = JSON.parse(e.target.result);
            var layerName = file.name;
			
			var defaultColor = "blue";
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

            // 🔹 Utilisation de la fonction externe pour gérer la recherche
            createSearchPropertySelector(map, geojsonData, layerName, geojsonLayer);
			
        } catch (error) {
            alert("Erreur lors de la lecture du fichier GeoJSON : " + error.message);
        }
    };
    reader.readAsText(file);
	

}

// Fonction pour ajouter le menu de gestion des couches
function addLayerControlOptions(layerName, geojsonLayer, defaultFillColor, defaultBorderColor, defaultLabelColor) {
    var layerList = document.getElementById('layerList');

    var layerItem = document.createElement("li");
    layerItem.className = "list-group-item";
    layerItem.innerHTML = `
        <div class="layer-header">
            <input type="checkbox" checked id="toggle-${layerName}" data-layer="${layerName}">
            <label for="toggle-${layerName}">${layerName}</label>
            <button class="settings-button" id="settings-${layerName}" title="Configurer ⚙️">⚙️</button>
        </div>
    `;

    var settingsPanel = document.createElement('div');
    settingsPanel.classList.add('settings-panel');
    settingsPanel.id = `settings-panel-${layerName}`;
    settingsPanel.style.display = "none";

    settingsPanel.innerHTML = `
        <label>Transparence:</label>
        <input type="range" id="opacity-${layerName}" min="0" max="1" step="0.1" value="0.6">
        
        <label>Couleur de fond:</label>
        <input type="color" id="fillColor-${layerName}" value="${defaultFillColor}">
        
        <label>Couleur de bordure:</label>
        <input type="color" id="borderColor-${layerName}" value="${defaultBorderColor}">
        
        <label>Label:</label>
        <select id="label-${layerName}">
            <option value="">(Aucun)</option>
        </select>
        
        <label>Couleur du label:</label>
        <input type="color" id="labelColor-${layerName}" value="${defaultLabelColor}">
        
        <label>Taille des cercles (si points) :</label>
        <select id="size-${layerName}">
            <option value="">(Aucun)</option>
        </select>
    `;

    layerItem.appendChild(settingsPanel);
    layerList.appendChild(layerItem);

    var settingsButton = document.getElementById(`settings-${layerName}`);
    var fillColorPicker = document.getElementById(`fillColor-${layerName}`);
    var borderColorPicker = document.getElementById(`borderColor-${layerName}`);
    var labelColorPicker = document.getElementById(`labelColor-${layerName}`);
    var toggleCheckbox = document.getElementById(`toggle-${layerName}`);

    toggleCheckbox.addEventListener('change', function () {
        if (this.checked) {
            geojsonLayer.addTo(map);
        } else {
            map.removeLayer(geojsonLayer);
        }
    });

    settingsButton.addEventListener('click', function (e) {
        e.stopPropagation();
        settingsPanel.style.display = settingsPanel.style.display === "none" ? "block" : "none";
    });

    document.getElementById(`opacity-${layerName}`).addEventListener('input', function () {
        var opacity = this.value;
        geojsonLayer.setStyle({ opacity: opacity, fillOpacity: opacity });
    });

    fillColorPicker.addEventListener('input', function () {
        var fillColor = this.value;
        geojsonLayer.setStyle({ fillColor: fillColor });
    });

    borderColorPicker.addEventListener('input', function () {
        var borderColor = this.value;
        geojsonLayer.setStyle({ color: borderColor });
    });

    var firstFeature = geojsonLayer.toGeoJSON().features[0];
    if (firstFeature) {
        var labelSelect = document.getElementById(`label-${layerName}`);
        var sizeSelect = document.getElementById(`size-${layerName}`);

        Object.keys(firstFeature.properties).forEach(prop => {
            var option1 = document.createElement('option');
            option1.value = prop;
            option1.textContent = prop;
            labelSelect.appendChild(option1);

            var option2 = document.createElement('option');
            option2.value = prop;
            option2.textContent = prop;
            sizeSelect.appendChild(option2);
        });

        labelSelect.addEventListener('change', function () {
            var labelProperty = this.value;
            geojsonLayer.eachLayer(layer => {
                if (labelProperty) {
                    layer.bindTooltip(layer.feature.properties[labelProperty], {
                        permanent: true,
                        direction: "right",
                        className: `label-${layerName}`
                    });
                } else {
                    layer.unbindTooltip();
                }
            });
        });

        labelColorPicker.addEventListener('input', function () {
            var labelColor = this.value;
            var styleTag = document.getElementById(`label-style-${layerName}`);
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = `label-style-${layerName}`;
                document.head.appendChild(styleTag);
            }
            styleTag.innerHTML = `.label-${layerName} { color: ${labelColor} !important; }`;
        });
    }
}

function askUserForSearchProperty(geojsonData, callback) {
    if (!geojsonData.features || geojsonData.features.length === 0) {
        alert("Le fichier GeoJSON ne contient aucune donnée !");
        return;
    }

    var firstFeature = geojsonData.features[0];
    var propList = Object.keys(firstFeature.properties);

    // Filtrer les propriétés pour exclure "layerType" (et d'autres si nécessaire)
    propList = propList.filter(prop => prop !== "layerType");

    if (propList.length === 0) {
        alert("Aucune propriété trouvée dans le fichier GeoJSON !");
        return;
    }

    // Vérifier et supprimer d'anciennes boîtes de dialogue
    var existingModal = document.getElementById("propertySelectionModal");
    if (existingModal) {
        existingModal.remove();
    }

    // Création de la boîte de dialogue
    var modal = document.createElement("div");
    modal.id = "propertySelectionModal";
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.padding = "20px";
    modal.style.background = "white";
    modal.style.border = "1px solid #ccc";
    modal.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.3)";
    modal.style.zIndex = "10000";
    modal.style.borderRadius = "8px";
    modal.style.textAlign = "center";

    var title = document.createElement("h3");
    title.textContent = "Choisissez une propriété pour la recherche POI";
    title.style.marginBottom = "10px";
    modal.appendChild(title);

    // Liste déroulante
    var select = document.createElement("select");
    select.style.width = "100%";
    select.style.padding = "8px";
    select.style.marginBottom = "10px";

    propList.forEach(prop => {
        var option = document.createElement("option");
        option.value = prop;
        option.textContent = prop;
        select.appendChild(option);
    });

    modal.appendChild(select);

    // Conteneur des boutons
    var btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "space-between";
    btnContainer.style.marginTop = "10px";

    var validateBtn = document.createElement("button");
    validateBtn.textContent = "Valider";
    validateBtn.style.padding = "8px 15px";
    validateBtn.style.background = "#28a745";
    validateBtn.style.color = "white";
    validateBtn.style.border = "none";
    validateBtn.style.cursor = "pointer";
    validateBtn.style.borderRadius = "4px";

    var cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Annuler";
    cancelBtn.style.padding = "8px 15px";
    cancelBtn.style.background = "#dc3545";
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "none";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.style.borderRadius = "4px";

    btnContainer.appendChild(validateBtn);
    btnContainer.appendChild(cancelBtn);
    modal.appendChild(btnContainer);

    // Overlay pour fond semi-transparent
    var overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0, 0, 0, 0.5)";
    overlay.style.zIndex = "9999";

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    validateBtn.addEventListener("click", function () {
        let selectedValue = select.value;
        if (selectedValue) {
            // Vérifier si callback est une fonction avant de l'appeler
            if (typeof callback === "function") {
				try {
					callback(selectedValue); // Exécution de la fonction de rappel avec la propriété choisie
				} catch (error) {
					console.error("Erreur dans la fonction de rappel :", error);
				}
			} else {
				console.error("❌ 'callback' n'est pas une fonction !");
			}


            // Suppression de la boîte de dialogue et de l'overlay après la validation
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        } else {
            alert("Veuillez sélectionner une propriété !");
        }
    });

    cancelBtn.addEventListener("click", function () {
        // Annulation de la sélection
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    });
}


document.addEventListener("DOMContentLoaded", function () {
    if (typeof map !== "undefined" && map !== null) {
        addGeoJSONUploadControl(map);
    } else {
        console.error("Erreur : La carte (map) n'est pas définie !");
    }
});