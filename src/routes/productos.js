const express = require("express");
const router = express.Router();
const { crearProducto } = require("../controllers/productosController");

router.post("/", crearProducto);

module.exports = router;
