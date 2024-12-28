/**
 * CS 132 CP3
 * @author Mia Mutadich
 * This is the maps.html page for my website which gives you 
 * your Big Three astrology chart based on your time of birth, 
 * date of birth and place of birth. My website uses the Google
 * Maps API to suggest places in a certain format while a user
 * enters their place of birth, find the lat and lng of their
 * place of birth and calculates the timezone in hours. It also 
 * uses an astrology API that, given these lat and lng coordinates,
 * the timezone and other details returns the signs for each
 * placement.  
 *
 */

const API_KEY = "AIzaSyBucfwGugZFU7z7HqOK4s8uzICvrDBF0mo";
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json?";

/**
 * Callback function when Google Autocomplete script is loaded in 
 *
 * Creates an Autocomplete object which makes API requests to Google Maps
 * as the user types to suggest relevant places. This way when I use a 
 * Google Map API to fetch the lat and lng coordinates the format of the 
 * places is already compaiible. 
 * 
 * https://developers.google.com/maps/documentation/javascript/place-autocomplete#place_autocomplete_service
 * 
 */
function initAutocomplete(){
    autocomplete = new google.maps.places.Autocomplete(
        qs("#location"), 
        {
            fields: ['name']
        });
    autocomplete.addListener('place_changed', onPlaceChanged);
}

/**
 * When a user selects a place from the Google Maps suggested options
 * this function will request the lat and lng coords of the place from 
 * the Google Geocoding API and save these coords in local storage so 
 * to be accessible in other scripts (horoscope.js)
 * 
 * No need for try and catch since I am using the Google Maps
 * Maps formatted input and fetching from same API (place must exist if
 * it was suggested by Google Maps)
 * 
 * https://developers.google.com/maps/documentation/geocoding/start
 * 
 */
async function onPlaceChanged(){
    let place = autocomplete.getPlace();
    coordsParams = {
        address: place.name,
        key: API_KEY
    };
    // URLSearchParams used in HW3 logInToSpotify()
    let coordsUrl = GEOCODE_URL + new URLSearchParams(coordsParams).toString();
    let resp = await fetch(coordsUrl);
    result = checkStatus(resp);
    const response = await result.json();
    const coords = response.results[0].geometry.location;
    const latAndLng = coords.lat+ "," + coords.lng;
    window.localStorage.setItem("lat-and-lng", latAndLng);
}