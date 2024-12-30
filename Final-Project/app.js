"use strict";

/**
 * @author Mia Mutadich
 * 
 * This API supports the following endpoints:
 * GET /categories
 * GET /categories/:category
 * GET /categories/:category/:item
 * GET /products
 *
 * POST /new-item
 */

const express = require("express");
// file handelling
const fs = require("fs").promises;
const globby = require("globby").globby;
const path = require("path");
// allows us to access req.body
const multer = require("multer");

const app = express();

app.use(express.static("public"));
// for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module
// multer supports file uploads if user wants to upload image of product etc.

const CLIENT_ERR_CODE = 400;
const SERVER_ERR_CODE = 500;
const SERVER_ERROR = 'Something went wrong on the server, please try again later.'

/**
 * Returns an array of category names as a JSON response.
 * Example: ["hindquarter", "dairy", ...]
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/categories", async (req, res) => {
    try {
        let categories = await fs.readdir("categories");
        res.json(categories); // packages as a json and then sends it
    } catch (err) {
        res.status(500).send(SERVER_ERROR);
    }
});

/**
 * Returns a JSON array of item folders for the given category name (ignoring letter-casing).
 * Example: ["ground-beef", "brisket", ...]
 * Returns a 400 error if no category found for the given name
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/categories/:category", async (req, res) => {
    try {
        let categories = await fs.readdir(`categories/${req.params.category}`);
        res.json(categories);
    } catch (err) {
        res.type("text");
        if (err.code === "ENOENT") {
        res.status(CLIENT_ERR_CODE).send(`No results found for category: ${req.params.category}`);
        } else {
            if (err.code === "ENOENT") {
                res.status(CLIENT_ERR_CODE).send("Category " + req.params.category + " not found.");
            } else {
                res.status(SERVER_ERR_CODE).send(SERVER_ERROR);
            }
        }
    }
});

/**
 * Returns item data with each item having information about the name, price, 
 * quantity, image, description, recipes, category and whether it is in stock.
 * Example for "/categories/dairy/butter": 
 * {
    "name": "Butter",
    "price": 7,
    "quantity": 20,
    "image": "butter.jpeg",
    "description": "Discover the rich, creamy delight of our butter—perfect for transforming any dish into a gourmet experience!",
    "recipes": {
        "Butter Garlic Prawns": "https://example.com/butter-garlic-prawns",
        "Classic Butter Cookies": "https://example.com/classic-butter-cookies"
    },
    "category": "dairy",
    "in-stock": true
    }
 * Returns a 400 error if no category found for the given name
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/categories/:category/:item", async (req, res) => {
    try {
        let url = "categories/" + req.params.category + "/" + req.params.item;
        let item = await getItemData(url);
        res.json(item);
    } catch (err) {
        res.type("text");
        if (err.code === "ENOENT") {
            res.status(CLIENT_ERR_CODE).send(`No results found for item: ${req.params.category}`);
        } else {
            res.status(SERVER_ERR_CODE).send(SERVER_ERROR);
        }
    }
});

/** 
 * Returns a JSON collection of all categories and items available at this shop.
 * Each category holds an array of item data, with each item having information
 * about the name, price, quantity, image, description, recipes, category and
 * whether it is in stock.
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/products", async (req, res) => {
    try {
        const result = await getMenuData();
        res.json(result);
      } catch (err) {
        res.status(500).send(SERVER_ERROR);
      }
});

// POST endpoints
/**
 * Adds a new item to the <category>-proposals.json file to be approved later.
 * Required POST parameters: name, category, description.
 * Optional POST parameter: image - defaults to food.png otherwise.
 * Response type: text/plain
 * Sends a 400 error if missing one of the 3 required params.
 * Sends a 500 error if something goes wrong in file-processing.
 * Sends a success message otherwise.
 */
app.post("/new-item", async (req, res, next) => {
    try {
        let body = processMsgParams(req.body.name, req.body.category, req.body.description);
        if (!body){
            res.status(CLIENT_ERR_CODE);
            next(Error("Required POST parameters for /new-item: name, category, desc."));
        }
        console.log(req.body);
        let requests = await fs.readFile('requests.json', 'utf8');
        requests = JSON.parse(requests);
        requests.push(body);
        await fs.writeFile('requests.json', JSON.stringify(requests, null, 2), 'utf8');
        res.type('text');
        res.send('Your request has be recieved! It takes beteen 7 and 10 working days for them to be approved.');
    } catch (err) {
        if (err.code === "ENOENT") {
            res.status(CLIENT_ERR_CODE);
            next(Error(`No results found for item: ${req.params.category}`));
        } else {
            res.status(SERVER_ERR_CODE)
            next(SERVER_ERROR);
        }
    }
    
})


/**
 * For every category directory, appneds the item data for each item 
 * in that category to an array that holds all data on all items.
 * @returns {Promise<Object>} A promise that resolves to an array of all item data.
 */
async function getMenuData(){
    let categories = await fs.readdir('categories');
    let dataList= [];
    for (let category of categories){
        if (!category.startsWith(".")){ // handelling hidden folders on mac
            let itemPaths = await globby('categories/'+category+"/", { onlyDirectories : true });
            for (let path of itemPaths){
                let data = await getItemData(path);
                dataList.push(data);
            }
        }
    }
    return dataList;

}

/**
 * Given the directory of the item, returns its data. 
 * Example for "/categories/dairy/butter": 
 * {
    "name": "Butter",
    "price": 7,
    "quantity": 20,
    "image": "butter.jpeg",
    "description": "Discover the rich, creamy delight of our butter—perfect for transforming any dish into a gourmet experience!",
    "recipes": {
        "Butter Garlic Prawns": "https://example.com/butter-garlic-prawns",
        "Classic Butter Cookies": "https://example.com/classic-butter-cookies"
    },
    "category": "dairy",
    "in-stock": true
    }
 * @param {*} namePath - Directory path of item.
 * @returns {Promise<Object>} A promise that resolves to an object containing the items.
 */
async function getItemData(namePath){
    let file = await fs.readFile(namePath + "/info.txt", "utf8");
    const fileContents = file.split('\n');
    const itemName = path.basename(namePath);
    const formattedName = formatTitleCase(itemName);  // ground-beef => Ground Beef
    const price = parseFloat(fileContents[0]);        // 7.00
    const quantity = parseInt(fileContents[1]);       // 20
    const imageName = fileContents[2];                // butter.jpeg
    const desc = fileContents[3];                     // "A rich and matured stack from the flank"
    const recipes = JSON.parse(fileContents[4]);      // {"Butter Garlic Prawns": "https://example.com/butter-garlic-prawns"}
    let dirs = namePath.split("/");
    return {
        name: formattedName,
        price: price,
        quantity: quantity,
        image: imageName,
        description: desc,
        recipes: recipes,
        category: dirs[dirs.length - 2],
        "in-stock" : quantity > 0
    };
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
 * For every category directory, appneds the item data for each item 
 * in that category to an array that holds all data on all items.
 * @param {String} name - name of item to be added
 * @param {String} category - category of item to be added
 * @param {String} desription - description of item to be added
 * @returns {Promise<Object>} A promise that resolves to an object containing the 
 * data of the object to be added.
 */
function processMsgParams(name, category, desription) {
    let result = null;
    if (name && desription) {
      result = {
        "name" : name,
        "category" : category,
        "description" : desription, //defult description to " "
        "timestamp" : new Date().toUTCString()
      };
    }
    return result;
  }

const PORT = process.env.PORT || 8000;
// .listen() starts the server
app.listen(PORT, () => console.log("Listening on port " + PORT));

