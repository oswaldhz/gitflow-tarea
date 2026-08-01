const API_URL = "/api/productos";

const el = {
  grid: document.getElementById("grid-productos"),
  estadoVacio: document.getElementById("estado-vacio"),
  conteo: document.getElementById("conteo-resultados"),
  filtros: document.getElementById("filtro-categorias"),
  overlay: document.getElementById("overlay"),
  panel: document.getElementById("panel-formulario"),
  panelTitulo: document.getElementById("panel-titulo"),
  form: document.getElementById("form-producto"),
  formError: document.getElementById("form-error"),
  campoId: document.getElementById("producto-id"),
  campoNombre: document.getElementById("campo-nombre"),
  campoDescripcion: document.getElementById("campo-descripcion"),
  campoPrecio: document.getElementById("campo-precio"),
  campoStock: document.getElementById("campo-stock"),
  campoCategoria: document.getElementById("campo-categoria"),
  listaCategorias: document.getElementById("lista-categorias"),
  toast: document.getElementById("toast"),
};

let productos = [];
let categoriaActiva = "";

// ---------- Utilidades ----------

function formatearSKU(id) {
  return `PRD-${String(id).padStart(4, "0")}`;
}

function formatearPrecio(precio) {
  return `$${Number(precio).toFixed(2)}`;
}

function nivelStock(stock) {
  if (stock <= 5) return "critico";
  if (stock <= 20) return "bajo";
  return "ok";
}

function mostrarToast(mensaje) {
  el.toast.textContent = mensaje;
  el.toast.classList.remove("oculto");
  setTimeout(() => el.toast.classList.add("oculto"), 2600);
}

// ---------- Carga de datos ----------

async function cargarProductos() {
  try {
    const url = categoriaActiva
      ? `${API_URL}?categoria=${encodeURIComponent(categoriaActiva)}`
      : API_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo obtener el inventario");
    productos = await res.json();
    renderCategorias();
    renderProductos();
  } catch (err) {
    mostrarToast("Error al cargar el inventario");
    console.error(err);
  }
}

// ---------- Render ----------

function renderCategorias() {
  fetch(API_URL)
    .then((r) => r.json())
    .then((todos) => {
      const categorias = [
        ...new Set(todos.map((p) => p.categoria).filter(Boolean)),
      ].sort();

      el.filtros.innerHTML = "";
      const chipTodas = crearChip("", "Todas");
      el.filtros.appendChild(chipTodas);
      categorias.forEach((cat) => el.filtros.appendChild(crearChip(cat, cat)));

      el.listaCategorias.innerHTML = categorias
        .map((cat) => `<option value="${escapeHTML(cat)}"></option>`)
        .join("");
    })
    .catch(() => {});
}

function crearChip(valor, etiqueta) {
  const btn = document.createElement("button");
  btn.className = "chip" + (categoriaActiva === valor ? " is-active" : "");
  btn.textContent = etiqueta;
  btn.dataset.categoria = valor;
  btn.addEventListener("click", () => {
    categoriaActiva = valor;
    cargarProductos();
  });
  return btn;
}

function renderProductos() {
  el.conteo.textContent = `${productos.length} artículo${productos.length === 1 ? "" : "s"}`;

  if (productos.length === 0) {
    el.grid.innerHTML = "";
    el.estadoVacio.classList.remove("oculto");
    return;
  }

  el.estadoVacio.classList.add("oculto");
  el.grid.innerHTML = productos.map(tarjetaHTML).join("");

  productos.forEach((p) => {
    document
      .querySelector(`[data-editar="${p.id}"]`)
      ?.addEventListener("click", () => abrirFormularioEdicion(p));
    document
      .querySelector(`[data-eliminar="${p.id}"]`)
      ?.addEventListener("click", () => eliminarProducto(p.id));
  });
}

