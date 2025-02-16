var map;
var layerControl;
var marker;
var layerSwitcher;

// Appel de la fonction go() après la configuration de l'API Géoportail
Gp.Services.getConfig({
    apiKey: "essentiels",  // Remplacez par votre clé API
    onSuccess: go
});


function go() {
    // Initialisation de la carte avec Leaflet
    map = L.map('map').setView([48.845, 2.424], 5);
	
	
    var lyrOrtho = L.geoportalLayer.WMTS(
		{
        layer: "HR.ORTHOIMAGERY.ORTHOPHOTOS",
		},
		{
			opacity: 0.7,
			transparent: true,
			minZoom: 1,
			maxZoom: 19
		}
	);

    var lyrMaps = L.geoportalLayer.WMTS(
		{
        layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
		},
		{
			opacity: 0.7,
			transparent: true,
			minZoom: 1,
			maxZoom: 19
		}	
	);

    // Ajout de la couche WMS "peigeo:pos_plu" à partir de GeoServer
    var wmsLayerPeigeo = L.tileLayer.wms("http://peigeo.re:8080/geoserver/wms", {
        layers: "peigeo:pos_plu", // Nom de la couche
        format: "image/png", // Format de l'image
        transparent: true, // Transparence
        version: "1.1.1", // Version du WMS
        attribution: "© PEIGEO - GeoServer"
    });


    // Ajout de la couche WMS à la carte
    map.addLayer(wmsLayerPeigeo);
    

    // Ajout des couches à la carte
    map.addLayer(lyrOrtho);
    map.addLayer(lyrMaps);

    // Ajout du sélecteur de fond de carte (LayerSwitcher)
    layerSwitcher = L.geoportalControl.LayerSwitcher({
        layers: [{
            layer: lyrOrtho,
            config: {
                title: "Orthophoto",
                description: "Couche Orthophoto",
				visibility: false
            }
        }, {
            layer: lyrMaps,
            config: {
                title: "Carte Géographique",
                description: "Couche carte géographique",
				visibility: true
            }
        }, {
            layer: wmsLayerPeigeo,
            config: {
                title: "POS PLU - PEIGEO",
                description: "Couche POS PLU de PEIGEO",
				visibility: false
            }
        }]
    });
    map.addControl(layerSwitcher);

    var search = L.geoportalControl.SearchEngine({
        displayMarker: true,
        displayInfo: true,
        zoomTo: 16,
        displayAdvancedSearch: true,
    });

    // altitude et coordonnees d'un point
    var mpCtrl = L.geoportalControl.MousePosition({
    });
    map.addControl(mpCtrl);

    // profil altimetrique
    var ep = L.geoportalControl.ElevationPath({
    });
    map.addControl(ep);
	
	
	
	
	
    //var drawnItems = new L.FeatureGroup();
    //map.addLayer(drawnItems);

    //var drawControl = new L.Control.Draw({
    //	edit: { featureGroup: drawnItems }
    //});
    //map.addControl(drawControl);

    //map.on('draw:created', function (e) {
    //	drawnItems.addLayer(e.layer);
    //});
	
	
    map.addControl(search);
    ajouterMesureGeoman(map);
    addGeoJSONUploadControl(map, layerControl);
    addSelectArea(map);
	

    InitialiseCouches(map,couchesBases);
	
	//controle info urbainse sur le point
	addControlInfo(map);
	
	//fonction sauvegardee
	//addSauvegarde();
	foolScreen(map);
	
}


function ajouterMesureGeoman(carte) {
    if (!carte) {
        console.error("La carte Leaflet est invalide.");
        return;
    }

    // Ajouter les outils de dessin Geoman
    carte.pm.addControls({
        position: 'topleft',
        drawMarker: false,
        drawPolyline: true,
        drawRectangle: false,
        drawPolygon: true,
        drawCircle: false,
        drawCircleMarker: false,
        cutPolygon: false,
        editMode: false,
        dragMode: false,
        removalMode: true,
		rotateMode: false,
		drawText: false,
    });

    // Quand un élément est créé (ligne ou polygone)
    carte.on('pm:create', (e) => {
        let layer = e.layer;
        let mesure = '';
        let couleur = 'black'; // Couleur par défaut

        // Vérifier si c'est une ligne (Polyline)
        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
			let latlngs = layer.getLatLngs();
			let longueur = 0;

			// Gérer les multi-polylignes
			if (Array.isArray(latlngs[0])) {
				latlngs = latlngs.flat(); // Aplatir si plusieurs segments
			}

			// Calcul de la distance totale
			for (let i = 0; i < latlngs.length - 1; i++) {
				longueur += latlngs[i].distanceTo(latlngs[i + 1]);
			}

			// Affichage en m si < 1500, sinon en km
			if (longueur < 1500) {
				mesure = `Longueur : <strong>${longueur.toFixed(0)} m</strong>`;
			} else {
				mesure = `Longueur : <strong>${(longueur / 1000).toFixed(2)} km</strong>`;
			}
		}

        // Vérifier si c'est un polygone
        if (layer instanceof L.Polygon) {
			let latlngs = layer.getLatLngs()[0]; // Récupérer l’anneau extérieur
			let aire = L.GeometryUtil.geodesicArea(latlngs); // Surface en m²

			// Affichage en m² si < 10 000, sinon en ha
			if (aire < 10000) {
				mesure = `Surface : <strong>${aire.toFixed(0)} m²</strong>`;
			} else {
				mesure = `Surface : <strong>${(aire / 10000).toFixed(2)} ha</strong>`;
			}
		}


        // Ajouter une popup avec le contenu de mesure
        if (mesure) {
            layer.bindPopup(
				`<div class="popup-container">
					<div class="popup-title">📏 Mesure</div>
					<div class="popopup-content">${mesure}</div>
				</div>`
			)
            .openPopup()
            .getPopup()
            ._contentNode.classList.add("popopup-content", "pocustom-popup"); // Ajout des classes CSS personnalisées
        }
    });
	
	
}


