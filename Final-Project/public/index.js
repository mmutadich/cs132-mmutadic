/**
 * CS 132 HW3
 * Version: 24fa
 * @author Mia Mutadich
 * 
 * This is an e-commerce store that displays products and allows users to filter products, 
 * view items individually, suggest items to be added, purchase bundles and view their basket.
 * This file populates the home page with all of the products on offer and allows users to 
 * filter products using the interactive cow canvas object. It also allows users to view their
 * basket and take a peek at some bundle options.
 */
(function (){
    "use strict";

    const BASE_URL = "http://localhost:8000/";
    const IMG_PATH = "imgs/";
    const ctx = document.createElement("canvas").getContext("2d");
    let stack = [];
  
    function init () {
        //displays different cow sections according to users' selection
        const pngs = qsa("#composite img");
        pngs.forEach(img =>img.addEventListener("click", ev => transPNG(ev, ev.currentTarget)));

        //populates #products-view with all products
        allCards();

        //toggles #products-view with #show-bundles to reveal and hide bundles
        const bundle = qs("#show-bundles");
        bundle.addEventListener('click', toggleView);

        //displays the items in the users' basket
        let basket = qs("#basket");
        basket.addEventListener('click', ()=> {
            qs("aside").classList.toggle("hidden");
            updateBasket();
        });

        //changes the image in the bundle based on what user selected
        let selectedOpt = qsa(".bundle select");
        selectedOpt.forEach( bundle => {
            bundle.addEventListener('change', async function() {
                let newImage = await displayImg(bundle.value);
                // use closest() so applies to image that share the same div as the select
                let currBundle = this.closest('.bundle');
                currBundle.querySelector('.bundle-select-img').src = "imgs/" + newImage;
            });
        });

        //when a bundle is added to basket, the basket in localStorage is updated with bundle items
        qsa(".add-button").forEach( button => {
            button.addEventListener('click', function () {
                let currBundle = this.closest('.bundle-option');
                addToBasket(currBundle);
            });
        });
    }

    /**
   * The #composite is a stack of each section of cow as a transparent image so that 
   * given where the user clicks on the image, the algorithm searches for the 
   * non-transparent image selected which corresponds to a section of a cow. It then 
   * changes the colour of this section and filters the products to be from that category. 
   *
   * @param {MouseEvent} ev - The mouse event triggered by the click.
   * @param {HTMLElement} target - The image element that was clicked.
   */
    function transPNG(ev, target) {
        if(!target.offsetParent) return;
    
        // Get click coordinates (regex)
        const isImage = /img/i.test(target.tagName),
            x = ev.pageX - target.offsetParent.offsetLeft,
            y = ev.pageY - target.offsetParent.offsetTop,
            w = ctx.canvas.width = target.width,
            h = ctx.canvas.height = target.height;
        let alpha;
    
        // Draw image to canvas and read Alpha channel value
        if (isImage) {
            ctx.drawImage(target, 0, 0, w, h);
            alpha = ctx.getImageData(x, y, 1, 1).data[3]; // [0]R [1]G [2]B [3]A
        }
    
        if (alpha === 0) {          // If pixel is transparent...
            target.hidden = 1;         // Make image hidden
            stack.push(target);       // Remember
            return transPNG(ev, document.elementFromPoint(ev.clientX, ev.clientY)); // REPEAT
        } else {                    // Not transparent! We found our image!
            stack.forEach(el => (el.hidden = 0)); // Show all hidden elements
            stack = [];               // Reset stack
            let previous = window.localStorage.getItem("previous");
            if (previous && previous != "null") {
                qs("#"+previous).src = window.localStorage.getItem("old_src");
            }
            // stores the section clicked so that when the next section is clicked we know which
            // section to reset back to white instead of having to reset all of them every time.
            if (target.getAttribute("alt") != "cow"){
                let oldFile = target.getAttribute("src");
                let fileName = oldFile.split("-");
                // files with white coloured section are named cow-sec-white-dairy.png 
                // files with coloured section are named cow-sec-dairy.png so need
                // so need to remove word at index 2 (just realised I could have named this better
                // but whoops its too late now)
                let newPath = fileName[0] + "-" + fileName[1] + "-" + fileName[3];
                target.setAttribute("src", newPath);
                window.localStorage.setItem("previous", target.getAttribute("id"));
                window.localStorage.setItem("old_src", oldFile);
            } else {
                window.localStorage.setItem("previous", null);
            }
            displaySection(target.getAttribute("alt"));
        }
    }

    /**
   * Given the name of the section selected, requests the items from that
   * section and displays them as cards in the .products section
   *
   * @param {String} section - The section of the cow that was selected
   */
    async function displaySection(section) {
        if (section == "cow"){
            allCards();
        } else {
            let response = await fetch(BASE_URL + "categories/"+ section);
            response = checkStatus(response);
            let itemsToDisplay = await response.json();
            let cardsToBuild = [];
            for (let item of itemsToDisplay) {
                let url = BASE_URL + "categories/" + section + "/" + item;
                response = await fetch(url);
                response = checkStatus(response);
                let card = await response.json();
                cardsToBuild.push(card);
            }
            populateCards(cardsToBuild, formatTitleCase(section));
        }
    }

    /**
   * Fetches all products from the API and displays them as cards in the
   * .products section
   *
   */
    async function allCards(){
        let res = await fetch(BASE_URL+"products");
        res = checkStatus(res);
        let cardsToBuild = await res.json();
        populateCards(cardsToBuild, "All Products");
    }

    /**
   * Given the array of item objects, creates a card for it using the items
   * name and image attributes. If a card is selected, its name and category 
   * are saved in localStorage to be used to create the individual item view.
   *
   * @param {Array} cardsToBuild - An array of item objects to create cards out of
   * @param {String} heading - Heading to describe the items in the .products 
   *                          e.g. Diary
   */
    function populateCards(cardsToBuild, heading){
        qs("#product-view").innerHTML = "";
        let title = gen('h2');
        title.textContent = heading;
        qs("#product-view").appendChild(title);
        let section = gen('section');
        section.classList.add('products');
        qs("#product-view").appendChild(section);
        cardsToBuild.forEach( item => {
            let card = gen('div');
            card.classList.add("product-card");
            let link = gen('a');
            link.href = "/product.html";
            link.appendChild(card);
            let name = gen('h3');
            name.textContent = item['name'];
            card.appendChild(name);
            let image = gen('img');
            image.src = IMG_PATH + item['image'];
            image.alt = item;
            card.appendChild(image);
            qs(".products").appendChild(link);
            link.addEventListener("click", () => {
                window.localStorage.setItem("item_name", item['name']);
                window.localStorage.setItem("item_category", item['category']);
            });
        });
    }

    /**
   * Changes the #product-view between the bundles and the products.
   *
   */
    function toggleView() {
        let bundleView = qs("#bundle");
        let productView = qs("#product-view");
        bundleView.classList.toggle("hidden");
        productView.classList.toggle("hidden");
    }

    /**
   * When a user wants to see the basket, it uses the basket info 
   * in the localStorage and generates a card for each item.
   *
   */
    function updateBasket() {
        qs("#added-items").innerHTML = "";
        let temp = window.localStorage.getItem('basket');
        let basket = JSON.parse(temp);
        for (let item of basket){
            createBasketCard(item, qs("#added-items"));
        }
    }

    /**
   * Given an item object, creates a card for the basket, like the product card 
   * but also displaying the price and quantity of the item. Users can delete the
   * item if it is clicked while holding shift - if not they will just get a warning
   * message.
   *
   * @param {Object} item - item object to make a card out of. Has the attributes
   * name, image, price and quantity. 
   * @param {HTMLElement} addTo - the section to add the card to
   */
    function createBasketCard(item, addTo){
        let card = gen('div');
        card.classList.add("basket-card");
        let name = gen('h3');
        name.textContent = item['name'];
        card.appendChild(name);
        let image = gen('img');
        image.src = item['img'];
        image.alt = item;
        card.appendChild(image);
        addElem('p', "Price: $" + item['price'], null, card);
        addElem('p', "Quantity: " + item['quantity'], null, card);
        addElem('p', "", "delete", card);
        addTo.appendChild(card);
        card.addEventListener('click', function (event) {
            if (event.shiftKey) {
                // removes card from DOM
                this.remove();
                removeItem(item['name']);
            } else {
                alert("Are you sure you want to remove this item from the basket? To delete, click the card which holding the SHIFT key.");
            }
        });
    }

    /**
   * When a user decides to remove an item from their basket, the item
   * is removed from the basket in localStorage.
   *
   * @param {String} deleteItem - The name of the item to be removed
   */
    function removeItem(deleteItem) {
        let temp = window.localStorage.getItem('basket');
        let basket = JSON.parse(temp);
        let updatedBasket = basket.filter(item => item['name'] !== deleteItem);
        window.localStorage.setItem('basket', JSON.stringify(updatedBasket));
    }

    /**
    * When the user wants to a bundle to their basket, the basket in 
    * localStorage is updated with the name, price and image of each item in the 
    * bundle they choose to buy. If this request was successful a message is displayed.
    * 
    */
    async function addToBasket(currBundle){
        let temp = window.localStorage.getItem('basket');
        let basket = JSON.parse(temp || "[]");

        // get all items from the bundle
        let options =  currBundle.querySelectorAll(".bundle-select");
        for (let option of options){
            let url = BASE_URL + "categories/" + option.name + "/" + removeTitleCase(option.value);
            let res = await fetch(url);
            res = checkStatus(res);
            let response = await res.json();
            let newItem = {
                name : option.value, 
                img : IMG_PATH + response['image'],
                price : response['price'].toFixed(2), 
                quantity : 1
            };
            basket.push(newItem);
        }
        window.localStorage.setItem('basket', JSON.stringify(basket));
        qs("#message-area").textContent = "Success! This item has been added to your basket.";
        qs("#message-area").classList.remove("hidden");
        setTimeout(() => {
            qs("#message-area").classList.add("hidden");
        }, 2000);
    }

    /**
   * Takes a dash-separated directory name and converts it to a Title Case name.
   * Example: formatTitleCase("classic-coffee") returns "Classic Coffee".
   * @param {String} dirName - directory name to format
   * @returns {String} - Title Case formatted name
   */
    function formatTitleCase(dirName) {
        let words = dirName.split("-");
        let firstWord = words[0];
        let result = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        for (let i = 1; i < words.length; i++) {
            let nextWord = words[i];
            result += " " + nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
        }
        return result;
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

    /**
   * When a user changes their option in a select that belongs to a bundle, 
   * the image diplayed above the select is changed to correspond to that 
   * option.
   *
   * @param {String} option - The name of the chosen option in the select
   * @returns {String} - The source of the image that was selected
   */
    async function displayImg(option) {
        let resp = await fetch(BASE_URL + "products");
        resp = checkStatus(resp);
        let items = await resp.json();
        for (let item of items){
            if (item['name'] == option){
                return item['image'];
            }
        }
    }

    init();
}
)();