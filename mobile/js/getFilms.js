/*
 * Get films
 */ 
var allData, cinemaIndex, movieNamesArray, movieCount, moviesStore, movieDbUrl, showTimeUrl1, showTimeUrl2, moviesArray, currentCinema;
movieNamesArray = [];
moviesStore = [];
moviesArray = [];
showTimeUrl1 = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D'www.google.com%2Fmovies%3Fsort%3D0%26near%3D";
showTimeUrl2 = "'%20&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
movieDbUrl = 'https://api.themoviedb.org/3/';
mode = 'search/movie?query=';
key = '&api_key=1e76801a7b64fc5408edbe0f65790d2b';

/*
 * Build up movie object
 */
function buildMovieObject(data) {
    var divs, movieResults, movieObj, movieObjLeft, movieObjRight, innerArr;
    if(!data.query.results){
       alert('Oops no data is returning - Please try again later! :) ');
    } else {
    divs = data.query.results.body.div;
    /*
     * Looping through the google.com/movies website, and build up an object
     */
    $.each(divs, function(index, div) {
        if (div.id && div.id === "results") {
            /*
             * Set the main data object
             */      
            movieResults = div.div.div.div[cinemaIndex];

            if (!movieResults) {
                if (cinemaIndex === 0) {
                    alert('No cinema is returned');
                } else {
                    cinemaIndex = 0;
                    console.log('do nothing')
                    //buildMovieObject(allData);
                }
            } else {
                if (!movieResults.div[1].div) {
                	console.log('do nothing');
                    //buildMovieObject(allData);
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
                            innerArr = movieNamesArray
                        
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
  return innerArr;
}


/* 
 * get the movie Details
 */
function getMovieDetails(obj) {
    var movieO, trailerLink, innerMovieArr;
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
 * Get the film ratings from API
 */
function getRatings(cinema) {
    var year, today, mov, threeD, moviesArr;
    today = new Date();
    year = today.getFullYear();
    moviesArr = cinema.films;
    movieCount = moviesArr.length;
    currentCinema = cinema.name;
    $('#filmHeader').empty();
    $('#filmHeader').append(currentCinema);
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
 * If the movie already exists as an object, no need to search API for it.
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

/*
 * check times are in the future
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
 * function to get cinema Times
 */
 function returnCinemaTimes(p_m) {
    var times;
    $.each(movieNamesArray, function(index, movie) {
        if (movie.name === p_m.original_title) {
            console.log(movie);
            $.each(movie.times, function(index, time) {
                if(time && checkTime(time)) {
                    if(!times) {
                        times = time;
                    } else {
                        times = times + ', ' + time;
                    }
                }
            });
        }
    });
  return times;  
}

/*
 * callback for when we get back the results
 */
function searchCallback(data, exists, trailer, threeD) {
    var cinemaTimes;
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
            }
            data.results[0].times = returnCinemaTimes(data.results[0]) || 'No more times today';

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
 * Final function to call before outputting the information
 */
function getHighestRated() {
    var largest;
    largest = 0;
    moviesArray.sort(compare);
    if (moviesArray.length === movieCount) {
        outputFilms(moviesArray, cinemaAddress);    
    }
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