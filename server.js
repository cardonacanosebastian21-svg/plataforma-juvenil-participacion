const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const rutaCandidatos = path.join(__dirname, "data", "candidatos.json");

function leerCandidatos() {
  const data = fs.readFileSync(rutaCandidatos, "utf8");
  return JSON.parse(data);
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

app.listen(PORT, function () {
  console.log("Servidor escuchando en http://localhost:" + PORT);
});


