const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(__dirname));

const rutaCandidatos = path.join(__dirname, "data", "candidatos.json");

function leerCandidatos() {
  const data = fs.readFileSync(rutaCandidatos, "utf8");
  return JSON.parse(data);
}

const rutaVotos = path.join(__dirname, "data", "votos.json");

function leerVotos() {
  const data = fs.readFileSync(rutaVotos, "utf8");
  return JSON.parse(data);
}

function guardarVotos(votos) {
  fs.writeFileSync(rutaVotos, JSON.stringify(votos, null, 2));
}

function guardarCandidatos(candidatos) {
  fs.writeFileSync(rutaCandidatos, JSON.stringify(candidatos, null, 2));
}

app.get("/api/candidatos", function (req, res) {
  const candidatos = leerCandidatos();
  res.json(candidatos);
});

app.post("/api/candidatos", function (req, res) {
  const nuevoCandidato = {
    id: Date.now(),
    nombre: req.body.nombre,
    rol: req.body.rol,
    propuesta: req.body.propuesta,
    estado: "Perfil de práctica académica"
  };

  if (!nuevoCandidato.nombre || !nuevoCandidato.rol || !nuevoCandidato.propuesta) {
    return res.status(400).json({
      mensaje: "Faltan datos obligatorios"
    });
  }

  const candidatos = leerCandidatos();
  candidatos.push(nuevoCandidato);
  guardarCandidatos(candidatos);

  res.status(201).json({
    mensaje: "Candidato guardado correctamente",
    candidato: nuevoCandidato
  });
});

app.put("/api/candidatos/:id", function (req, res) {
  const id = Number(req.params.id);
  const nombre = req.body.nombre;
  const rol = req.body.rol;
  const propuesta = req.body.propuesta;

  if (!nombre || !rol || !propuesta) {
    return res.status(400).json({
      mensaje: "Faltan datos obligatorios"
    });
  }

  const candidatos = leerCandidatos();
  const indice = candidatos.findIndex(function (item) {
    return Number(item.id) === id;
  });

  if (indice === -1) {
    return res.status(404).json({
      mensaje: "Candidato no encontrado"
    });
  }

  candidatos[indice] = {
    ...candidatos[indice],
    nombre: nombre,
    rol: rol,
    propuesta: propuesta
  };

  guardarCandidatos(candidatos);

  res.json({
    mensaje: "Candidato actualizado correctamente",
    candidato: candidatos[indice]
  });
});

app.delete("/api/candidatos/:id", function (req, res) {
  const id = Number(req.params.id);
  const candidatos = leerCandidatos();
  const nuevosCandidatos = candidatos.filter(function (item) {
    return Number(item.id) !== id;
  });

  if (nuevosCandidatos.length === candidatos.length) {
    return res.status(404).json({
      mensaje: "Candidato no encontrado"
    });
  }

  guardarCandidatos(nuevosCandidatos);
  res.json({
    mensaje: "Candidato eliminado correctamente"
  });
});

app.listen(PORT, function () {
  console.log("Servidor escuchando en http://localhost:" + PORT);
});
