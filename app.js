 
// import { db } from './geolocation.js';
 var map = L.map('map').setView([60.192059, 24.945831], 12);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'yehwansong/ckiovi1pb3dfy17norix45qwe',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoieWVod2Fuc29uZyIsImEiOiJjbGdmbXdkMGswMzQ5M3FvMndnbGQ5OGs2In0.ICVnACmdiSBYQjgYkPqDvw'
}).addTo(map);

var markers = [];
var algo = []
console.log(db.features)
for (var i = db.features.length - 1; i >= 0; i--) {
	markers.push(
		{    
			position: [db.features[i].properties.lat, db.features[i].properties.lon],
		    title: '',
		    description: ''
		}
	)
  algo.push([db.features[i].properties.lat, db.features[i].properties.lon])
}
console.log(algo)

markers.forEach(function(marker) {
  var newMarker = L.marker(marker.position).addTo(map);

  newMarker.bindPopup(marker.description);

  var markerElement = document.createElement('div');
  markerElement.className = 'marker';
  markerElement.style.top = map.latLngToLayerPoint(marker.position).y + 'px';
  markerElement.style.left = map.latLngToLayerPoint(marker.position).x + 'px';
  document.getElementById('markers').appendChild(markerElement);

  newMarker.on('click', function() {
    alert(marker.description);
  });
});