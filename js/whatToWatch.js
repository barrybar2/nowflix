/*
 *
 * Developed by: Barry Walsh barry@bwmedia.me Twitter @barrybar2
 * Draft 1: September 1st, 2015. 
 *
 * Steps on how this code works: 
 * 1. get the current location of the user, using Google's API
 * 2. Then using Yahoo's API to turn a html page into JSON, passing in google.com/movies (passing in a destination of current location)
 * 3. From this, we can get the nearest cinema and the cinema times. (We can pass this address in to work out the map directions)
 * 4. Loop through the cinema's showing and call theMovieDB to collect the image posters, ratings etc.
 * 5. Using JS, build up data array/object to be displayed on screen
 * 6. Output the information to the screen 
 */
var loading, geocoder, showTimeUrl1, showTimeUrl2, nearLocation, cinemaName, movieNamesArray, moviesArray, movieCount, cinemaAddress, cinemaDestination, map, key, movieDbUrl, mode, allData, cinemaIndex, cinemaDirection, firstLoad;
showTimeUrl1 = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D'www.google.com%2Fmovies%3Fsort%3D0%26near%3D";
showTimeUrl2 = "'%20&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
movieDbUrl = 'http://api.themoviedb.org/3/';
mode = 'search/movie?query=';
key = '&api_key=1e76801a7b64fc5408edbe0f65790d2b';
moviesArray = [];
moviesStore = [];
movieNamesArray = [];
movieResult = {};
homePosition = {};
cinemaDestination = {};
loading = false;
cinemaIndex = 0;
cinemaDirection = 1; 
firstImage = false,
firstLoad = true;

$(document).ready(function() {
    addCSSEvents();
    $("#arrowLeft").click(function() {
            outputFilms(cinemaDirection - 6);
    });
    $("#arrowRight").click(function() {
            outputFilms(cinemaDirection);
    });
    $("#cinemaWrapLess").click(function() {
            outputFilms(cinemaDirection - 6);
    });
    $("#cinemaWrapMore").click(function() {
            outputFilms(cinemaDirection);
    });
    $('#overlay').click(function() {
            overlay();
    });

});

function addCSSEvents() {
    if (Modernizr.touch) {
        // show the close overlay button
        $(".close-overlay").removeClass("hidden");
        // handle the adding of hover class when clicked
        $(".imageCont").click(function(e){
            if (!$(this).hasClass("hover")) {
                $( ".drag" ).replaceWith('<a class="drag"><i class="fa fa-angle-double-down"></i></a>');
                $(this).addClass("hover");
            } else {
                $( ".drag" ).replaceWith('<a class="drag"><i class="fa fa-angle-double-up"></i></a>');
                $(this).removeClass("hover");
            }
        });
    } else {
        // handle the mouseenter functionality
        $(".imageCont").mouseenter(function(){
            $(this).addClass("hover");
        })
        // handle the mouseleave functionality
        .mouseleave(function(){
            $(this).removeClass("hover");
        });
    }
}
/*
 * Function to do a cool bounce
 */    
function doBounce(element) {
    for(var i = 0; i < times; i++) {
        element.animate({height: '10%'}, 3000, function(){
            element.animate({opacity: '0.4'})
        });
    }        
}

/*
 * Adding in Google Analytics
 */

