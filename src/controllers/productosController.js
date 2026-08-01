const { db } = require("../db/database");
const { formatearFecha } = require("../utils/formatDate");

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
    const productosFormateados = filas.map((p) => ({
      ...p,
      fecha_creacion: formatearFecha(p.fecha_creacion),
    }));
    res.json(productosFormateados);
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
    res.json({ ...fila, fecha_creacion: formatearFecha(fila.fecha_creacion) });
  });
};

// Actualizar un producto
const actualizarProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, categoria } = req.body;

  db.get("SELECT * FROM productos WHERE id = ?", [id], (err, existente) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al buscar el producto", detalle: err.message });
    }
    if (!existente) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const sql = `
      UPDATE productos
      SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?
      WHERE id = ?
    `;
    const valores = [
      nombre ?? existente.nombre,
      descripcion ?? existente.descripcion,
      precio ?? existente.precio,
      stock ?? existente.stock,
      categoria ?? existente.categoria,
      id,
    ];

    db.run(sql, valores, function (err) {
      if (err) {
        return res.status(500).json({
          error: "Error al actualizar el producto",
          detalle: err.message,
        });
      }
      res.json({ mensaje: "Producto actualizado correctamente" });
    });
  });
};

// Eliminar un producto
const eliminarProducto = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM productos WHERE id = ?", [id], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al eliminar el producto", detalle: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ mensaje: "Producto eliminado correctamente" });
  });
};

module.exports = {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto,
};
