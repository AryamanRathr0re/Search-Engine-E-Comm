const express = require('express');
const controller = require('../controllers/product.controller');

const router = express.Router();

router.post('/product', controller.addProduct);
router.put('/product/meta-data', controller.updateProductMetaData);

module.exports = router;
