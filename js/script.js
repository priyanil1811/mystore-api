document.addEventListener("DOMContentLoaded", function () {
    
    // List of categories we don't want to display to keep data clean on website
    const trashCategories = ['', null, 'wwww', 'GG', 'ხილი', 'string', 'ngbvnbvnbv'];

    // Declare products array, this array will contain all products info in particular category
    let products = new Array();

    // get categories from API
    function getCategories() {
        
        // API call to get categories
        fetch("https://my-store2.p.rapidapi.com/catalog/categories", {
            "method": "GET",
            "headers": {
                "x-rapidapi-key": "ef872c9123msh3fdcc085935d35dp17730cjsncc96703109e1",
                "x-rapidapi-host": "my-store2.p.rapidapi.com"
            }
        })
        .then(response => {
            return response.json();
        })
        .then(response => {

            // call display catgories to display it on screen
            displayCategories(response);
        })
        .catch(err => {
            console.error(err);
        });
    }

    // display categories that we got from getCategories func
    function displayCategories(categories) {

        // empty variable which will contain html string for categories
        let categoriesListingHtml = '';

        // variable to create diff id for categories in loop
        let num = 1;

        categories['categories'].forEach(category => {

            let categoryName = category['category'];

            // if not trash categories, concat as string in variable
            if(!trashCategories.includes(categoryName)) {
                categoriesListingHtml += `<li><a id="category${num}" href="#">${categoryName}</a></li>`;
                num++;
            }
       
        });

        // add html string to document to display on screen 
        document.querySelector('.categories').innerHTML = categoriesListingHtml;

        // reset variable so that we can use same category id to add click event listner
        num = 1;

        categories['categories'].forEach(category => {

            categoryName = category['category'];

            if(!trashCategories.includes(categoryName)) {

                // add event listener for category, this will be used to get products in that category
                document.getElementById(`category${num}`).addEventListener("click", getProductsInCategory);
                num++;
            }
                        
        });

        // get products for first category in list
        document.getElementById('category1').click();
    }

    // Get list of product ids in particular category
    function getProductsInCategory() {

        // reset product array
        products = [];

        // get category from menu
        let category = this.innerHTML;

        // API call to get products in category
        fetch(`https://my-store2.p.rapidapi.com/catalog/category/${category}/products?limit=20&skip=0`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-key": "ef872c9123msh3fdcc085935d35dp17730cjsncc96703109e1",
                "x-rapidapi-host": "my-store2.p.rapidapi.com"
            }
        })
        .then(response => {
            return response.json();
        })
        .then(response => {

            // varialbe to decide product counter, starts with 1
            let items = 1;

            // total number of products
            let total_item = response['products'].length;

            // set default call to display product func to false, we will set it to true once all product details are collected
            let callDisplayProduct = false;

            response['products'].forEach(product => {

                // if it is last product
                if(items == total_item) {

                    // set true so that it calls display product func
                    callDisplayProduct = true;
                }

                // get product details by product id
                getProductDetail(product['id'], callDisplayProduct);  
                items++;        
                
            });

        })
        .catch(err => {
            console.error(err);
        });
    }

    // get all details of particular product
    function getProductDetail(productId, callDisplayProduct) {

        // API call to get product details
        fetch(`https://my-store2.p.rapidapi.com/catalog/product/${productId}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-key": "ef872c9123msh3fdcc085935d35dp17730cjsncc96703109e1",
                "x-rapidapi-host": "my-store2.p.rapidapi.com"
            }
        })
        .then(response => {
            return response.json();
        })
        .then(response => {

            // add product in array
            products.push(response);

            // if it is true means this was last product under this category
            if(callDisplayProduct) {
                displayProducts();
            }
        })
        .catch(err => {
            console.error(err);
        });

    }

    // display all products in particular category
    function displayProducts() {

        // create variable with empty string, it will contain product details HTML
        let productsListingHtml = '';
        
        products.forEach(product => {
            
            productsListingHtml += `<div class="product"><p><b>${product['name']}</b></p><p>${product['description']}</p><p>$${product['price']}</p><p>${product['manufacturer']}</p><button id="${product['id']}" class="button">Delete</button></div>`;
               
        });

        // add product html string to document to display on screen
        document.querySelector('.products').innerHTML = productsListingHtml;

        products.forEach(product => {

            // add event listener for product, this will be used to delete product
            document.getElementById(`${product['id']}`).addEventListener("click", deleteProduct);
                        
        });

    }

    // create a new product
    function createProduct() {

        // array with all details of product
        const data = JSON.stringify({
            "name": document.getElementById('name').value,
            "price": document.getElementById('price').value,
            "manufacturer": document.getElementById('manufacturer').value,
            "category": document.getElementById('category').value,
            "description": document.getElementById('description').value,
            "tags": ""
        });
        
        // API call to add product
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {

                // redirect to home page once product has been added
                window.location.href = "index.html";
            }
        });
        
        xhr.open("POST", "https://my-store2.p.rapidapi.com/catalog/product");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("x-rapidapi-key", "ef872c9123msh3fdcc085935d35dp17730cjsncc96703109e1");
        xhr.setRequestHeader("x-rapidapi-host", "my-store2.p.rapidapi.com");
        
        xhr.send(data);

    }

    function deleteProduct() {
        fetch(`https://my-store2.p.rapidapi.com/catalog/product/${this.id}`, {
            "method": "DELETE",
            "headers": {
                "x-rapidapi-key": "ef872c9123msh3fdcc085935d35dp17730cjsncc96703109e1",
                "x-rapidapi-host": "my-store2.p.rapidapi.com"
            }
        })
        .then(response => {
            if(response.status == 200) {

                // remove from html if deleted in API
                this.parentNode.parentNode.removeChild(this.parentNode);
            }
        })
        .catch(err => {
            console.error(err);
        });
    }
    
    // add click event for submit button of create product form if it is on create product page
    if(document.getElementById(`btnSubmit`)) {
        document.getElementById(`btnSubmit`).addEventListener("click", createProduct);
    }

    // call getCategories if it is on home page where we have div that will display list of categories
    if(document.querySelector(`.productByCategories`)) {
        getCategories();
    } 

});