(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-67534030-1', 'auto');
ga('send', 'pageview');


function initMap(latitude, longitude) {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: latitude,
            lng: longitude
        },
        zoom: 8
    });

    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsDisplay, latitude, longitude);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, latitude, longitude) {
    console.log(latitude);
    console.log(longitude);
    console.log(cinemaDestination);

    directionsService.route({
        origin: {
            lat: latitude,
            lng: longitude
        }, // Haight.
        destination: {
            lat: parseFloat(cinemaDestination.lat),
            lng: parseFloat(cinemaDestination.lng)
        }, // Ocean Beach.
        // Note that Javascript allows us to access the constant
        // using square brackets and a string value as its
        // "property."
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

/* 
 * First function called to ask user for their location
 */

function googleReady() {
    loadingMessage('Getting your current Location');
    geocoder = new google.maps.Geocoder();
    getLocation();
    $('#rated').hide();
    $('#otherCinemas').hide();

}

/*
 * Function to output loading messages
 */
function loadingMessage(msg, last) {
    $('#loadingText').empty();
    if(msg) {
        $('#loadingText').append('<h2>' + msg + '</h2>');
    }
}

/*
 * get Users Location
 */ 
function getLocation() {
    
    if (navigator.geolocation) {
        
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        
        loadingMessage('<h1> The Website will only work if you show your location!</h1>');
    }
}

function showPosition(position) {
    homePosition.lat = position.coords.latitude;
    homePosition.lng = position.coords.longitude;
    console.log(homePosition);
    codeLatLng(parseFloat(homePosition.lat), parseFloat(homePosition.lng));
}

/* 
 * This function will send the ajax call to get the json for a movies
 */
function getMovies(loc) {
    /*
     * Make the url compatible
     */
    // testUrl = '22 olney crescent Terenure';
    
    nearLocation = loc.replace(/ /g, '%2B');
    nearLocation = nearLocation.replace(/'/g, '%2527');
    nearLocation = nearLocation.replace(/,/g, '%252C');
    /*
     * Ajax call to get the location of the user
     */
    $.ajax({
        url: showTimeUrl1 + nearLocation + showTimeUrl2,
        dataType: "jsonp",
        success: buildMovieObject
    });


}

function codeLatLng(lat, lng) {
    var latlng, address;
    latlng = new google.maps.LatLng(lat, lng);
    $('#mapSection').show();
    loadingMessage('Finding your nearest cinema');
    geocoder.geocode({
        'latLng': latlng
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {

                //formatted address
                firstLoad = true;
                address = results[0].formatted_address;
                getMovies(address);
                getLatLong(address);
                console.log(address);
            } else {
                alert("No results found");
            }
        } else {
            
            alert("Geocoder failed due to: " + status);
        }
    });
}
/*
 * Display a different cinema
 */

function callNewCinema(index) {
    setTimeout(function() {
        moviesArray = [];
        movieNamesArray = [];
        if(index || index === 0){
           cinemaIndex = index;   
        } else {
            cinemaIndex++;
        }
        buildMovieObject(allData);
    }, 2000);    
}

/* 
 * get the movie Details
 */
function getMovieDetails(obj) {
    var movieO, trailerLink;
    $.each(obj, function(index, movie) {
        movieO = {};
        movieO.name = movie.div[0].a.content;
        movieO.times = [];
        /*
         * Check it's an array before looping through it, if it's an object, just push the one time through
         */
        if (movie.div[1].span.length) {
            $.each(movie.div[1].span, function(index, time) {
                if(time.content){
                    movieO.times.push(time.content);
                } else if(time.a.content) {
                    movieO.times.push(time.a.content);
                }
            });
        } else {
            movieO.times.push(movie.div[1].span.content);
        }
        /*
         * trailer
         */
         if(movie.span.a){
            trailerLink = movie.span.a;
            if(trailerLink[0]){
                for(var i=0; i<trailerLink.length; i++){
                    if(trailerLink[i].content === 'Trailer'){
                        movieO.trailer = trailerLink[i].href;
                    }
                }
            } else {
                if(trailerLink.content === 'Trailer'){
                    movieO.trailer = trailerLink.href;
                }
            }
         }
        movieNamesArray.push(movieO);
    });
}

function getLatLong(address) {
    var geo;
    geo = new google.maps.Geocoder;
    $('#mapSection').show();
    geo.geocode({
        'address': address
    }, function(results, status) {
        console.log(results[0]);
        if (status == google.maps.GeocoderStatus.OK) {
            cinemaDestination.lat = results[0].geometry.location["lat"]();
            cinemaDestination.lng = results[0].geometry.location["lng"]();
            return results[0].geometry.location;
        } else {
            loadingMessage('Something went wrong :( Try again later');
        }

    });

}

function outputError(message) {
    alert(message);
}

function cinemaException(cinema) {
    var i;
    for(i=0; i<cinemaExceptions.length; i++){
        if (cinema === cinemaExceptions[i].a){
            cinemaAddress = cinemaExceptions[i].b;
        }
    }
}

// Build up movie object
function buildMovieObject(data) {
    var divs, movieResults, movieObj, movieObjLeft, movieObjRight;
    if(!data.query.results){
       loadingMessage('Oops no data is returning - Please try again later! :) ');
    } else {
    divs = data.query.results.body.div;
    allData = data;
    buildListofCinemas(data);
    /*
     * Looping through the google.com/movies website, and build up an object
     */
    loadingMessage('Getting film information');
    $.each(divs, function(index, div) {
        if (div.id && div.id === "results") {
            /*
             * Set the main data object
             */      
            movieResults = div.div.div.div[cinemaIndex];

            if (!movieResults) {
                if (cinemaIndex === 0) {
                    outputError('No cinema is returned');
                } else {
                    cinemaIndex = 0;
                    buildMovieObject(allData);
                }
            } else {
                if (!movieResults.div[1].div) {
                    buildMovieObject(allData);
                } else {
                    movieObj = movieResults.div[1];

                    if (movieObj.div[0] || movieObj.div[1]) {
                        cinemaName = movieResults.div[0].h2.a.content;
                        cinemaAddress = movieResults.div[0].div.content;
                        cinemaException(cinemaAddress);
                        movieObjLeft = movieObj.div[0].div;
                        movieObjRight = movieObj.div[1].div;
                        /*
                         * Only return cinemas displaying more than 4 films. (This fixes an annoying bug)
                         */

                        if (movieObjLeft.length > 2 && movieObjRight.length > 2) {
                            /*
                             * Get the location on 
                             */
                            getLatLong(cinemaAddress);
                            /*
                             * Loop through the left object
                             */
                            getMovieDetails(movieObjLeft);
                            /*
                             * Loop through the right object
                             */
                            getMovieDetails(movieObjRight);
                            /*
                             * Call function to get the IMDB details of the movies
                             */
                            movieCount = movieNamesArray.length;
                            getRatings(movieNamesArray);
                            
                            /*
                             * Initiate the Map
                             */
                            setTimeout(function() {
                                console.log(homePosition);
                                initMap(parseFloat(homePosition.lat), parseFloat(homePosition.lng));
                            }, 3000);

                        } else {
                            callNewCinema();
                        }
                    } else {
                        callNewCinema();
                    }
                }
            }
        }
    });
  }
}

/*
 * Function to check if the data was already collected - so no need to re-call the movie API
 */

function checkMovieStore(movie, array) {
    movieExists = false;
    $.each(array, function(index, mov) {
        if (mov.results[0]) {
            if (movie === mov.results[0].original_title) {
                movieExists = true;
                searchCallback(mov, movieExists);
            }
        }
    });
}

function getRatings(moviesArr) {
    var year, today, mov, threeD;
    today = new Date();
    year = today.getFullYear();
    $.each(moviesArr, function(index, movie) {
        threeD = false;
        checkMovieStore(movie.name, moviesStore);
        if (moviesStore.length < 15 || !movieExists) {
        if (!movieExists) {
            // need to cap it at 15 to stop API failures
                mov = movie.name;
                mov = mov.replace(/&#39;/g, "");
                
                if(mov.indexOf("3D") > 0){
                    threeD = true;
                }
                $.ajax({
                    type: 'GET',
                    url: movieDbUrl + mode + mov + '&year=' + year + key,
                    async: false,
                    contentType: 'application/json',
                    dataType: 'jsonp',
                    success: function(json) {
                        searchCallback(json, false, movie.trailer, threeD);
                    },
                    error: function(e) {
                        console.log(e.message);
                    },
                    failure: function(e){
                        console.log(e);
                    }
                });
            } 
        }
    });

}
/*
 * Create a compare function which orders the array
 */
function compare(a, b) {
    if (a.vote_average < b.vote_average || isNaN(a.vote_average))
        return -1;
    if (a.vote_average > b.vote_average)
        return 1;
    return 0;
}
/*
 * Function to load new cinema
 */
 function loadNewCinema(index){
    $('#cinema').remove();
    firstLoad = true;
    $('.imageCont').empty();
    $('#arrowRight').empty();
    $('#arrowLeft').empty();
    $('#cinemaWrapLess').empty();
    $('#cinemaWrapMore').empty();
    $('#selectedCinema').empty();
    loadingMessage('Finding your nearest cinema');
    startLoading();
    callNewCinema(index);
 }


/*
 * function to output films
 */
 function outputFilms(start){
    var i, moviesLength;
    moviesLength = moviesArray.length;
    
    for(i=start; i<start+3; i++){
            outputToScreen(moviesArray[moviesLength-i], i, moviesLength-i);
    }
    
    cinemaDirection = start + 3;
    if(start > 1) {
        console.log('here');
        $('#arrowLeft').empty();
        $('#arrowLeft').append('<i class="fa fa-arrow-circle-left fa-3x"></i>');
        $('#cinemaWrapLess').empty();
        $('#cinemaWrapLess').append('<div class="moreLess" id="cinemaLess"><i class="fa fa-arrow-circle-up fa-3x"></i><p>Less Films</p></div>');
        
    } else {
         $('#arrowLeft').empty();
         $('#cinemaWrapLess').empty();
    }
    if(start >= movieCount - 2) {
        $('#arrowRight').empty();
        $('#cinemaWrapMore').empty();
    } else {
        $('#arrowRight').empty();
        $('#arrowRight').append('<i class="fa fa-arrow-circle-right fa-3x"></i>');
        $('#cinemaWrapMore').empty();
        $('#cinemaWrapMore').append('<div class="moreLess" id="cinemaMore"><i class="fa fa-arrow-circle-down fa-3x"></i><p>More Films</p></div>');
    }
 }

function getHighestRated() {
    var largest;
    largest = 0;
    moviesArray.sort(compare);
    if (moviesArray.length === movieCount) {
        outputFilms(1); 
        loadingMessage('Top rated films near you', 'last');
        $('#selectedCinema').append('<h2>'+cinemaName+' <span id = "infocircle"><i class="fa fa-info-circle"></i></span></h2>');
        $('#cinema').remove();
        $('header').append('<div id = "cinema"><form class = "search" method = "post"><input id = "searchbar" placeholder="Search cinemas nearby" autocomplete="off"/><span id="downArrow"><i class="fa fa-sort-desc"></i></span><ul class="search-ac"></ul></form></div>')
        /*
         * listen for when user types into search box
         */
        $( "#searchbar" ).keyup(function() {
            searchCinemas(this.value);
        });
         $('.search').click(function(){
            if(!seachSelected){
                
                showSearchResults(cinemaSearch);
                seachSelected = true;
            } else {
                showSearchResults();
                seachSelected = false;
            } 
         });
        /*
         * For calculating new cinema information
         */
        $("#nearyou").click(function() {
            
            loadNewCinema();
        });
        $('#cinemaInfo').click(function() {
            firstLoad = true;
            finishLoading();
        });
    }

}

/*
 * callback for when we get back the results
 */
function searchCallback(data, exists, trailer, threeD) {
    if (!exists && moviesStore.length < 15) {
        moviesStore.push(data);
    }   
    if (data.results[0]) {
        if (data.results[0].vote_average && !isNaN(data.results[0].vote_average)) {  
            if(trailer){
                data.results[0].trailer = trailer;
            }
            if (threeD) {
                data.results[0].original_title = data.results[0].original_title + ' 3D'; 
                console.log(data.results[0]);
            }
            moviesArray.push(data.results[0]);
        } else {
            movieCount--;
        }
    } else {
        movieCount--;
    }

    /*
     * When the MoviesNamesArray has filled up find out which has the highest IMDB rating
     */
    getHighestRated();

}

/*
 * check times
 */
function checkTime(time){
    var d = new Date();
    var n = d.getHours();
    if(time.substring(0,2) < n){
        return false;
    } else {
        return true;
    }
}
/* 
 * output the cinema Times
 */
function outputCinemaTime(p_m, cont) {
    var times;
    times = [];
    $.each(movieNamesArray, function(index, movie) {
        if (movie.name === p_m.original_title) {
            $.each(movie.times, function(index, time) {
                
                if(time && checkTime(time)) {
                    times.push(' ' + time);
                }
            });
            cont.append('<div id = "times"><h4>' + times + '</h4></div>');
        }
    });
}
/*
 * Start Loading
 */
function startLoading() {
    loading = false;
    $('#title').replaceWith('<div id = "titleGif"><img src="img/nowFlixLoad4.gif" alt="NowFlix"></div>')
}
/*
 * Finish Loading
 */
function finishLoading() {
    var cinemaInfo, label;
    cinemaInfo = {};
    cinemaInfo.cinemaName = cinemaName;
    cinemaInfo.cinemaAddress = cinemaAddress;
    loading = true;
    label = 'Showing times, ratings and directions for: '
    if(firstLoad){
        overlay(cinemaInfo, 'cinemaInfo', label);
    }
    $('#selectedCinema').unbind();
    $('#selectedCinema').click(function(){
        overlay(cinemaInfo, 'cinemaInfo', label);
    });
    $('#titleGif').replaceWith('<div id = "title"><img src="img/nowflix.png" alt="NowFlix"></div>');
}
/*
 * function to get container
 */
 function getContainer(start) {
    if(start === 1 || start === 4 || start === 7 || start === 10 || start === 13 || start === 16 || start === 19){
        return $('#left');
    } else if(start === 2 || start === 5 || start === 8 || start === 11 || start === 14 || start === 17 || start === 20){
        return $('#center');
    } else if(start === 3 || start === 6 || start === 9 || start === 12 || start === 15 || start === 18 || start === 21){
        return $('#right');
    }
 }

 /*
  * Removing Loading mask from video
  */
 function videoLoaded(){
    $('.loading').empty();
 }

 /*
  * get the Trailer Code to embed
  */
  function getTrailerCode(url) {
    var code; 
    code = url.substring(url.lastIndexOf('watch?v=')+8,url.lastIndexOf('&sa'));
    return code;
  }
/*
 * output youTube Film
 */
function outputYouTube(info){
    if(info.trailer) {
                decodedUrl = decodeURIComponent(info.trailer);
                trailerCode = getTrailerCode(decodedUrl);
                $('#overlay').append('<div class="innerDiv"></div>');
                $('.innerDiv').append('<h3>' + info.original_title + '</h3>');
                $('.innerDiv').append('<iframe width="300" height="315" onload="videoLoaded()" src="https://www.youtube.com/embed/'+ trailerCode +
                                        '" frameborder="0" allowfullscreen></iframe>');
                $('.innerDiv').append('<div class="loading"><i class="fa fa-spinner fa-4x"></i></div>');
                $('.innerDiv').append('<div class="close">' +
                                        '<p>Close <i class="fa fa-times"></i></p>' +
                                        '</div>');

            } else {
                $('#overlay').append('<div class="innerDiv"><h3>' + info.original_title + '</h3><p>Sorry, no trailer to display :(</p><div class="close"><p>Close <i class="fa fa-times"></i></p></div></div>');
            }
}
/*
 * Overlap cinema information
 */
 function overlay(info, type, label) {
    var trailerCode, decodedUrl; 
    firstLoad = false;
    el = document.getElementById("overlay");
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    if(el.style.visibility === "visible"){
        $('#overlay').empty();
        if(type === 'youtube'){
            outputYouTube(info);
        } else if (type === 'cinemaInfo'){
            $('#overlay').append('<div class="innerDiv"><h3>' + label + '</h3><p><b>' + info.cinemaName+ '</b></p><p>' +  info.cinemaAddress + '</p><div class="close"><p>Got it <i class="fa fa-check"></i></p></div></div>');
        } else {
            $('#overlay').append('<div class="innerDiv"><h3>' + info.original_title + '</h3><p>' +  info.overview + '</p><div class="close"><p>Close <i class="fa fa-times"></i></p></div></div>');
        }
    } else {
        $('#overlay').empty();
    }

}

/*
 * What gets outputted to the screen
 */
function outputToScreen(p_movieResult, start, count) {
    var m, image, movieRatingW, imageBase, cont, youTubeVid;
    m = p_movieResult;
    cont = getContainer(start);
    if(m){
            imageBase = 'http://image.tmdb.org/t/p/w500';
        if (m.poster_path) {
            image = imageBase + m.poster_path;
        } else {
            image = 'http://img2.wikia.nocookie.net/__cb20140118173446/wiisportsresortwalkthrough/images/6/60/No_Image_Available.png';
        }
        /*
         * Add in the the title, cinema name, times and ratings
         */
            cont.empty();
            movieRatingW = m.vote_average * 10;
        /*
         * Film information and youtube Video
         */

            cont.append('<div class ="imageSpan"><img id="filmImage'+ count +'" src = "' + image + '"><div class="overlay" id ="overlay'+ count +'"></div></div>');
            if(m.trailer){
                $('#overlay' + count).append('<a href="#" class="expand" id="youtube'+ count + '"><i class="fa fa-youtube-play"></i></a>'); 
            }
            $('#overlay' + count).append('<a href="#" class= "info" id="info' + count +'"><i class="fa fa-info"></i></a><a class="drag"><i class="fa fa-angle-double-up"></i></a>'); //fa fa-angle-double-down

            $('#info'+count).click(function() {
                overlay(m);
            });
            $('#youtube'+count).click(function(){
                overlay(m, 'youtube');
            });
            cont.append('<div class = "scoreCont" ><div class = "score" id = "score' + count + '"><p>' + m.vote_average * 10 + '%</p></div></div>');
            $('#score' + count).animate({
                'width': movieRatingW + '%'
            }, 'slow');
            outputCinemaTime(m, cont); } else {
                cont.empty();
      }
    /*
     * Change the class of the button
     */
    finishLoading();
}