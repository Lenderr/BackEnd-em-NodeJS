const express = require('express');
const app = express();
const port = 8080;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Funções para carregar e salvar pacientes
function carregarPacientes() {
  if (!fs.existsSync('pacientes.json')) {
    return [];
  }
  
  try {
    const dados = fs.readFileSync('pacientes.json');
    return JSON.parse(dados);
  } catch (err) {
    console.error('Erro ao carregar pacientes:', err);
    return [];
  }
}

function salvarPacientes(pacientes) {
  const dados = JSON.stringify(pacientes, null, 2);
  try {
    fs.writeFileSync('pacientes.json', dados);
  } catch (err) {
    console.error('Erro ao salvar pacientes:', err);
  }
}

// Lista de pacientes (carregada do arquivo ou vazia)
let pacientes = carregarPacientes();

// Middleware para parsear JSON
app.use(express.json());

// Função para gerar um número aleatório dentro de um intervalo
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para gerar uma data aleatória no formato AAAA-MM-DD
function getRandomDate(startDate, endDate) {
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();
  const randomTimestamp = getRandomInt(startTimestamp, endTimestamp);

  const randomDate = new Date(randomTimestamp);

  const year = randomDate.getFullYear();
  const month = ('0' + (randomDate.getMonth() + 1)).slice(-2);
  const day = ('0' + randomDate.getDate()).slice(-2);

  return `${year}-${month}-${day}`; 
}

// Função para gerar um nome aleatório (simples)
function getRandomName() {
  const nomes = ['Alice', 'Bob', 'Carlos', 'Diana', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia'];
  return nomes[getRandomInt(0, nomes.length - 1)];
}

// Função para gerar um email aleatório (simples)
function getRandomEmail() {
  return `${getRandomName().toLowerCase()}@example.com`;
}

// Validação básica de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Rota GET /pacientes
app.get('/pacientes', (req, res) => {
  res.json(pacientes);
});

// Rota POST /cadastro
app.post('/cadastro', (req, res) => {
  const { nome, idade, email, data } = req.body;

  // Validação básica
  if (!nome || !idade || !email || !data) {
    return res.status(400).json({ erro: "Nome, idade, email e data são obrigatórios." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ erro: "Email inválido." });
  }

  // Gerar ID para o novo paciente
  const novoPaciente = { id: uuidv4(), nome, idade, email, data };

  // Adicionar o novo paciente à lista
  pacientes.push(novoPaciente);

  // Salvar os pacientes no arquivo JSON
  salvarPacientes(pacientes);

  // Enviar resposta de sucesso
  res.status(201).json(novoPaciente);
});

// Rota GET /cardInfo 
app.get('/cardInfo', (req, res) => {
  const cardInfo = pacientes.map(paciente => ({
    nome: paciente.nome,
    id: paciente.id.toString(),
    data: new Date(paciente.data),
    imagem: paciente.imagem
  }));

  cardInfo.sort((a, b) => a.data - b.data);

  const cardInfoFormatado = cardInfo.map(info => ({
    ...info,
    data: info.data instanceof Date && !isNaN(info.data) ? info.data.toLocaleDateString('pt-BR') : 'Data inválida'
  }));

  res.json(cardInfoFormatado);
});

// Rota POST /ramCreate
app.post('/ramCreate', (req, res) => {
  const novoPaciente = {
    id: uuidv4(),
    nome: getRandomName(),
    idade: getRandomInt(18, 65),
    email: getRandomEmail(),
    data: getRandomDate(new Date('2023-01-01'), new Date()),
    imagem: getRandomInt(1, 11)
  };

  pacientes.push(novoPaciente);
  salvarPacientes(pacientes);

  res.status(201).json(novoPaciente);
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
