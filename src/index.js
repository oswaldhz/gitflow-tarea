const express = require("express");
const { inicializarBD } = require("./db/database");
const productosRoutes = require("./routes/productos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

inicializarBD();

app.get("/", (req, res) => {
  res.json({ mensaje: "API de Productos funcionando correctamente" });
});

app.use("/api/productos", productosRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
