const { db } = require("../db/database");

// Crear un producto
const crearProducto = (req, res) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;

  if (!nombre || precio === undefined) {
    return res
      .status(400)
      .json({ error: 'Los campos "nombre" y "precio" son obligatorios' });
  }

  const fecha_creacion = new Date().toISOString();

  const sql = `
    INSERT INTO productos (nombre, descripcion, precio, stock, categoria, fecha_creacion)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const valores = [
    nombre,
    descripcion || "",
    precio,
    stock || 0,
    categoria || "general",
    fecha_creacion,
  ];

  db.run(sql, valores, function (err) {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al crear el producto", detalle: err.message });
    }
    res.status(201).json({
      mensaje: "Producto creado correctamente",
      id: this.lastID,
    });
  });
};

// Listar todos los productos (con filtro opcional por categoria)
const listarProductos = (req, res) => {
  const { categoria } = req.query;

  let sql = "SELECT * FROM productos";
  const params = [];

  if (categoria) {
    sql += " WHERE categoria = ?";
    params.push(categoria);
  }

  db.all(sql, params, (err, filas) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al listar productos", detalle: err.message });
    }
    res.json(filas);
  });
};

// Obtener un producto por ID
const obtenerProducto = (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM productos WHERE id = ?", [id], (err, fila) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al buscar el producto", detalle: err.message });
    }
    if (!fila) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(fila);
  });
};

module.exports = { crearProducto, listarProductos, obtenerProducto };
