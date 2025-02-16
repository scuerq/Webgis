// Déclaration de geojsonLayers comme une variable publique
var geojsonLayers = {};
var poiSearchLayerGroup;
var layerName;


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
            layerName = file.name;
			
			var defaultColor = "blue";
            var defaultOpacity = 0.6;

            var geojsonLayer = L.geoJSON(geojsonData, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 5,
                        fillColor: defaultColor,
                        color: '#FFFFFF',
                        weight: 2,
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
                    var popupContent = `<div class="popup-content-class">
									<div class="popup-title">INFORMATIONS :</div>
									<hr>`;
                    for (var key in feature.properties) {
                        popupContent += key + ": " + feature.properties[key] + "<br>";
                    }
                    layer.bindPopup(popupContent)+"</div>";
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

function addLayerControlOptions(layerName, geojsonLayer, defaultFillColor, defaultBorderColor, defaultLabelTextColor, defaultLabelBgColor, defaultLabelBorderColor) {
    //ajoute des elements a la legende
	afficherLegend(map);
	addElementsToLegend(geojsonLayer, layerName,);
	
	var layerList = document.getElementById('layerList');

    var layerItem = document.createElement("li");
    layerItem.className = "list-group-item";
    layerItem.innerHTML = `
        <div class="layer-header">
            <input type="checkbox" checked id="toggle-${layerName}" data-layer="${layerName}">
			<button class="settings-button" id="settings-${layerName}" title="Configurer ⚙️">⚙️</button>
            <label for="toggle-${layerName}">${layerName}</label>
	    
			<button class="settings-button" id="binder-${layerName}" title="Classeur 📖">📖</button>
			<button class="delete-button" id="delete-${layerName}" title="Supprimer 🗑️">🗑️</button> 
        </div>
    `;

    var settingsPanel = document.createElement('div');
    settingsPanel.classList.add('settings-panel');
    settingsPanel.id = `settings-panel-${layerName}`;
    settingsPanel.style.display = "none";

    settingsPanel.innerHTML = `
        <div class="settings-group">
            <div class="settings-group-title">Opacité de la couche </div>
            <input type="range" id="opacity-${layerName}" min="0" max="1" step="0.1" value="0.6">
        </div>
		
		<div class="settings-group">
			<div class="settings-group-title">Classer par Catégories</div>
			<div style="display: flex; align-items: center; gap: 10px;">
				<input type="checkbox" id="categorieActive-${layerName}" data-layer="${layerName}" unchecked>
				<select id="labelCat-${layerName}">
					<option value="">(Aucun)</option>
				</select>
			</div>
		</div>
		
        <div class="settings-group">
			<div class="settings-group-title">Apparence de la forme</div>

			<div class="color-picker-container">
				<label class="color-label">Couleur de fond:</label>
				<div class="color-square" id="fillColorSquare-${layerName}" style="background: ${defaultFillColor};"></div>
				<input type="color" id="fillColor-${layerName}" class="color-picker" value="${defaultFillColor}">
			</div>

			<div class="color-picker-container">
				<label class="color-label">Couleur de bordure:</label>
				<div class="color-square" id="borderColorSquare-${layerName}" style="background: ${defaultBorderColor};"></div>
				<input type="color" id="borderColor-${layerName}" class="color-picker" value="${defaultBorderColor}">
			</div>
		</div>

        <div class="settings-group">
            <div class="settings-group-title">Affichage du label</div>
            <label>Label:</label>
            <select id="label-${layerName}">
                <option value="">(Aucun)</option>
            </select>
        </div>

        <div class="settings-group">
            <div class="settings-group-title">Style du label</div>
			
			<div class="color-picker-container">
				<label class="color-label">Couleur du texte:</label>
				<div class="color-square" id="labelTextColorSquare-${layerName}" style="background: ${defaultLabelTextColor};"></div>
				<input type="color" id="labelTextColor-${layerName}" class="color-picker" value="${defaultLabelTextColor}">
			</div>
			
			<div class="color-picker-container">
				<label class="color-label">Couleur de fond du label:</label>
				<div class="color-square" id="labelBgColorSquare-${layerName}" style="background: ${defaultLabelBgColor};"></div>
				<input type="color" id="labelBgColor-${layerName}" class="color-picker" value="${defaultLabelBgColor}">
			</div>
            
			<div class="color-picker-container">
				<label class="color-label">Couleur de bordure du label:</label>
				<div class="color-square" id="labelBgColorSquare-${layerName}" style="background: ${defaultLabelBgColor};"></div>
				<input type="color" id="labelBorderColor-${layerName}" class="color-picker" value="${defaultLabelBorderColor}">
			</div>
			
            
        </div>

        <div class="settings-group">
            <div class="settings-group-title">Taille des cercles (si points)</div>
            <select id="size-${layerName}">
                <option value="">(Aucun)</option>
            </select>
			<input type="range" id="sizeInput-${layerName}" min="0" max="2" step="0.2" value="1">
        </div>
    `;

    layerItem.appendChild(settingsPanel);
    layerList.appendChild(layerItem);

    var settingsButton = document.getElementById(`settings-${layerName}`);
    var fillColorPicker = document.getElementById(`fillColor-${layerName}`);
    var borderColorPicker = document.getElementById(`borderColor-${layerName}`);
    var labelTextColorPicker = document.getElementById(`labelTextColor-${layerName}`);
    var labelBgColorPicker = document.getElementById(`labelBgColor-${layerName}`);
    var labelBorderColorPicker = document.getElementById(`labelBorderColor-${layerName}`);
    var toggleCheckbox = document.getElementById(`toggle-${layerName}`);
    var sizeInput = document.getElementById(`sizeInput-${layerName}`);
    var binderButton = document.getElementById(`binder-${layerName}`);
	var deleteButton = document.getElementById(`delete-${layerName}`);
	var categorieActive = document.getElementById(`categorieActive-${layerName}`);
	var labelCat = document.getElementById(`labelCat-${layerName}`);
	var labelSelect = document.getElementById(`label-${layerName}`);
	renseignerLabel(labelCat, geojsonLayer);
	
	function appearanceGroup(layerName){
		var escapedLayerName = CSS.escape(layerName);  // Échapper les caractères spéciaux comme le point
		var appearanceGroupe = Array.from(document.querySelectorAll(`#settings-panel-${escapedLayerName} .settings-group-title`))
			.find(title => title.textContent.includes('Apparence de la forme'))
			?.parentNode;  // Assure-toi que le parentNode existe

		if (appearanceGroupe) {
			return appearanceGroupe
		} else {
			console.log('Le groupe "Apparence de la forme" n\'a pas été trouvé.');
		}
	}
	
	// code pour catégorie
	function handleCategorieChange() {
		if (categorieActive.checked && labelCat.value) {
			// Masquer la section 'Apparence de la forme'
			var xGroupe=appearanceGroup(layerName)
			xGroupe.style.display = 'none';

			var selectedCategory = labelCat.value;
			
			geojsonLayer.eachLayer(function(layer) {
				var categoryValue = layer.feature.properties[selectedCategory];
				var categoryColor = getCategoryColor(categoryValue); // Obtenu dynamiquement

				// Appliquer la couleur en fonction de la catégorie
				if (layer instanceof L.Polygon || layer instanceof L.CircleMarker) {
					layer.setStyle({
						fillColor: categoryColor,
						color: categoryColor,
						fillOpacity: 1
					});
				}

				if (layer instanceof L.Marker) {
					layer.setIcon(L.divIcon({
						className: 'leaflet-div-icon',
						html: `<div style="background-color: ${categoryColor};">${categoryValue}</div>`,
						iconSize: [30, 30]
					}));
				}
			});

			// Mettre à jour la légende avec les valeurs spécifiques
			updateLegendWithCategory(geojsonLayer, layerName, selectedCategory);
		} else {
			// Si la case est décochée, réafficher la section et réinitialiser la couleur
			appearanceGroup.style.display = 'block';

			// Réinitialiser les couleurs à leur état d'origine
			geojsonLayer.eachLayer(function(layer) {
				if (layer instanceof L.Polygon || layer instanceof L.CircleMarker) {
					layer.setStyle({
						fillColor: defaultFillColor,
						color: defaultBorderColor,
						fillOpacity: 0.6
					});
				}

				if (layer instanceof L.Marker) {
					layer.setIcon(L.divIcon({
						className: 'leaflet-div-icon',
						html: `<div style="background-color: ${defaultFillColor};">${layer.feature.properties[selectedCategory]}</div>`,
						iconSize: [30, 30]
					}));
				}
			});

			// Réinitialiser la légende
			reinitialiserLegend(layerName);
		}
	}

	// Ajout d'un écouteur d'événement pour la case à cocher
	categorieActive.addEventListener('click', function (e) {
		handleCategorieChange();  // Il faut appeler la fonction ici, avec des parenthèses
	});
	
	//Poubelle
	deleteButton.addEventListener('click', function (e) {
		e.stopPropagation(); // Empêcher la propagation de l'événement

		// Supprimer la couche de la carte
		if (map.hasLayer(geojsonLayer)) {
			map.removeLayer(geojsonLayer);
		}

		// Supprimer l'élément de la légende
		removeElementsToLegend(geojsonLayer, layerName);

		// Supprimer l'élément de l'UI
		layerItem.remove();

		// Supprimer le panneau de configuration
		settingsPanel.remove();

		// Réinitialiser la couche dans l'objet geojsonLayers
		delete geojsonLayers[layerName];
		// mise a jour POISearch
		DeleteGeoJSONLayerToSearch(map, geojsonLayer);
		
		// Mettre à jour le réordonnancement des couches
		enableLayerReordering();

		console.log(`La couche "${layerName}" a été supprimée.`);
	});
	// fin poubelle
	
    binderButton.addEventListener('click', function (e) {
         e.stopPropagation();
	showLayerTable(geojsonLayer);
         console.log(`Ouverture du classeur pour la couche : ${layerName}`);
        // TODO: Ajouter l’action spécifique ici (ex: afficher une fenêtre modale, un menu, etc.)
    });

    toggleCheckbox.addEventListener('change', function () {
        if (this.checked) {
            geojsonLayer.addTo(map);
			addElementsToLegend(geojsonLayer,layerName,);
        } else {
            map.removeLayer(geojsonLayer);
			removeElementsToLegend(geojsonLayer,layerName);
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
		updateLegendElements(geojsonLayer,layerName);
		
    });

    borderColorPicker.addEventListener('input', function () {
        var borderColor = this.value;
        geojsonLayer.setStyle({ color: borderColor });
		
    });
	var fixedSize=1;
	
    var firstFeature = geojsonLayer.toGeoJSON().features[0];
    if (firstFeature) {
        
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
						// Récupère la couleur de remplissage dynamique de la couche
						var fillColor = layer.options.fillColor;

						// Lier l'étiquette avec le tooltip
						layer.bindTooltip(layer.feature.properties[labelProperty], {
							permanent: true,
							direction: "right",
							className: `label-${layerName}`,
							// Ne pas appliquer directement dans les options de bindTooltip, mais personnaliser via une classe
						});

						// Ajouter un style personnalisé après l'attachement du tooltip
						layer.getTooltip().getElement().style.backgroundColor = fillColor; // Appliquer le fond dynamique
						layer.getTooltip().getElement().style.color = 'white';               // Texte en blanc
						layer.getTooltip().getElement().style.border = '2px solid white';    // Bordure blanche
						layer.getTooltip().getElement().style.padding = '2px';               // Espacement
						layer.getTooltip().getElement().style.borderRadius = '4px';          // Coins arrondis
					} else {
						layer.unbindTooltip();
					}
				});
		});
		
		sizeSelect.addEventListener('change', function () {
			var sizeProperty = this.value;
			if (!sizeProperty) return;

			// Extraire les valeurs de la propriété choisie
			var values = geojsonLayer.toGeoJSON().features.map(f => f.properties[sizeProperty]);

			// Vérifier que toutes les valeurs sont bien numériques
			if (values.some(v => isNaN(parseFloat(v)))) {
				alert("Erreur : La propriété choisie contient des valeurs non numériques.");
				return;
			}

			// Convertir les valeurs en nombres
			values = values.map(v => parseFloat(v));

			// Trouver les valeurs min et max
			var minValue = Math.min(...values);
			var maxValue = Math.max(...values);

			// Éviter les erreurs si toutes les valeurs sont identiques
			if (minValue === maxValue) {
				minValue = 0;
			}

			// Définir une échelle de taille avec D3.js
			var scale = d3.scaleLinear()
				.domain([minValue, maxValue])
				.range([3, 15]); // Diamètre des cercles entre 3px et 15px

			// Appliquer la nouvelle taille aux cercles
			geojsonLayer.eachLayer(layer => {
				if (layer instanceof L.CircleMarker) {
					var value = parseFloat(layer.feature.properties[sizeProperty]);
					if (!isNaN(value)) {
						var newSize = scale(value)*fixedSize;
						layer.setRadius(newSize);
						// Écoute le changement de l'input
						clearTimeout(sizeInput.resetTimer); // Annule un reset précédent s'il y en a un
							
						sizeInput.resetTimer = setTimeout(() => {
							sizeInput.value = 1;
						}, 100); // Temps en millisecondes avant retour au centre
					
					}
				}
			});
			
		});

	document.getElementById(`sizeInput-${layerName}`).addEventListener('input', function () {
        fixedSize = this.value;
        geojsonLayer.eachLayer(layer => {
			if (layer instanceof L.CircleMarker) {
				var taille = layer.getRadius() * fixedSize;
				layer.setRadius(taille);
				// Écoute le changement de l'input
				clearTimeout(sizeInput.resetTimer); // Annule un reset précédent s'il y en a un
							
				sizeInput.resetTimer = setTimeout(() => {
					sizeInput.value = 1;
				}, 100); // Temps en millisecondes avant retour au centre
			}
		});
    });
        function updateLabelStyle() {
            var labelTextColor = labelTextColorPicker.value;
            var labelBgColor = labelBgColorPicker.value;
            var labelBorderColor = labelBorderColorPicker.value;

            var styleTag = document.getElementById(`label-style-${layerName}`);
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = `label-style-${layerName}`;
                document.head.appendChild(styleTag);
            }
            styleTag.innerHTML = `
                .label-${layerName} { 
                    color: ${labelTextColor} !important; 
                    background-color: ${labelBgColor} !important; 
                    border: 2px solid ${labelBorderColor} !important;
                    padding: 2px; 
                    border-radius: 4px; 
                }
            `;
        }
		
        labelTextColorPicker.addEventListener('input', updateLabelStyle);
        labelBgColorPicker.addEventListener('input', updateLabelStyle);
        labelBorderColorPicker.addEventListener('input', updateLabelStyle);
		
		//mise a jour des pickercolor
		
		function updateColorPickerDisplay(pickerId, squareId, color) {
			document.getElementById(squareId).style.backgroundColor = color;
			document.getElementById(pickerId).value = color;  // Cela peut déjà être le cas, mais c'est pour être sûr
		}

		fillColorPicker.addEventListener('input', function () {
			var fillColor = this.value;
			geojsonLayer.setStyle({ fillColor: fillColor });

			// Met à jour le carré de couleur pour la couleur de fond
			updateColorPickerDisplay(`fillColor-${layerName}`, `fillColorSquare-${layerName}`, fillColor);

			updateLegendElements(geojsonLayer, layerName);
		});

		borderColorPicker.addEventListener('input', function () {
			var borderColor = this.value;
			geojsonLayer.setStyle({ color: borderColor });

			// Met à jour le carré de couleur pour la couleur de bordure
			updateColorPickerDisplay(`borderColor-${layerName}`, `borderColorSquare-${layerName}`, borderColor);
		});

		labelTextColorPicker.addEventListener('input', function () {
			var labelTextColor = this.value;

			// Met à jour le style du label
			updateLabelStyle();  // Appelle la fonction pour mettre à jour le style du label

			// Met à jour le carré de couleur pour la couleur du texte du label
			updateColorPickerDisplay(`labelTextColor-${layerName}`, `labelTextColorSquare-${layerName}`, labelTextColor);
		});

		labelBgColorPicker.addEventListener('input', function () {
			var labelBgColor = this.value;

			// Met à jour le style du label
			updateLabelStyle();  // Appelle la fonction pour mettre à jour le style du label

			// Met à jour le carré de couleur pour la couleur de fond du label
			updateColorPickerDisplay(`labelBgColor-${layerName}`, `labelBgColorSquare-${layerName}`, labelBgColor);
		});

		labelBorderColorPicker.addEventListener('input', function () {
			var labelBorderColor = this.value;

			// Met à jour le style du label
			updateLabelStyle();  // Appelle la fonction pour mettre à jour le style du label

			// Met à jour le carré de couleur pour la couleur de bordure du label
			updateColorPickerDisplay(`labelBorderColor-${layerName}`, `labelBorderColorSquare-${layerName}`, labelBorderColor);
		});
    }
	// Ajouter la couche dans geojsonLayers pour pouvoir la manipuler
	geojsonLayers[layerName] = geojsonLayer;
	enableLayerReordering();
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
// sotable.js : reorganiser
function enableLayerReordering() {
    var layerList = document.getElementById('layerList');

    new Sortable(layerList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function () {
            updateLayerOrder();
        }
    });

    function updateLayerOrder() {
        var layers = Array.from(layerList.children);

        // Créer une liste ordonnée de noms de couches
        var orderedLayerNames = layers.map(layerItem => {
            return layerItem.querySelector("input[type=checkbox]").dataset.layer;
        });

        // Réorganiser les couches sur la carte
        orderedLayerNames.forEach(layerName => {
            // Vérifier si la couche est ajoutée à la carte, et la ramener au premier plan
            if (map.hasLayer(geojsonLayers[layerName])) {
                geojsonLayers[layerName].bringToFront();
            }
        });
    }

  
}

  function exportLayerToXLS(geojsonLayer) {
   	 if (!geojsonLayer) {
   	     console.error("Aucune couche GeoJSON fournie.");
   	     return;
   	 }

  	  // Extraction des features GeoJSON
  	  var features = geojsonLayer.toGeoJSON().features;
    
  	  if (features.length === 0) {
        console.warn("Aucune donnée à exporter.");
        return;
  	  }

  	  // Récupération des noms des colonnes (propriétés du premier objet)
  	  var headers = Object.keys(features[0].properties);

   	 // Création du tableau de données avec l'en-tête en première ligne
  	  var dataArray = [headers]; // Première ligne = titres des colonnes

 	   // Remplissage avec les valeurs de chaque feature
 	   features.forEach(feature => {
 	       var row = headers.map(header => feature.properties[header] || ""); // Valeur ou vide
  	      dataArray.push(row);
  	  });

  	  // Appel de la fonction d'export vers Excel
  	  exportToExcel(dataArray);
    }


