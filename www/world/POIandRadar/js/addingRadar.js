// implementation of AR-Experience (aka "World")
var World = {
	// requesting data periodically
	isRequestingData: false,

	// true once data was fetched
	initiallyLoadedData: false,

	// different POI-Marker assets
	markerDrawable_idle: null,
	markerDrawable_selected: null,
	markerDrawable_directionIndicator: null,

	// list of AR.GeoObjects that are currently shown in the scene / World
	markerList: [],

	// The last selected marker
	currentMarker: null,

	locationUpdateCounter: 0,
	updatePlacemarkDistancesEveryXLocationUpdates: 20,

	// called to inject new POI data
	loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {
		// show radar
		PoiRadar.show();

		// empty list of visible markers
		World.markerList = [];

		// start loading marker assets
		World.markerDrawable_idle = new AR.ImageResource("assets/customer.png");
		World.markerDrawable_selected = new AR.ImageResource("assets/selected.png");
		World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		// loop through POI-information and create an AR.GeoObject (=Marker) per POI
		for (var currentPlaceNr = 0; currentPlaceNr < poiData.length; currentPlaceNr++) {
			var singlePoi = {
				"id": poiData[currentPlaceNr].id,
				"latitude": parseFloat(poiData[currentPlaceNr].latitude),
				"longitude": parseFloat(poiData[currentPlaceNr].longitude),
				"title": poiData[currentPlaceNr].name,
				"description": poiData[currentPlaceNr].description
			};
			World.markerList.push(new Marker(singlePoi));
		}
		// updates distance information of all placemarks
		World.updateDistanceToUserValues();
		World.updateStatusMessage(currentPlaceNr + ' places loaded');
	},

	// sets/updates distances of all makers so they are available way faster than calling (time-consuming) distanceToUser()
	// method all the time
	updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
		for (var i = 0; i < World.markerList.length; i++) {
			World.markerList[i].distanceToUser = World.markerList[i].markerObject.locations[0].distanceToUser();
		}
	},

	// updates status message shon in small "i"-button aligned bottom center
	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {
		var themeToUse = isWarning ? "e" : "c";
		var iconToUse = isWarning ? "alert" : "info";

		document.getElementById("status-message").innerHTML = message;
		$("#popupInfoButton").buttonMarkup({
			theme: themeToUse
		});
		$("#popupInfoButton").buttonMarkup({
			icon: iconToUse
		});
	},

	// location updates, fired every time you call architectView.setLocation() in native environment
	locationChanged: function locationChangedFn(lat, lon, alt, acc) {
		// request data if not already present
		if (!World.initiallyLoadedData) {
			World.requestDataFromServer();
			World.initiallyLoadedData = true;
		} else if (World.locationUpdateCounter === 0) {
			World.updateDistanceToUserValues();
		}
		// helper used to update placemark information every now and then
		World.locationUpdateCounter = (++World.locationUpdateCounter % World.updatePlacemarkDistancesEveryXLocationUpdates);
	},

	// fired when user pressed maker in cam
	onMarkerSelected: function onMarkerSelectedFn(marker) {
		World.currentMarker = marker;
		// update panel values
		document.getElementById("poi-detail-title").innerHTML = marker.poiData.title;
		document.getElementById("poi-detail-description").innerHTML = marker.poiData.description;

		var distanceToUserValue = (marker.distanceToUser > 999) ? ((marker.distanceToUser / 1000).toFixed(2) + " km") : (Math.round(marker.distanceToUser) + " m");
		$("#poi-detail-distance").html(distanceToUserValue);

		// show panel
		$("#panel-poidetail").panel("open", 123);

		$( ".ui-panel-dismiss" ).unbind("mousedown");

		$("#panel-poidetail").on("panelbeforeclose", function(event, ui) {
			World.currentMarker.setDeselected(World.currentMarker);
		});
	},

	// returns distance in meters of placemark with maxdistance * 1.1
	getMaxDistance: function getMaxDistanceFn() {
		// sort palces by distance so the first entry is the one with the maximum distance
		World.markerList.sort(World.sortByDistanceSortingDescending);

		// use distanceToUser to get max-distance
		var maxDistanceMeters = World.markerList[0].distanceToUser;

		// return maximum distance times some factor >1.0 so ther is some room left and small movements of user don't cause places far away to disappear
		return maxDistanceMeters * 1.1;
	},

	// request POI data
	requestDataFromServer: function requestDataFromServerFn() {
		// set helper var to avoid requesting places while loading
		World.isRequestingData = true;
		World.updateStatusMessage('Requesting places from web-service');
		/*ws = new WebSocket('ws://192.168.1.246:8100');
		var connected = false;
		ws.onopen = function() { ws.send("0"); };
		ws.onmessage = function(evt) {
    		var receivedmsg = evt.data;
    		var punti = receivedmsg.split(",");
    		var jsonString = "[";
    		// Creo i clienti
    		var count = 0;
    		for (var i = 0; i < punti[0]; i++) {
        		jsonString += '{"id":"' + count + '",';
        		jsonString += '"longitude":"' + punti[2+2*i] + '",';
        		jsonString += '"latitude":"' + punti[2+2*i+1] + '",';
        		jsonString += '"description":"Io sono il cliente numero ' + count + '",';
        		jsonString += '"name":"Cliente' + count + '"},';
        		count++;
    		}
    		// Creo i magazzini
    		count = 0;
    		for (i = 0; i < punti[1]; i++) {
        		jsonString += '{"id":"' + count + '",';
        		jsonString += '"longitude":"' + punti[2+2*i] + '",';
        		jsonString += '"latitude":"' + punti[2+2*i+1] + '",';
        		jsonString += '"description":"Io sono il magazzino numero ' + count + '",';
        		jsonString += '"name":"Magazzino' + count + '"},';
        		count++;
    		}
    		jsonString = jsonString.substring(0, jsonString.length-1);
    		jsonString += "]";
    		var json = eval("(" + jsonString + ")");
    		World.loadPoisFromJsonData(json);
    		World.isRequestingData = false;
    		connected = true;
		};
		ws.onclose = function() { connected = false; };
		ws.onerror = function(evt) { connected = false; alert("Connection Error!"); };*/

		/* for debugging */
		var debug = '[{"id":"0","longitude":"12.252951","latitude":"44.1378702","description":"Io sono il cliente numero 0","name":"Cliente0"},{"id":"1","longitude":"12.2321549","latitude":"44.1402399","description":"Io sono il cliente numero 1","name":"Cliente1"},{"id":"2","longitude":"12.2533117","latitude":"44.1294131","description":"Io sono il cliente numero 2","name":"Cliente2"},{"id":"3","longitude":"12.237062","latitude":"44.1351151","description":"Io sono il cliente numero 3","name":"Cliente3"},{"id":"4","longitude":"12.2592663","latitude":"44.1446703","description":"Io sono il cliente numero 4","name":"Cliente4"},{"id":"5","longitude":"12.2461593","latitude":"44.1332738","description":"Io sono il cliente numero 5","name":"Cliente5"},{"id":"6","longitude":"12.2522607","latitude":"44.1397998","description":"Io sono il cliente numero 6","name":"Cliente6"},{"id":"7","longitude":"12.2270857","latitude":"44.1434641","description":"Io sono il cliente numero 7","name":"Cliente7"},{"id":"8","longitude":"12.2661842","latitude":"44.1425653","description":"Io sono il cliente numero 8","name":"Cliente8"},{"id":"9","longitude":"12.237062","latitude":"44.1351151","description":"Io sono il cliente numero 9","name":"Cliente9"},{"id":"10","longitude":"12.2605706","latitude":"44.1389802","description":"Io sono il cliente numero 10","name":"Cliente10"},{"id":"11","longitude":"12.2598954","latitude":"44.1424724","description":"Io sono il cliente numero 11","name":"Cliente11"},{"id":"12","longitude":"12.237062","latitude":"44.1351151","description":"Io sono il cliente numero 12","name":"Cliente12"},{"id":"13","longitude":"12.2529454","latitude":"44.1380345","description":"Io sono il cliente numero 13","name":"Cliente13"},{"id":"14","longitude":"12.2568289","latitude":"44.137742","description":"Io sono il cliente numero 14","name":"Cliente14"},{"id":"15","longitude":"12.2695579","latitude":"44.1364605","description":"Io sono il cliente numero 15","name":"Cliente15"},{"id":"16","longitude":"12.2317358","latitude":"44.1429455","description":"Io sono il cliente numero 16","name":"Cliente16"},{"id":"17","longitude":"12.232518","latitude":"44.1403823","description":"Io sono il cliente numero 17","name":"Cliente17"},{"id":"18","longitude":"12.2263123","latitude":"44.138966","description":"Io sono il cliente numero 18","name":"Cliente18"},{"id":"19","longitude":"12.2710257","latitude":"44.1329075","description":"Io sono il cliente numero 19","name":"Cliente19"},{"id":"20","longitude":"12.2427071","latitude":"44.146422","description":"Io sono il cliente numero 20","name":"Cliente20"},{"id":"21","longitude":"12.2538489","latitude":"44.1341286","description":"Io sono il cliente numero 21","name":"Cliente21"},{"id":"22","longitude":"12.237062","latitude":"44.1351151","description":"Io sono il cliente numero 22","name":"Cliente22"},{"id":"23","longitude":"12.2197924","latitude":"44.145285","description":"Io sono il cliente numero 23","name":"Cliente23"},{"id":"24","longitude":"12.2241345","latitude":"44.145802","description":"Io sono il cliente numero 24","name":"Cliente24"},{"id":"25","longitude":"12.2260294","latitude":"44.1349448","description":"Io sono il cliente numero 25","name":"Cliente25"},{"id":"26","longitude":"12.2356047","latitude":"44.1437037","description":"Io sono il cliente numero 26","name":"Cliente26"},{"id":"27","longitude":"12.2372756","latitude":"44.1373593","description":"Io sono il cliente numero 27","name":"Cliente27"},{"id":"28","longitude":"12.2420596","latitude":"44.1328336","description":"Io sono il cliente numero 28","name":"Cliente28"},{"id":"29","longitude":"12.237062","latitude":"44.1351151","description":"Io sono il cliente numero 29","name":"Cliente29"},{"id":"30","longitude":"12.2307069","latitude":"44.1315764","description":"Io sono il cliente numero 30","name":"Cliente30"},{"id":"31","longitude":"12.2532947","latitude":"44.146953","description":"Io sono il cliente numero 31","name":"Cliente31"},{"id":"32","longitude":"12.2337594","latitude":"44.143115","description":"Io sono il cliente numero 32","name":"Cliente32"},{"id":"33","longitude":"12.237062","latitude":"44.1351151","description":"Io sono il cliente numero 33","name":"Cliente33"},{"id":"34","longitude":"12.2177031","latitude":"44.1398326","description":"Io sono il cliente numero 34","name":"Cliente34"},{"id":"35","longitude":"12.2631599","latitude":"44.1437716","description":"Io sono il cliente numero 35","name":"Cliente35"},{"id":"36","longitude":"12.2456984","latitude":"44.1402689","description":"Io sono il cliente numero 36","name":"Cliente36"},{"id":"37","longitude":"12.2350828","latitude":"44.1473579","description":"Io sono il cliente numero 37","name":"Cliente37"},{"id":"38","longitude":"12.2327921","latitude":"44.1350572","description":"Io sono il cliente numero 38","name":"Cliente38"},{"id":"39","longitude":"12.2427344","latitude":"44.1310806","description":"Io sono il cliente numero 39","name":"Cliente39"},{"id":"0","longitude":"12.252951","latitude":"44.1378702","description":"Io sono il magazzino numero 0","name":"Magazzino0"},{"id":"1","longitude":"12.2321549","latitude":"44.1402399","description":"Io sono il magazzino numero 1","name":"Magazzino1"},{"id":"2","longitude":"12.2533117","latitude":"44.1294131","description":"Io sono il magazzino numero 2","name":"Magazzino2"},{"id":"3","longitude":"12.237062","latitude":"44.1351151","description":"Io sono il magazzino numero 3","name":"Magazzino3"},{"id":"4","longitude":"12.2592663","latitude":"44.1446703","description":"Io sono il magazzino numero 4","name":"Magazzino4"}]';
		World.loadPoisFromJsonData(eval("(" + debug + ")"));
		/****************/
		World.isRequestingData = false;
	},

	// helper to sort places by distance
	sortByDistanceSorting: function(a, b) {
		return a.distanceToUser - b.distanceToUser;
	},

	// helper to sort places by distance, descending
	sortByDistanceSortingDescending: function(a, b) {
		return b.distanceToUser - a.distanceToUser;
	}

};

/* display POIs even if they are far away (def 50000) */
AR.context.scene.cullingDistance = 200000;
/* forward locationChanges to custom function */
AR.context.onLocationChanged = World.locationChanged;