var areaSelection;

function addSelectArea(map) {
    // Ajouter le contrôle à la carte avec configuration
    areaSelection = new window.leafletAreaSelection.DrawAreaSelection({
        active: false, // Le plugin commence comme actif
        fadeOnActivation: true, // La carte est partiellement estompée lors du dessin
        onPolygonReady: function(polygon, control) {
            var elementsTrouves = getElementsInPolygon(poiSearchLayerGroup, polygon);
	    bindPopupHtml(polygon, elementsTrouves);
	},
        onButtonActivate: function (control, event) {
            console.log("Le bouton d'activation a été cliqué");
        },
        onButtonDeactivate: function (polygon, control, event) {
            console.log("Le bouton de désactivation a été cliqué");
        }
    });

    // Ajouter le contrôle à la carte
    areaSelection.addTo(map);

}

function getElementsInPolygon(poiSearchLayerGroup, polygon) {
    var results = [];

    try {
        if (!poiSearchLayerGroup || !polygon) {
            console.error("Erreur : groupe de couches ou polygone invalide !");
            return results;
        }

        var polygonGeoJSON = polygon.toGeoJSON();

        // Récupérer les sous-couches de poiSearchLayerGroup
        Object.values(poiSearchLayerGroup._layers).forEach(layerGroup => {
            if (!layerGroup._layers) return; // Vérifier si c'est bien un groupe de couches

            Object.values(layerGroup._layers).forEach(layer => {
                try {
                    if (!layer.feature) return; // Ignorer les couches sans GeoJSON
			
 	  	    if (!layer._map) return; 

                    var layerGeoJSON = layer.toGeoJSON();

                    // Vérifier si l'élément est dans le polygone
                    if (turf.booleanIntersects(layerGeoJSON, polygonGeoJSON)) {
                        results.push({
                            type: layerGeoJSON.geometry.type,
                            popupContent: layer.getPopup() ? layer.getPopup().getContent() : "Pas de popup",
                            properties: layer.feature.properties || {}, // Récupérer les données GeoJSON
                            coordinates: layerGeoJSON.geometry.coordinates
                        });
                    }
                } catch (err) {
                    console.error("Erreur sur une couche:", err);
                }
            });
        });

    } catch (err) {
        console.error("Erreur dans getElementsInPolygon:", err);
    }

    console.log("Éléments trouvés dans le polygone:", results);
    return results;
}


function generatePropertiesTable(results) {
    // Si `results` est vide ou non défini
    if (!results || results.length === 0) {
        return "<p>Aucune donnée disponible</p>"; // Message si aucune donnée
    }

    // Début du tableau HTML
    let tableHtml = "<table id='propertiesTable' class='table table-bordered table-striped'>";
    tableHtml += "<thead><tr>";
    
    // Récupère toutes les clés (propriétés) des premiers objets de `results`
    let propertiesKeys = Object.keys(results[0][0].properties); 
    
    // Créer les en-têtes du tableau (les clés des propriétés)
    propertiesKeys.forEach(key => {
        tableHtml += `<th>${key}</th>`;
    });
    tableHtml += "</tr></thead><tbody>";

    // Ajouter les données dans les lignes du tableau (pour chaque objet dans `results`)
    results[0].forEach(result => {
        tableHtml += "<tr>";
        propertiesKeys.forEach(key => {
            // Ajouter les valeurs des propriétés dans les cellules
            tableHtml += `<td>${result.properties[key] || "N/A"}</td>`;
        });
        tableHtml += "</tr>";
    });

    tableHtml += "</tbody></table>";

    return tableHtml;
}


// Fonction pour afficher un popup avec un titre, un tableau de propriétés et un bouton d'export
function bindPopupHtml(polygon, result) {
    // Générer le tableau des propriétés à partir de "result"
    let propertiesTableHtml = generatePropertiesTable([result]);  // Passer "result" sous forme de tableau à la fonction
	
	// Vérifier si result et result.properties existent avant d'accéder à layerType
    let layerType = result[0].properties.layerType || "Données du Polygone";
        
     // Créer le contenu du popup avec la liste déroulante, le tableau et un bouton "export"
    let popupContent = `
        
        <div class="titre">
			<strong>${layerType}</strong>
		</div>
        <div style="max-height: 300px; overflow-y: auto;">
            ${propertiesTableHtml}
        </div>
        <button id="exportBtn" class="btn btn-primary mt-2">Export</button>
    `;


    // Créer et afficher un popup sur la carte
    L.popup()
        .setLatLng(polygon.getBounds().getCenter())  // Placer le popup au centre du polygone
        .setContent(popupContent)  // Ajouter le contenu du popup
        .openOn(map);  // Afficher le popup sur la carte

    // Initialiser DataTables sur le tableau
    $(document).ready(function() {
        $('#propertiesTable').DataTable();  // Initialiser DataTables sur le tableau
    });

    document.getElementById('exportBtn').addEventListener('click', function() {
		exportDataTable();
	});
}


// 📌 **Export Excel (XLSX)**
function exportToExcel(dataArray) {
    let wb = XLSX.utils.book_new(); // Créer un nouveau fichier Excel
    let ws = XLSX.utils.json_to_sheet(dataArray); // Convertir les données en feuille Excel

    XLSX.utils.book_append_sheet(wb, ws, "Données"); // Ajouter la feuille au fichier
    
    XLSX.writeFile(wb, "exported_data.xlsx");
}

// 📌 **Export DataTables**
function exportDataTable() {
    let table = $('#propertiesTable').DataTable();
    let dataArray = [];
    
    // Récupération des en-têtes
    let headers = [];
    $('#propertiesTable thead th').each(function () {
        headers.push($(this).text().trim());
    });
    
    // Récupération des données
    table.rows().every(function () {
        let row = {};
        $(this.node()).find('td').each(function (index) {
            row[headers[index]] = $(this).text().trim();
        });
        dataArray.push(row);
    });
    
    exportToExcel(dataArray);
}