function showLayerTable(geojsonLayer) {
    // Vérifier si le GeoJSON contient des données
    var features = geojsonLayer.toGeoJSON().features;
    if (features.length === 0) {
        alert("Aucune donnée disponible !");
        return;
    }

    // Récupérer les noms des colonnes (propriétés du premier élément GeoJSON)
    var properties = Object.keys(features[0].properties);

    // Création du tableau HTML
    var tableHtml = `<table id="dataTable" class="customDataTableWrapper">
                        <thead>
                            <tr>`;
    
    // Ajouter les en-têtes du tableau
    properties.forEach(prop => {
        tableHtml += `<th>${prop}</th>`;
    });

    tableHtml += `       </tr>
                        </thead>
                        <tbody>`;

    // Ajouter les lignes de données
    features.forEach(feature => {
        tableHtml += `<tr>`;
        properties.forEach(prop => {
            tableHtml += `<td>${feature.properties[prop] || ""}</td>`;
        });
        tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;

    // Vérifier si l'overlay existe déjà pour éviter les doublons
    if (document.getElementById("tableOverlay")) {
        document.getElementById("tableOverlay").remove();
    }

    // Création de l'overlay
    var overlay = document.createElement("div");
    overlay.id = "tableOverlay";
    overlay.classList.add("hidden"); // Ajout d'une classe temporaire pour préparer l'animation
    overlay.innerHTML = `
        <div id="tableContainer">
            <button id="closeTable">❌ Fermer</button>
            <button id="exportButton">📥 Exporter</button>
            <div id="tableSousContainerContainer">
                ${tableHtml}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Forcer un repaint pour s'assurer que l'animation fonctionne
    requestAnimationFrame(() => {
        overlay.classList.remove("hidden");
        overlay.classList.add("active");
    });

    // Attacher un gestionnaire d'événements pour fermer et exporter
    document.getElementById("closeTable").addEventListener("click", closeLayerTable);
    document.getElementById("exportButton").addEventListener("click", function() {
        exportLayerToXLS(geojsonLayer);
    });
}

// Fonction pour fermer le tableau avec animation
function closeLayerTable() {
    var overlay = document.getElementById("tableOverlay");
    if (overlay) {
        overlay.classList.remove("active");
        overlay.classList.add("hidden"); 

        // Supprimer l'overlay après la fin de la transition
        setTimeout(() => {
            overlay.remove();
        }, 500); // Doit correspondre à la durée de transition CSS
    }
}

function renseignerLabel(label, geojsonLayer) {
    // Réinitialiser les options de la liste avant de la remplir
    label.innerHTML = "";

    // Créer une option vide (si tu veux laisser la possibilité de ne rien sélectionner)
    var defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Sélectionner une catégorie";
    label.appendChild(defaultOption);

    // Obtenir toutes les clés uniques des propriétés des objets dans geojsonLayer
    var keys = new Set(); // Utilisation d'un Set pour éviter les doublons

    geojsonLayer.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties) {
            for (var key in layer.feature.properties) {
                if (layer.feature.properties.hasOwnProperty(key)) {
                    keys.add(key);  // Ajoute chaque clé dans le Set
                }
            }
        }
    });

    // Ajouter les clés comme options dans le label
    keys.forEach(function(key) {
        var option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        label.appendChild(option);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    if (typeof map !== "undefined" && map !== null) {
        addGeoJSONUploadControl(map);
    } else {
        console.error("Erreur : La carte (map) n'est pas définie !");
    }
	
});