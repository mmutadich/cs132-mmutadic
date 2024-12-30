/**
 * CS 132 HW3
 * Version: 24fa
 * @author Mia Mutadich
 * 
 * This is an e-commerce store that displays products and allows users to filter products, 
 * view items individually, suggest items to be added, purchase bundles and view their basket.
 * This file allows users to suggest new products to be added by sending their suggestion as
 * a POST request to the API.
 */

(function(){
    "use strict";

    const BASE_URL = "http://localhost:8000/";
    const IMG_PATH = "imgs/cow-imgs/cow-sec-";

    function init(){
        //populates drop down with the categories in the API
        populateCategories();

        //when a different category is selected, the corresponding image is displayed
        qs("select").addEventListener('change', function () {
            qs("img").src = IMG_PATH + this.value + ".png";
            qs("img").alt = this.value;
        });

        // when form is submitted, sends POST request to API
        qs("#newItemForm").addEventListener('submit', function (event) {
            processForm(event);
            setTimeout(() => {
                qs("#message-area").classList.add("hidden");
            }, 2000);
        });
    }

    /**
     * Requests the categories from the API and adds each one as an option in the select.
     * 
     */
    async function populateCategories(){
        try {
            let res = await fetch(BASE_URL+"categories");
            res = checkStatus(res);
            let categoriesToAdd = await res.json();
            let select = qs("select");
            for (let category of categoriesToAdd){
                let option = gen('option');
                option.textContent = category;
                option.value = category;
                select.appendChild(option);
            }
        } catch (err) {
            handleError(err);
        }
    }

    /**
     * Given the form data, sends a POST request to the API to add the requested
     * item to a list of requests to be processed. 
     * 
     */
    async function processForm(event){
        event.preventDefault();
        const formData = new FormData(event.target);
        const payload = {
            method: 'POST',
            body: formData
        };
        try {
            let result = await fetch(BASE_URL+"new-item", payload);
            result = checkStatus(result);
            const response = await result.text();
            qs("#message-area").textContent = response;
        } catch {
            qs("#message-area").textContent = "Your request failed.";
        }
    }

    init();

}());