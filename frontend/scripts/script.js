const searchKeyword = (e) => {
    e.preventDefault();

    //Shows a loading icon on the screen until searching is completed.
    document.querySelector('.content').innerHTML = '<i style="font-size:30px" class="fa fa-spinner rotation-animation"></i><h2>Searching...</h2>';

    //Clean keyword with sanitize function 
    const keyword = sanitizeString(document.querySelector('input').value);
    //Check if keyword is empty. If true, clean the content of the html element.
    if(keyword == null || keyword == ""){
        document.querySelector('.content').innerHTML = "";
        return;
    }

    const request = new XMLHttpRequest()
    //Backend API URL. Default: http://localhost:5001/api/scrape?keyword=
    request.open('GET', 'http://localhost:5001/api/scrape?keyword='+keyword, true);
    request.send();
    request.onload = function () {
        if(this.readyState == 4 && this.status == 200){
            //Store response
            const response = JSON.parse(this.response);
            //Check if response has an error key and if it is true. Set inner html of .content with a message.
            if(response.hasOwnProperty('error') && response.error){
                document.querySelector('.content').innerHTML = `<h2>Something went wrong!</h2>`;
                return;
            }
            //Check if response is an empty array, which means no products has been found, and set inner html of .content with a message.
            if(response.length == 0){
                document.querySelector('.content').innerHTML = `<h2>No results for: </h2><p>${keyword}</p>`;
                return;
            }
            //Clean content of the html element.
            //For each element(product object) in response array, call productHtml function and append the return value to the html element.
            //Basically apeend products into the html content element.
            document.querySelector('.content').innerHTML = "";
            response.forEach(item => {
                document.querySelector('.content').innerHTML += productHtml(item);
            });
            
        } 
    }
}

//Return the html block of a product replacing its values(image source, title, stars rating and total reviews) with values from the argument object.
const productHtml = (item) => {
    const starsWidth = parseInt(item.stars) * (100 / 5) + ( parseInt((item.stars % parseInt(item.stars)) / 0.25) * 5 );
    const product = `
        <div class="product-container">
            <div class="product-container-img">
                <img src="${item.imageUrl}">
            </div>
            <div class="product-container-data">
                <div class="product-title" title="${item.title}">
                    <h2>${item.title}</h2>
                </div>
                <div class="product-reviews">
                    <div class="stars-outer" title="${item.stars} out of 5 stars">
                        <div class="stars-inner" style="width:${starsWidth}%;"></div>
                    </div>
                    <h4 class="stars"><span class="stars-number">${item.stars}</span> out of <span class="stars-number">5</span> stars</h3>
                    <h4 class="reviews"><span class="reviews-number">${item.reviews.toLocaleString()}</span> reviews</h3>
                </div>
            </div>
        </div>`

    return product;
}

const sanitizeString = (str) => {
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    return str.trim();
}

//Add event listener to the search button. When pressed call searchKeyword function
document.querySelector('button').addEventListener('click', searchKeyword);