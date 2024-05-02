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

// Lista de pacientes (carregada do arquivo ou vazia)
let pacientes = carregarPacientes();

// Middleware para parsear JSON
app.use(express.json());

// Rota GET /pacientes
app.get('/pacientes', (req, res) => {
  res.json(pacientes);
});

// Rota POST /cadastro
app.post('/cadastro', (req, res) => {
  const novoPaciente = req.body;

  // Validação básica (verifica se nome e idade estão presentes)
  if (!novoPaciente.nome || !novoPaciente.idade) {
    return res.status(400).json({ erro: "Nome e idade são obrigatórios." });
  }

  // Gerar ID para o novo paciente
  novoPaciente.id = pacientes.length + 1;

  // Adicionar o novo paciente à lista
  pacientes.push(novoPaciente);

  // Salvar os pacientes no arquivo JSON
  salvarPacientes(pacientes);

  // Enviar resposta de sucesso
  res.status(201).json(novoPaciente);
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});