const express = require("express");
const router = express.Router();
var mongoose = require("mongoose");
var ProductModel = require("../models/product");

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_CONFIG}?retryWrites=true&w=majority`
); // connect to our database.
/**
 * GET product list.
 *
 * @return product list | empty.
 */
router.get("/", async (req, res) => {
  try {
    ProductModel.find(function (err, product) {
      if (err) res.send(err);
      res.json(product);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
