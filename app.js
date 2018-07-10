var map = L.map('map').setView([49.1330267,9.2655071], setInitialZoom());
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.osm.org">OpenStreetMap</a> | <a href="https://www.twitter.com/dahilzen">David Hilzendegen</a>'
}).addTo(map);
map.scrollWheelZoom.disable();
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.zoomControl.remove();

var bikeIcon = L.icon({
    iconUrl: './icons/bike.svg',
    iconSize: [40, 40], // size of the icon
    iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
});

var autoIcon = L.icon({
    iconUrl: './icons/auto.svg',
    iconSize: [30, 30], // size of the icon
    iconAnchor: [15, 15], // point of the icon which will correspond to marker's location
});

var bahnIcon = L.icon({
    iconUrl: './icons/bahn.svg',
    iconSize: [30, 30], // size of the icon
    iconAnchor: [15, 15], // point of the icon which will correspond to marker's location
});

var rennradIcon = L.icon({
    iconUrl: './icons/rennrad.svg',
    iconSize: [40, 40], // size of the icon
    iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
});

var greenIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// var origin = L.marker([49.1296570,9.3228420]).addTo(map);
// var destination = L.marker([49.138696, 9.219295], { icon: greenIcon }).addTo(map);

var auto_data = d3.csv('./data/auto.csv');
var bahn_data = d3.csv('./data/bahn.csv');
var e_bike_data = d3.csv('./data/e_bike.csv');
var rennrad_data = d3.csv('./data/rennrad.csv');

Promise.all([auto_data, bahn_data, e_bike_data, rennrad_data]).then(function(raw_data) {


    function draw() {
        var auto = raw_data[0];
        var bahn = raw_data[1];
        var bike = raw_data[2];
        var rennrad = raw_data[3];

        var origin = L.marker([auto[0].lat, auto[0].lon]).addTo(map);
        var destination = L.marker([49.138696, 9.219295], { icon: greenIcon }).addTo(map);

        var polylineGroup;
        var markerGroup;
        var timerInterval;
        var autoInterval;
        var bikeInterval;
        var rennradInterval;
        var bahnInterval;
        var totalSeconds = 0;

        polylineGroup = L.layerGroup().addTo(map);
        markerGroup = L.layerGroup().addTo(map);

        var polylines = [];
        for (var i = raw_data.length - 1; i >= 0; i--) {
            var colors = ['#d7191c', '#fdae61', '#abd9e9', '#2c7bb6'];
            polylines[i] = new L.polyline([], {
                color: colors[i],
                smoothFactor: 0.7,
                noClip: false,
            }).addTo(polylineGroup);
        }

        function playInterval(data, i, temp, icon) {
            var j = -1;
            var marker = L.marker([data[i].lat, data[i].lon], { icon: icon });
            marker.addTo(markerGroup);
            var id = marker._leaflet_id;
            setInterval(function() {
                j++;
                if (j < data.length) {
                    marker.setLatLng([data[j].lat, data[j].lon]).update();
                    polylines[i].addLatLng([data[j].lat, data[j].lon]);
                } else {
                    map.removeLayer(markerGroup._layers[id]);
                }
            }, temp);
        }

        var secondsLabel = document.getElementById('counterSec');

        function setTime() {
            if (totalSeconds < 40) {
                ++totalSeconds;
                secondsLabel.innerHTML = pad(totalSeconds % 60);
            } else {
                document.getElementById('startText').innerHTML = 'Nochmal!';
                document.getElementById('start').style.display = 'block';
                document.getElementById('start').onclick = startAgain;
            }
        }

        function pad(val) {
            var valString = val + '';
            if (valString.length < 2) {
                return '0' + valString;
            } else {
                return valString;
            }
        }

        document.getElementById('start').style.display = 'none';
        timerInterval = setInterval(setTime, 1000);
        autoInterval = playInterval(auto, 0, 23, autoIcon);
        bikeInterval = playInterval(bike, 2, 17, bikeIcon);
        rennradInterval = playInterval(rennrad, 3, 18, rennradIcon);
        bahnInterval = playInterval(bahn, 1, 22, bahnIcon);

        function startAgain() {
            clearInterval(timerInterval);
            clearInterval(autoInterval);
            clearInterval(bikeInterval);
            clearInterval(rennradInterval);
            clearInterval(bahnInterval);
            totalSeconds = 0;
            document.getElementById('start').style.display = 'none';
            map.removeLayer(markerGroup);
            map.removeLayer(polylineGroup);
            draw();
        }
    }

    document.getElementById('start').onclick = draw;

});

function setInitialZoom() {
    var viewportWidth = window.innerWidth;
    var initZoom;
    if (viewportWidth < [400]) {
        initZoom = 11;
    } else {
        initZoom = 12;
    }
    return initZoom;
}
