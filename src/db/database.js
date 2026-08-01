const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "..", "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

const inicializarBD = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      categoria TEXT,
      fecha_creacion TEXT NOT NULL
    )
  `;

  db.run(sql, (err) => {
    if (err) {
      console.error("Error al crear la tabla productos:", err.message);
    } else {
      console.log('Tabla "productos" lista.');
    }
  });
};

module.exports = { db, inicializarBD };
