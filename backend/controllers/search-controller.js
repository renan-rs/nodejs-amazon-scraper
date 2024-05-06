const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const virtualConsole = new jsdom.VirtualConsole();

module.exports = {

  searchKeyword(req, res){
    //Get the query string keyword
    const keyword = req.query.keyword;

    if(keyword != null && keyword != ""){
      //Do a request call to amazon search by keyword.
      //Had to change User-Agent to prevent a block
      axios.get('https://www.amazon.com/s?k='+keyword, 
                {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'}}
      )
      .then(function (response) {
        //Handle success
        //Create DOM object from the response which is a html with products that has been found
        const dom = new JSDOM(response.data, { virtualConsole });

        //Select all products from the html by selecting the result list and then the products 
        //elements which has a class name .s-card-container
        const amazonProducts = dom.window.document.querySelector('.s-result-list.s-search-results')
                                .querySelectorAll('.s-result-item .s-card-container');      

        //Array that will store product objects and it is gonna be the response.
        const products = [];

        //For each product in amazonProducts array it will call parseProductData that returns a product object.
        //Then add the object to the products array.
        amazonProducts.forEach((item) => {
          const productObject = parseProductData(item);
          products.push(productObject);
        });

        //console.log(products);
        //Response products array as json
        res.json(products);
      })
      .catch(function (error) {
          // handle error
          //console.log(error);
          //If any errors the response is an error object
          res.json({"error": true, "details": error});
      });

    } else {
      //if keyword is empty or null the response is an empty array
      res.json([]);
    }
  }

};

//Return an object with image url, title, star rating and total reviews.
const parseProductData = (item) => {
  //Select image element and get the attribute src value
  const productImgUrl = item.querySelector('div > .s-product-image-container img').getAttribute('src');
  //Select product title value
  const productTitle = item.querySelector('div > div:last-child > div[data-cy="title-recipe"] > h2 > a > span').innerHTML;
  
  //Check if stars rating exists. If true sets the variable to its value or set it to 0.
  let productStars = item.querySelector('div > div:last-child span[aria-label*="out of 5 stars"]');
  if(productStars){
    productStars = parseFloat(productStars.getAttribute('aria-label').split(' ')[0]);
  } else {
    productStars = 0;
  }

  //Check if total reviews exists. If true sets the variable to its value or else set it to 0.
  let productTotalReviews = item.querySelector('div > div:last-child span[aria-label*="ratings"]');
  if(productTotalReviews){
    productTotalReviews = parseInt(productTotalReviews.getAttribute('aria-label').split(' ')[0].replace(',',''));
  } else {
    productTotalReviews = 0;
  }

  return {
    "imageUrl": productImgUrl,
    "title": productTitle,
    "stars": productStars,
    "reviews": productTotalReviews
  };
}

virtualConsole.on("error", () => {
  // To skip console errors in CSS parse. Got it on StackOverFlow
  // https://stackoverflow.com/questions/69906136/console-error-error-could-not-parse-css-stylesheet
});