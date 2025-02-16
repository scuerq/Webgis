

function foolScreen(map){
		
		let fullscreenButton = L.control({ position: 'topleft' });

		fullscreenButton.onAdd = function () {
			let div = L.DomUtil.create('div', 'leaflet-control leaflet-control-fullscreen');
			div.innerHTML = '⛶'; // Icône simple

			div.onclick = function () {
				toggleFullScreen(div);
			};

			return div;
			
		};

		fullscreenButton.addTo(map);
}

function toggleFullScreen(button) {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
		button.classList.add('active'); // Change l'apparence du bouton
	} else {
		document.exitFullscreen();
		button.classList.remove('active'); // Retour à l'état normal
	}
}