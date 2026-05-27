const botonMensaje = document.getElementById("btnMensaje");
const mensajeClase = document.getElementById("mensajeClase");

botonMensaje.addEventListener("click", function () {
  mensajeClase.textContent =
    "Clase 27: avanzamos en la estructura del proyecto conectando HTML, CSS y JavaScript.";
});

const listaCandidatos = document.getElementById("listaCandidatos");
const detallePerfil = document.getElementById("detallePerfil");
const formCandidato = document.getElementById("formCandidato");
const mensajeFormulario = document.getElementById("mensajeFormulario");
const tituloFormulario = document.querySelector(".formulario-candidato h2");
const botonGuardar = formCandidato.querySelector('button[type="submit"]');
let candidatosActuales = [];
let idEnEdicion = null;

function leerRespuesta(respuesta) {
  return respuesta.text().then(function (texto) {
    let datos = {};
    if (texto) {
      try {
        datos = JSON.parse(texto);
      } catch (error) {
        datos = {};
      }
    }

    return {
      ok: respuesta.ok,
      status: respuesta.status,
      datos: datos
    };
  });
}

function mostrarMensajeFormulario(texto, esError) {
  mensajeFormulario.textContent = texto;
  mensajeFormulario.className = "mensaje-formulario";

  if (esError) {
    mensajeFormulario.classList.add("mensaje-formulario--error");
  } else {
    mensajeFormulario.classList.add("mensaje-formulario--exito");
  }
}

function crearTarjetaCandidato(candidato) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta-candidato";

  tarjeta.innerHTML = `
    <h3>${candidato.nombre}</h3>
    <p><strong>Rol:</strong> ${candidato.rol}</p>
    <p><strong>Propuesta:</strong> ${candidato.propuesta}</p>
    <p><strong>Estado:</strong> ${candidato.estado}</p>
    <div class="acciones-candidato">
      <button type="button" class="btnPerfil" data-id="${candidato.id}">
        Ver información
      </button>
      <button type="button" class="btnEditar" data-id="${candidato.id}">
        Editar
      </button>
      <button type="button" class="btnEliminar" data-id="${candidato.id}">
        Eliminar
      </button>
    </div>
  `;

  return tarjeta;
}

function mostrarDetalleCandidato(candidato) {
  detallePerfil.innerHTML = `
    <h3>Información del perfil</h3>
    <p><strong>Nombre:</strong> ${candidato.nombre}</p>
    <p><strong>Rol:</strong> ${candidato.rol}</p>
    <p><strong>Propuesta:</strong> ${candidato.propuesta}</p>
    <p><strong>Estado:</strong> ${candidato.estado}</p>
    <p>
      Este perfil es ficticio y se utiliza únicamente como parte de una práctica académica.
    </p>
  `;
}

function resetFormulario() {
  idEnEdicion = null;
  formCandidato.reset();
  tituloFormulario.textContent = "Registrar perfil de práctica";
  botonGuardar.textContent = "Guardar perfil";
}

function iniciarEdicion(candidato) {
  idEnEdicion = Number(candidato.id);
  document.getElementById("nombre").value = candidato.nombre;
  document.getElementById("rol").value = candidato.rol;
  document.getElementById("propuesta").value = candidato.propuesta;
  tituloFormulario.textContent = "Editar perfil de práctica";
  botonGuardar.textContent = "Actualizar perfil";
  mostrarMensajeFormulario("Editando perfil: " + candidato.nombre, false);
}

function eliminarCandidato(id) {
  fetch("/api/candidatos/" + id, {
    method: "DELETE"
  })
    .then(leerRespuesta)
    .then(function ({ ok, status, datos }) {
      if (!ok) {
        if (status === 404) {
          mostrarMensajeFormulario(
            "La ruta de eliminar no está activa. Reinicia el servidor con npm.cmd start.",
            true
          );
          return;
        }
        mostrarMensajeFormulario(datos.mensaje || "No se pudo eliminar", true);
        return;
      }

      if (idEnEdicion === id) {
        resetFormulario();
      }

      detallePerfil.innerHTML = "<p>Perfil eliminado correctamente.</p>";
      mostrarMensajeFormulario(datos.mensaje || "Candidato eliminado correctamente", false);
      cargarCandidatos();
    })
    .catch(function () {
      mostrarMensajeFormulario("Error de conexión al eliminar el perfil.", true);
    });
}

