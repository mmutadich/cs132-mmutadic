/**
 * CS 132 CP3
 * @author Mia Mutadich
 * This is the horoscope.js page for my website which gives you 
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


(function (){
    let DATE;
    const API_TOKEN = '73838e1d46925b8d488dfe62136109cf1e0a32e8';
    const USER_ID = 635422;
    const ASTRO_URL = "https://json.astrologyapi.com/v1/western_chart_data";
    const TITLES = ['Sun', 'Moon', 'Rising'];

    function init(){
        //initalises Chart finding process when the form is submitted via clicking
        //the submit button
        qs('#submit').addEventListener('click', formSubmit);
    }

    /**
     * When the form has been submitted, this function will create a Date 
     * object to be used in the getChart function, get the timezone by 
     * calling the relevant function and get the chart by calling the relevant
     * function
     */
    function formSubmit(){
        const dateAndTime = qs("#date").value + "T" + qs("#time").value;
        DATE = new Date(dateAndTime);
        const timezone = getTimeZone();
        getChart(timezone);
    }

    /**
     * Using the lat and lng coordinates set in local storage, 
     * requests the timezone of that place from the Google Timezone API
     * 
     * https://developers.google.com/maps/documentation/timezone/get-started
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
     * 
     * @returns {float} the timezone of the place in hours
     */
    async function getTimeZone(){
        const latAndLng = localStorage.getItem("lat-and-lng");
        // timestamp must specify date only
        const day = new Date(qs("#date").value);
        const timeStamp = day.getTime();
        //remove miliseconds from time
        let timeConverted = Math.floor(timeStamp / 1000);
        zoneParams = {
            location: latAndLng,
            timestamp: timeConverted,
            key: API_KEY,
        };
        const zoneUrl = TIMEZONE_URL + new URLSearchParams(zoneParams).toString();
        let respZone = await fetch(zoneUrl);
        result = checkStatus(respZone);
        const responseZone = await result.json();
        // Offset given in seconds so must convert to hours 
        // dstOffset accounts for Daylight Savings
        const totalDiff = (responseZone.dstOffset + responseZone.rawOffset) / 3600;
        return totalDiff;
    }

    /**
     * Using the lat and lng coordinates set in local storage, the timezone
     * parameter and other values from the form, requests the astrological
     * chart from Astrology API and calls a function to add the results to 
     * the HTML. 
     * 
     * NOTE: Fetch is successful but recieved msg "Your subscribed plan is not
     * authorized to access this API" so this is a proof of concept.
     * 
     * https://astrologyapi.com/western-api-docs/api-ref/163/western_chart_data
     * 
     * @param {float} timezone -the timezone of the place in hours
     */
    async function getChart(timezone){
        const coords = window.localStorage.getItem("lat-and-lng").split(",");
        const params = {
            day : DATE.getDate(),
            month : DATE.getMonth(),
            year : DATE.getFullYear(),
            hour: DATE.getHours(),
            min: DATE.getMinutes(),
            lat: coords[0],
            lon: coords[1],
            tzone: timezone
        };
        // btoa used in HW 3 getAccessToken 
        let auth = "Basic " + btoa(USER_ID + ":" + API_TOKEN).toString("base64");
        try {
            let response = await fetch(ASTRO_URL, {
                method: 'POST',
                headers: {
                    "authorization": auth,
                    "Content-Type":'application/json',
                },
                body: JSON.stringify(params)
            });
            response = checkStatus(response);
            const resp = await response.json();
            const sun = resp.houses[0].sign;
            const moon = resp.houses[1].sign;
            const rising = resp.aspects[0].sign;
            addFetchResults(sun, moon, rising);
        } catch {
            addResults();
            handleError("We were unable to process get your chart! Double check the format of your DOB & TOB");
        }
    }

    /**
     * Adds the Big Three titles to the results section of the HTML
     * (replaces what would be the complete version if someone gave me $50
     * so that I could access the API)
     * 
     */
    function addResults(){
        TITLES.forEach( title => {
            const heading = document.createElement('h3');
            heading.classList.add("#"+title);
            heading.textContent = title;
            qs("#display-section").appendChild(heading);
        });
    }

    /**
     * Adds the Big Three titles to the results section of the HTML
     * with the getChart() reponse sun, moon and rising signs
     * 
     * @param {String} moon - moon sign from API request
     * @param {String} sun - sun sign from API request
     * @param {String} rising - rising sign from API request
     */
    function addFetchResults(sun, moon, rising){
        const container = qs("#display-section");
        const sunNode = document.createElement('p');
        sunNode.textContent = sun;
        container.insertBefore(sunNode, qs("#Moon"));
        const moonNode = document.createElement('p');
        moonNode.textContent = moon;
        container.insertBefore(moonNode, qs("#Rising"));
        const risingNode = document.createElement('p');
        risingNode.textContent = rising;
        container.append(risingNode);
    }

    init();
})();