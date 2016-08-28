/*
 * Get cinemas
 */

 /*
 *
 *
 * Simple search function that returns list of cinemas
 * Info on the API I used here: http://kiro.me/projects/fuse.html
 *
 */
 var searchInit, cinemaSearch, seachSelected;
 searchInit = false;
 seachSelected = false;
 cinemaSearch = [];

 function buildListofCinemas(data) {
    var cinemaDivs, cinemaResult, cinemaObj, cinemaObjLeft, cinemaObjRight, cinemaSearchName, cinemaSearchAddress, cinemaArray, cin;
    cinemaDivs = data.query.results.body.div;
    allData = data;
    cinemaArray = [];
    /*
     * Only build the search item once
     */ 
    if(!searchInit){
        /*
         * Loop through the googles JSON
         */
        $.each(cinemaDivs, function(index, div) {
            if (div.id && div.id === "results") {
                cinemaArray = div.div.div.div;
                /*
                 * Loop through the cinema Items
                 */ 
                $.each(cinemaArray, function(index1, cinema) {
                cinemaResult = div.div.div.div[index1];
                /*
                 * Validate if I want to search for this cinema;
                 */
                if(cinemaResult){
                    if(cinemaResult.div[1].div) {
                        cinemaObj = cinemaResult.div[1];          
                        if (cinemaObj.div[0] || cinemaObj.div[1]) {
                            cinemaObjLeft = cinemaObj.div[0].div;
                            cinemaObjRight = cinemaObj.div[1].div;
                            if (cinemaObjLeft.length > 2 && cinemaObjRight.length > 2) {
                                /*
                                 * If it passes validation, create cinemaObject and push into array (Array to be used in search function)
                                 */
                                cinemaSearchName = cinemaResult.div[0].h2.a.content;
                                cinemaSearchAddress = cinemaResult.div[0].div.content;
                                cin = {};
                                cin.ind = index1;
                                cin.name = cinemaSearchName;
                                cin.address = cinemaSearchAddress; 
                                
                                cinemaIndex = index1;
                                movieNamesArray = [];
                                var movies = buildMovieObject(allData);
                                cin.films = movies;
                            cinemaSearch.push(cin);
                        }    
                    }
                }
            }
          });  
        }
    });
    showSearchResults(cinemaSearch);
    searchInit = true;
 }
}