function cargarCandidatos() {
  fetch("/api/candidatos")
    .then(function (respuesta) {
      if (!respuesta.ok) {
        throw new Error("No se pudo cargar la lista");
      }
      return respuesta.json();
    })
    .then(function (candidatos) {
      candidatosActuales = candidatos;
      listaCandidatos.innerHTML = "";

      if (candidatos.length === 0) {
        listaCandidatos.innerHTML =
          "<p class='lista-vacia'>Aún no hay perfiles. Usa el formulario para crear el primero.</p>";
        return;
      }

      candidatos.forEach(function (candidato) {
        listaCandidatos.appendChild(crearTarjetaCandidato(candidato));
      });

      detallePerfil.innerHTML =
        "<p>Selecciona un candidato para ver su información completa.</p>";
    })
    .catch(function () {
      candidatosActuales = [];
      listaCandidatos.innerHTML =
        "<p class='lista-vacia'>No se pudo conectar al servidor. Ejecuta: npm start</p>";
      mostrarMensajeFormulario(
        "Inicia el servidor con npm start y abre http://localhost:3000",
        true
      );
    });
}

listaCandidatos.addEventListener("click", function (evento) {
  const botonAccion = evento.target.closest("button");
  if (!botonAccion) {
    return;
  }

  const id = Number(botonAccion.dataset.id);
  const candidato = candidatosActuales.find(function (item) {
    return Number(item.id) === id;
  });

  if (!candidato) {
    mostrarMensajeFormulario("No se encontró el perfil seleccionado.", true);
    return;
  }

  if (botonAccion.classList.contains("btnPerfil")) {
    mostrarDetalleCandidato(candidato);
    return;
  }

  if (botonAccion.classList.contains("btnEditar")) {
    iniciarEdicion(candidato);
    return;
  }

  if (botonAccion.classList.contains("btnEliminar")) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar el perfil '" + candidato.nombre + "'?"
    );
    if (!confirmar) {
      return;
    }
    eliminarCandidato(id);
  }
});

formCandidato.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const datos = {
    nombre: document.getElementById("nombre").value.trim(),
    rol: document.getElementById("rol").value.trim(),
    propuesta: document.getElementById("propuesta").value.trim()
  };

  const metodo = idEnEdicion ? "PUT" : "POST";
  const ruta = idEnEdicion
    ? "/api/candidatos/" + idEnEdicion
    : "/api/candidatos";

  fetch(ruta, {
    method: metodo,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  })
    .then(leerRespuesta)
    .then(function ({ ok, datos }) {
      if (!ok) {
        mostrarMensajeFormulario(datos.mensaje || "Error al guardar", true);
        return;
      }

      resetFormulario();
      mostrarMensajeFormulario(datos.mensaje || "Perfil guardado correctamente", false);
      cargarCandidatos();
    })
    .catch(function () {
      mostrarMensajeFormulario(
        "No se pudo guardar. Verifica que el servidor esté activo (npm start).",
        true
      );
    });
});

cargarCandidatos();

app.get("/api/votos", function (req, res) {
  const votos = leerVotos();
  res.json(votos);
});

app.post("/api/votos", function (req, res) {
  const identificacion = req.body.identificacion;
  const candidato = req.body.candidato;

  if (!identificacion || !candidato) {
    return res.status(400).json({
      mensaje: "Faltan datos: identificación o candidato"
    });
  }

  const votos = leerVotos();

  const yaVoto = votos.find(function (voto) {
    return voto.identificacion === identificacion;
  });

  if (yaVoto) {
    return res.status(400).json({
      mensaje: "Esta identificación ya registró un voto pedagógico"
    });
  }

  const nuevoVoto = {
    id: Date.now(),
    identificacion: identificacion,
    candidato: candidato,
    fecha: new Date().toISOString()
  };

  votos.push(nuevoVoto);
  guardarVotos(votos);

  res.status(201).json({
    mensaje: "Voto pedagógico guardado correctamente",
    voto: nuevoVoto
  });
});