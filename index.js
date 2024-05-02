const express = require('express');
const app = express();
const port = 8080;
const fs = require('fs');

// Funções para carregar e salvar pacientes
function carregarPacientes() {
  try {
    const dados = fs.readFileSync('pacientes.json');
    return JSON.parse(dados);
  } catch (err) {
    return [];
  }
}

function salvarPacientes(pacientes) {
  const dados = JSON.stringify(pacientes, null, 2);
  fs.writeFileSync('pacientes.json', dados);
}

// Lista inicial de pacientes
let pacientes = [
  { id: 1, nome: "Maria Silva", idade: 30 },
  { id: 2, nome: "João Santos", idade: 45 }
];

// Salvar os pacientes iniciais no arquivo, se ele não existir
if (!fs.existsSync('pacientes.json')) {
  salvarPacientes(pacientes);
}

// Middleware para parsear JSON
app.use(express.json());

// Rota GET /pacientes
app.get('/pacientes', (req, res) => {
  res.json(pacientes);
});

// Rota POST /pacientes
app.post('/pacientes', (req, res) => {
  const novoPaciente = req.body;
  novoPaciente.id = pacientes.length + 1;
  pacientes.push(novoPaciente);
  salvarPacientes(pacientes);
  res.status(201).json(novoPaciente);
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});