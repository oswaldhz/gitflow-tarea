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

module.exports = { crearProducto };
