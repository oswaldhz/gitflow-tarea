const express = require("express");
const router = express.Router();
const {
  crearProducto,
  listarProductos,
  obtenerProducto,
} = require("../controllers/productosController");

router.post("/", crearProducto);
router.get("/", listarProductos);
router.get("/:id", obtenerProducto);

module.exports = router;
