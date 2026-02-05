const express = require('express');
const controller = require('../controllers/search.controller');

const router = express.Router();

router.get('/search/product', controller.searchProducts);

module.exports = router;
