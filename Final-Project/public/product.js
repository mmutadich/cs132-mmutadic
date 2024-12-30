/**
 * CS 132 HW3
 * Version: 24fa
 * @author Mia Mutadich
 * 
 * This is an e-commerce store that displays products and allows users to filter products, 
 * view items individually, suggest items to be added, purchase bundles and view their basket.
 * This file displays the individual information of the item selected in the index.html file.
 */

(function (){
    "use strict";

    const BASE_URL = "http://localhost:8000/";
    const IMG_PATH = "imgs/";
    
    function init () {
        //uses the information in localStorage to GET the item info
        populatePage();

        //when user choses to add item to basket the localStorage basket is updated
        qs("#submit").addEventListener('click', addToBasket);
    }

    /**
     * Given the name and categroy of the selected item stored in localStorage from
     * index.js, requests the items data and populates the page with the item's name, price,
     * quantity, description and recommended recipes.
     *
     */
    async function populatePage(){
        const name = window.localStorage.getItem('item_name');
        const category = window.localStorage.getItem('item_category');
        let url = BASE_URL + "categories/" + category + "/" + removeTitleCase(name);
        let res = await fetch(url);
        res = checkStatus(res);
        let response = await res.json();
        qs('h2').textContent = response['name'];
        let image = gen('img');
        image.src = IMG_PATH + response['image'];
        image.alt = response['name'];    
        qs('#info-container').appendChild(image);
        let container = qs('#info');
        addElem('p', "Price: $" + response['price'].toFixed(2), "price", container);
        addElem('p', response['description'], null, container);
        const select = gen('select');
        select.classList.add("quantity");
        const max = response['quantity'];
        for (let i = 1; i <= max; i++ ){
            let item = gen('option');
            item.value = i;
            item.textContent = i;
            select.appendChild(item);
        }
        container.appendChild(select);
        const list = gen('ul');
        const recipes = response['recipes'];
        for (let key in recipes) {
            let recipe = gen('li');
            let recipeName = gen('a');
            recipeName.href = recipes[key];
            recipeName.textContent = key;
            recipe.appendChild(recipeName);
            list.appendChild(recipe);
        }
        qs('main').appendChild(list);
    }

    /**
     * When the user wants to add the item to their basket, the basket in 
     * localStorage is updated with the name, price and image of the item they 
     * choose to buy as well as the quantity they selected. If this request was 
     * successful a message is displayed.
     * 
     */
    function addToBasket(){
        let temp = window.localStorage.getItem('basket');
        let basket = JSON.parse(temp || "[]");
        let price = qs(".price").textContent;
        let imgPath = qs("img").src;
        let img = imgPath.split("/");
        let cleanedPrice = price.split("$")[1]; //get only the number
        let newItem = {
            name : qs("h2").textContent, 
            img : IMG_PATH + img.pop(),
            price : cleanedPrice, 
            quantity : qs(".quantity").value
        };
        basket.push(newItem);
        window.localStorage.setItem('basket', JSON.stringify(basket));
        qs("#message-area").textContent = "Success! This item has been added to your basket.";
        qs("#message-area").classList.remove("hidden");
        setTimeout(() => {
            qs("#message-area").classList.add("hidden");
        }, 2000);
    }

    /**
     * Takes a Title Case name and converts it to a dash-separated directory name.
     * Example: formatTitleCase("Classic Coffee") returns "classic-coffee".
     * 
     * @param {String} titleName -  Title Case name
     * @returns {String} - dash-seperated formatted name
     */
    function removeTitleCase(titleName) {
        let words = titleName.split(" ");
        let firstWord = words[0];
        let result = firstWord.charAt(0).toLowerCase() + firstWord.slice(1);
        for (let i = 1; i < words.length; i++) {
            let nextWord = words[i];
            result += "-" + nextWord.charAt(0).toLowerCase() + nextWord.slice(1);
        }
        return result;
    }

    init();
}
)();