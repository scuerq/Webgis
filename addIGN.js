function addControlInfo(map) {
    // Définir un contrôle personnalisé
    let infoControl = L.Control.extend({
        options: {
            position: 'topright' // Position du contrôle
        },

        onAdd: function () {
            // Création du bouton avec le point d'interrogation
            let container = L.DomUtil.create('div', 'leaflet-control-question');
            container.innerHTML = '?'; // Affiche un point d'interrogation

            // Empêcher la propagation des événements de la carte sur ce contrôle
            L.DomEvent.disableClickPropagation(container);

            // Créer un élément span pour afficher le texte lors du survol
            let infoText = L.DomUtil.create('span', 'info-text');
            infoText.innerHTML = 'Activer click-requête urba.'; // Le texte de l'infobulle

            // Ajouter le texte à l'intérieur du contrôle
            container.appendChild(infoText);

            // Variable pour suivre l'état (true = activé, false = désactivé)
            let isActive = false;

            // Ajouter un écouteur d'événements pour gérer le clic
            L.DomEvent.on(container, 'click', function () {
                if (!isActive) {
                    container.style.background = 'yellow'; // Change en jaune
                    enableClickEvent();
					infoText.innerHTML = 'Desactiver click-requête'; 
                } else {
                    container.style.background = 'white'; // Retour à la couleur d'origine
                    disableClickEvent();
					infoText.innerHTML = 'Activer click-requête urba.'; 
                }
                isActive = !isActive; // Inverser l'état
            });

            return container;
        }
    });

    // Ajouter le contrôle à la carte
    map.addControl(new infoControl());
}
   



function enableClickEvent() {
		map.on('click', function(e) {
			var lat = e.latlng.lat;
			var lon = e.latlng.lng;

			getElementFromPoint(lat, lon)
					.then(result => {
						if (result.parcelle) {
							let parcelle = result.parcelle; // Première parcelle trouvée
							let adresse=result.adresse;
							let urba=result.urba;
							
							let content = 
								`<div class="popup-content-class">
									<div class="popup-title">Adresse</div>
									<hr>
									nom de rue: ${adresse.name || "N/A"}<br>
									code postal: ${adresse.postcode || "N/A"}<br>
									Ville: ${adresse.city || "N/A"}<br>
									<hr>
									
									<div class="popup-title">Parcelle Cadastrale</div>
									<hr>
									ID: ${parcelle.id || "N/A"}<br>
									Commune: ${parcelle.city || "N/A"}<br>
									INSEE: ${parcelle.municipalitycode || "N/A"}<br>
									SECTION: ${parcelle.section || "N/A"}<br>
									NUMERO: ${parcelle.number || "N/A"}<br>
									<hr>
									
									<div class="popup-title">Détail Urbanisme</div>
									<hr>
									ZONE URBA :${urba.libelle || "N/A"}<br>
									REGLEMENT : ${urba.urlfic ? `<a href="${urba.urlfic}" target="_blank" rel="noopener noreferrer">Voir le règlement</a>` : "N/A"}
								</div>`;
							L.popup()
								.setLatLng([lat, lon])
								.setContent(content)
								.openOn(map);
						} else {
							L.popup()
								.setLatLng([lat, lon])
								.setContent("Aucune parcelle trouvée.")
								.openOn(map);
						}
					})
					.catch(error => {
						L.popup()
							.setLatLng([lat, lon])
							.setContent("Erreur lors de la récupération des données cadastrales.")
							.openOn(map);
					});
			
		});
	}
	
	function disableClickEvent() {
	  map.off('click'); // Désactive tous les événements 'click' sur la carte
	}

async function getFeatureInfoPOS(lat, lon) {
    return new Promise((resolve, reject) => {
        // Conversion des coordonnées lat, lon (EPSG:4326) en EPSG:2975
        var latLonProj = proj4('EPSG:4326', 'EPSG:2975', [lon, lat]);
        var lon2975 = latLonProj[0];
        var lat2975 = latLonProj[1];

        // Conversion des coordonnées lat, lon en pixels sur la carte
        var point = map.latLngToContainerPoint(L.latLng(lat, lon), map.getZoom());
        var x = Math.round(point.x);
        var y = Math.round(point.y);

        // Récupération de la bounding box actuelle de la carte (en EPSG:4326)
        var bbox = map.getBounds().toBBoxString();
        var width = map.getSize().x;
        var height = map.getSize().y;

        // Conversion de la BBOX de EPSG:4326 à EPSG:2975
        var bboxCoords = bbox.split(',');
        var bboxMin = proj4('EPSG:4326', 'EPSG:2975', [parseFloat(bboxCoords[0]), parseFloat(bboxCoords[1])]);
        var bboxMax = proj4('EPSG:4326', 'EPSG:2975', [parseFloat(bboxCoords[2]), parseFloat(bboxCoords[3])]);

        var bbox2975 = [
            bboxMin[0], bboxMin[1],
            bboxMax[0], bboxMax[1]
        ];
	
        // URL de la requête GetFeatureInfo avec les bonnes coordonnées en EPSG:2975
        var url = `http://peigeo.re:8080/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=peigeo:pos_plu&QUERY_LAYERS=peigeo:pos_plu&INFO_FORMAT=application/json&I=${x}&J=${y}&WIDTH=${width}&HEIGHT=${height}&CRS=EPSG:2975&BBOX=${bbox2975.join(',')}`;
	
	    
        // Envoi de la requête GetFeatureInfo
        $.getJSON(url)
	    .done(function (data) {
	        if (data && data.features && data.features.length > 0) {
	            resolve(data.features[0].properties);
	        } else {
	            reject(new Error("Aucune donnée trouvée."));
	        }
	    })
	    .fail(function (jqXHR, textStatus, errorThrown) {
	        reject(new Error(`Erreur requête GetFeatureInfo: ${textStatus} - ${errorThrown}`));
	    });
    });
}

async function getElementFromPoint(lat, lon) {
    let resultData = {}; // Objet pour stocker les résultats

    try {
        // Récupération des infos cadastrales
        let parcelleResult = await new Promise((resolve, reject) => {
            Gp.Services.reverseGeocode({
                position: { x: lon, y: lat },
                filterOptions: { type: ["CadastralParcel"] },
                onSuccess: function (result) {
                    resolve(result.locations.length > 0 ? result.locations[0].placeAttributes : {});
                },
                onFailure: function (error) {
                    console.error("Erreur parcelle :", error);
                    reject(error);
                }
            });
        });

        // Récupération des infos d'adresse
        let adresseResult = await new Promise((resolve, reject) => {
            Gp.Services.reverseGeocode({
                position: { x: lon, y: lat },
                filterOptions: { type: ["StreetAddress"] },
                onSuccess: function (result) {
                    resolve(result.locations.length > 0 ? result.locations[0].placeAttributes : {});
                },
                onFailure: function (error) {
                    console.error("Erreur adresse :", error);
                    reject(error);
                }
            });
        });

        // Récupération des infos urbanisme
        let urbaResult = await getFeatureInfoPOS(lat, lon); // Ici, on attend la promesse

        // Stockage des résultats
        resultData.parcelle = parcelleResult;
        resultData.adresse = adresseResult;
        resultData.urba = urbaResult;

        return resultData; // Retourne les résultats
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        throw error; // Relance l'erreur pour la gestion en dehors
    }
}
