/* 
 * Get users current location
 */
 var firstLoad, cinemaDestination;
 homePosition = {};
 cinemaDestination = {};
 document.addEventListener("deviceready", googleReady, false);

/*
 * Function that is called when Google Maps API is ready
 */
 function googleReady() {
    stageComp(1);
    geocoder = new google.maps.Geocoder();
    getLocation();
}

/*
 * get Users Location
 */ 
function getLocation() {
    if (navigator.geolocation) {
        stageComp(2);
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        stageComp(3);
        alert('<h1> The Website will only work if you show your location!</h1>');
    }
}

/*
 * get the latitude and longitude positions
 */
function showPosition(position) {
    stageComp(4);
    homePosition.lat = position.coords.latitude;
    homePosition.lng = position.coords.longitude;
    codeLatLng(parseFloat(homePosition.lat), parseFloat(homePosition.lng));
}

/*
 * get the latitude and longitude positions
 */
function codeLatLng(lat, lng) {
    var latlng, address;
    latlng = new google.maps.LatLng(lat, lng);
    stageComp(5);
    geocoder.geocode({
        'latLng': latlng
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                //formatted address
                stageComp(6);
                firstLoad = true;
                address = results[0].formatted_address;
                NowFlix.Checks.address = address;
                getMovies(address);
                getLatLong(address);
            } else {
                stageComp(7);
                alert("No results found");
            }
        } else {
            stageComp(8);
            alert("Geocoder failed due to: " + status);
        }
    });
}

/*
 * Get the destination nearby
 */
function getLatLong(address) {
    var geo;
    geo = new google.maps.Geocoder;
    $('#mapSection').show();
    geo.geocode({
        'address': address
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            cinemaDestination.lat = results[0].geometry.location.lat();
            cinemaDestination.lng = results[0].geometry.location.lng();
            return results[0].geometry.location;
        } else {
            alert('Something went wrong :( Try again later');
        }
    });
}

/* 
 * This function will send the ajax call to get the json for a movies
 */
function getMovies(loc) {
	var nearLocation;
    /*
     * Make the url compatible
     */
    nearLocation = loc.replace(/ /g, '%2B');
    nearLocation = nearLocation.replace(/'/g, '%2527');
    nearLocation = nearLocation.replace(/,/g, '%252C');
    stageComp(9);
    /*
     * Ajax call to get the location of the user
     */
    $.ajax({
        url: showTimeUrl1 + nearLocation + showTimeUrl2,
        dataType: "jsonp",
        success: buildListofCinemas
    });
}
