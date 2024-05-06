const express = require("express");
const searchController = require("../controllers/search-controller");

const routes = express.Router();

routes.get('/scrape', searchController.searchKeyword);

module.exports = routes;