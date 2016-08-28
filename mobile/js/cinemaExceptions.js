/*
 * File to build up Cinema exceptions array
 */
 var cinemaExceptions; 
 cinemaExceptions = [{'a':'Mahon Link Road - Mahon, Mahon Point Shopping Centre, Cork, Ireland - (0818) 719 719', 'b': 'Mahon, Mahon Point Shopping Centre, Cork, Ireland'},
 {'a':'Sandyford Way (44), Dundrum Town Centre, Dublin, Ireland - 1520 880 333', 'b': 'Movies @ Dundrum, Dundrum Town Centre, Dublin'}];

function cinemaException(cinema) {
    var i;
    for(i=0; i<cinemaExceptions.length; i++){
        if (cinema === cinemaExceptions[i].a){
            cinemaAddress = cinemaExceptions[i].b;
        }
    }
}	