function tarjetaHTML(p) {
  const nivel = nivelStock(p.stock);
  const porcentaje = Math.max(6, Math.min(100, (p.stock / 60) * 100));

  return `
    <article class="tarjeta">
      <div class="tarjeta-top">
        <span class="tarjeta-sku">${formatearSKU(p.id)}</span>
        <span class="tarjeta-categoria">${escapeHTML(p.categoria || "general")}</span>
      </div>
      <h3 class="tarjeta-nombre">${escapeHTML(p.nombre)}</h3>
      <p class="tarjeta-descripcion">${escapeHTML(p.descripcion || "Sin descripción registrada.")}</p>
      <div class="tarjeta-precio">${formatearPrecio(p.precio)}</div>
      <div class="tarjeta-stock">
        <div class="tarjeta-stock-label">
          <span>existencias</span>
          <span>${p.stock} u.</span>
        </div>
        <div class="gauge"><div class="gauge-fill ${nivel}" style="width:${porcentaje}%"></div></div>
      </div>
      <div class="tarjeta-fecha">registrado ${escapeHTML(p.fecha_creacion || "")}</div>
      <div class="tarjeta-acciones">
        <button data-editar="${p.id}">Editar</button>
        <button class="accion-eliminar" data-eliminar="${p.id}">Eliminar</button>
      </div>
    </article>
  `;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---------- Formulario: crear / editar ----------

function abrirFormularioNuevo() {
  el.panelTitulo.textContent = "Nueva ficha de producto";
  el.form.reset();
  el.campoId.value = "";
  ocultarError();
  abrirPanel();
}

function abrirFormularioEdicion(producto) {
  el.panelTitulo.textContent = `Editar ${producto.nombre}`;
  el.campoId.value = producto.id;
  el.campoNombre.value = producto.nombre;
  el.campoDescripcion.value = producto.descripcion || "";
  el.campoPrecio.value = producto.precio;
  el.campoStock.value = producto.stock;
  el.campoCategoria.value = producto.categoria || "";
  ocultarError();
  abrirPanel();
}

function abrirPanel() {
  el.overlay.classList.remove("oculto");
  el.panel.classList.remove("oculto");
  el.campoNombre.focus();
}

function cerrarPanel() {
  el.overlay.classList.add("oculto");
  el.panel.classList.add("oculto");
}

function mostrarError(mensaje) {
  el.formError.textContent = mensaje;
  el.formError.classList.remove("oculto");
}

function ocultarError() {
  el.formError.classList.add("oculto");
}

async function manejarSubmit(evento) {
  evento.preventDefault();
  ocultarError();

  const id = el.campoId.value;
  const payload = {
    nombre: el.campoNombre.value.trim(),
    descripcion: el.campoDescripcion.value.trim(),
    precio: parseFloat(el.campoPrecio.value),
    stock: parseInt(el.campoStock.value, 10),
    categoria: el.campoCategoria.value.trim() || "general",
  };

  if (!payload.nombre || Number.isNaN(payload.precio)) {
    mostrarError("Nombre y precio son obligatorios.");
    return;
  }

  try {
    const res = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      mostrarError(data.error || "No se pudo guardar el producto");
      return;
    }

    cerrarPanel();
    mostrarToast(id ? "Ficha actualizada" : "Producto registrado");
    await cargarProductos();
  } catch (err) {
    mostrarError("Error de conexión con el servidor");
    console.error(err);
  }
}

async function eliminarProducto(id) {
  const confirmar = confirm(
    "¿Eliminar esta ficha de producto? Esta acción no se puede deshacer.",
  );
  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo eliminar");
    mostrarToast("Producto eliminado");
    await cargarProductos();
  } catch (err) {
    mostrarToast("Error al eliminar el producto");
    console.error(err);
  }
}

// ---------- Datos de muestra ----------

async function cargarInventarioMuestra() {
  try {
    const res = await fetch(`${API_URL}/seed`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo cargar la muestra");
    mostrarToast(`${data.insertados} productos de muestra agregados`);
    await cargarProductos();
  } catch (err) {
    mostrarToast("Error al cargar el inventario de muestra");
    console.error(err);
  }
}

// ---------- Eventos ----------

document
  .getElementById("btn-nuevo")
  .addEventListener("click", abrirFormularioNuevo);
document
  .getElementById("btn-nuevo-vacio")
  .addEventListener("click", abrirFormularioNuevo);
document.getElementById("btn-cancelar").addEventListener("click", cerrarPanel);
document
  .getElementById("btn-cerrar-panel")
  .addEventListener("click", cerrarPanel);
document.getElementById("overlay").addEventListener("click", cerrarPanel);
document
  .getElementById("btn-seed")
  .addEventListener("click", cargarInventarioMuestra);
el.form.addEventListener("submit", manejarSubmit);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarPanel();
});

// ---------- Inicio ----------

cargarProductos();
