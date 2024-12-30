/**
 * CS 132
 * Provided global DOM accessor aliases.
 * These are the only functions that should be global in a submission.
 */

/**
 * Returns the first element that matches the given CSS selector.
 * @param {string} selector - CSS query selector string.
 * @returns {object} first element matching the selector in the DOM tree
 * (null if none)
 */
function qs(selector) {
    return document.querySelector(selector);
}

/**
 * Returns the array of elements that match the given CSS selector.
 * @param {string} selector - CSS query selector
 * @returns {object[]} array of DOM objects matching the query (empty if none).
 */
function qsa(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Returns a new element with the given tagName
 * @param {string} tagName - name of element to create and return
 * @returns {object} new DOM element with the given tagName (null if none)
 */
function gen(tagName) {
    return document.createElement(tagName);
}

/**
 * TAKEN FROM HW3
 * Helper function to return the Response data if successful, otherwise
 * returns an Error that needs to be caught.
 * @param {object} response - response with status to check for success/error.
 * @returns {object} - The Response object if successful, otherwise an Error that
 * needs to be caught.
 */
function checkStatus(response) {
    if (!response.ok) { // response.status >= 200 && response.status < 300
      throw Error(`Error in request: ${response.statusText}`);
    } // else, we got a response back with a good status code (e.g. 200)
    return response; // A resolved Response object.
  }


/**
 * Creates an HMTLElement given the type of element and adds it to the DOM 
 * at the specified location. If given, can add a class to this element and 
 * set its textContent.
 *
 * @param {String} createElm - type of HTMLElement to create
 * @param {String} textDesc - (optional) set textContent to this
 * @param {String} addClass - (optional) add this class to the element
 * @param {String} addTo - part of DOM to attach element to
 */
function addElem(createElm, textDesc, addClass, addTo){
    const item = gen(createElm);
    if (textDesc) {
        item.textContent = textDesc;
    }
    if (addClass){
        item.classList.add(addClass);
    }
    addTo.appendChild(item);
}

/**
 * Displays an error message on the page, hiding any previous results.
 * If errMsg is passed as a string, the string is used to customize an error message.
 * Otherwise (the errMsg is an object or missing), a generic message is displayed.
 *
 * @param {String|any} errMsg - optional specific error message to display on page.
 */
function handleError(errMsg) {
    if (typeof errMsg === "string") {
        qs("#message-area").textContent = errMsg;
    } else {
        const GENERIC_SPOTIFY_ERR_MSG =
            "An error occurred fetching the COWTECH data. " +
            "Please try again later.";
        // the err object was passed, don"t want to show it on the page;
        // instead use generic error message.
        qs("#message-area").textContent = GENERIC_SPOTIFY_ERR_MSG;
    }
    qs("#message-area").classList.remove("hidden");
}