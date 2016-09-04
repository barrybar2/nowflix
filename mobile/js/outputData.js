/*
 * Output film and search data
 */
 var imageBase;
 imageBase = 'http://image.tmdb.org/t/p/w500';

/*
 * Function to show the search results for the cinema
 */
function showSearchResults(results){
    var i, searchCont, ulString;
    ulString = '';
    $('#headerTop').hide();
    $('.centre').show();
    if(results){
        stageComp(2);

       for(i=0; i<results.length; i++){
      var liString =    '<li>' + 
                                '<a href="#films" data-position-to="window" data-transition="slide" name="'+results[i].name+'" onClick="loadNewCinema('+i+')">'+
                                    '<div class="cinemaIcon">' +
                                    '<i style = "margin-left: 7px" class="fa fa-film"></i>' +
                                    '</div>' +
                                    '<div class="cinemaText">' +
                                    '<h1>'+results[i].name+'</h1>'+
                                    '<p>'+results[i].address+'</p>'+
                                    '</div>' +
                                '</a>'+
                            '</li>';
            // Keep adding each <li> to the <ul> in order to make
            // placing it in the page easier
            ulString += liString;
      }
        // Place the <ul> with all its <li> into the page
        $('.myListview').html(ulString);
        // jQuery Mobile function so that correct styling can be set to the list.
        // Must be called after data has been appended
        $('.myListview').listview('refresh');
        // triggers events attached to the element
        $('.myListview').trigger('create');
    } 
}

/*
 * Function to load new cinema
 */
 function loadNewCinema(index){
    moviesArray = [];

    getRatings(cinemaSearch[index]);
 }


/*
 * Output films
 */
 function outputFilms(results, nameCinema){
    var i, searchCont, ulString, image, m, percent;
    ulString = '';
    $('.filmview').empty();
    $('#loadFilm').empty();
    if(results){
       
       for(i=results.length-1; i>0; i--){
        
        
        m = results[i];
        percent = Math.round(m.vote_average * 10);
        if (m.poster_path) {
            image = imageBase + m.poster_path;
        } else {
            image = 'http://img2.wikia.nocookie.net/__cb20140118173446/wiisportsresortwalkthrough/images/6/60/No_Image_Available.png';
        }
      var liString =    '<li>' + 
                                '<a href="#filmDetails" data-transition="slide" data-position-to="window" onClick="loadMoviesDetails('+i+')">'+
                                    '<div class = "filmImage">' +
                                    '<img src = "'+ image +'"/>' +
                                    '</div>' +
                                    '<div class = "filmText">' +  
                                    '<h1>'+m.original_title+'</h1>'+
                                    '<p>'+m.overview+'</p>'+
                                    '<p>' + m.times +
                                    '<div class = "scoreCont" >' +
                                    '<div class = "score summaryScore" style = "width: '+ percent +'%">' +
                                    '<p>' + percent + '%</p>' + 
                                    '</div>' +
                                    '</div>' + 
                                    '</div>' + 
                                '</a>'+
                            '</li>';
            // Keep adding each <li> to the <ul> in order to make
            // placing it in the page easier
            ulString += liString;
      }
        // Place the <ul> with all its <li> into the page
        $('.filmview').html(ulString);
        // jQuery Mobile function so that correct styling can be set to the list.
        // Must be called after data has been appended
        $('.filmview').listview('refresh');
        // triggers events attached to the element
        $('.filmview').trigger('create');
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
 * Load movie details
 */
 function loadMoviesDetails(index){
    var mov, image, movieContent, decodedUrl, trailerCode, cinemaTimes;
    mov =  moviesArray[index];
    console.log(mov);
    decodedUrl = decodeURIComponent(mov.trailer);
    trailerCode = getTrailerCode(decodedUrl);
    percent = Math.round(mov.vote_average * 10);
    if (mov.poster_path) {
            image = imageBase + mov.poster_path;
        } else {
            image = 'http://img2.wikia.nocookie.net/__cb20140118173446/wiisportsresortwalkthrough/images/6/60/No_Image_Available.png';
        }
    $('#movieHeader').empty();
    $('#movieHeader').append(mov.original_title);
    $('.filmDetailsInner').empty();
    movieContent =  '<div id = "youtubeCont">' +
                    '<iframe width="100%" height="180" onload="videoLoaded()" src="https://www.youtube.com/embed/'+ trailerCode +'" frameborder="0" allowfullscreen></iframe>' +
                    '<div class="loading"><i class="fa fa-spinner fa-4x"></i></div>' + 
                    '</div>' +
                    '<h3>' + mov.title + '</h3>' + 
                    '<div class = "bottomCont">' +
                    '<div class = "imgDetail"><img src = "'+ image +'"/></div>' + 
                    '<div class = "filmMoreInfo">' +
                    '<div class = "scoreCont" >' +
                    '<div class = "score detailScore" style = "width: '+ percent +'%">' +
                    '<p>' + percent + '%</p>' + 
                    '</div>' +
                    '</div>' +
                    '<p> <i class="fa fa-clock-o"></i>' +  ' ' + mov.times +  '</p>' +
                    '<p>' + mov.overview + '</p>' +
                    '</div>' +
                    '</div>';
    $('.filmDetailsInner').append(movieContent);
 }
