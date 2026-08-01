const express = require("express");
const router = express.Router();
const {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
} = require("../controllers/productosController");

router.post("/", crearProducto);
router.get("/", listarProductos);
router.get("/:id", obtenerProducto);
router.put("/:id", actualizarProducto);

module.exports = router;
