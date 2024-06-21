const express = require('express');
const app = express();
const port = 8080;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const faker = require('faker-br');

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


app.use(express.json());

// Funções para gerar dados aleatórios
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(startDate, endDate) {
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();
  const randomTimestamp = getRandomInt(startTimestamp, endTimestamp);

  const randomDate = new Date(randomTimestamp);

  const year = randomDate.getFullYear();
  const month = ('0' + (randomDate.getMonth() + 1)).slice(-2);
  const day = ('0' + randomDate.getDate()).slice(-2);

  return `${day}-${month}-${year}`;
}

function getRandomName() {
  const nomes = ['Alice', 'Bob', 'Carlos', 'Diana', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia'];
  return nomes[getRandomInt(0, nomes.length - 1)];
}

function getRandomEmail() {
  return `${getRandomName().toLowerCase()}@examplo.com`;
}

function getRandomCPF() {
  return cpf.generate();
}

function getRandomRG() {
  return faker.br.rg();
}

function getRandomPhoneNumber() {
  return faker.phone.phoneNumber('(##) #####-####');
}


function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


app.get('/pacientes', (req, res) => {
  res.json(pacientes);
});

app.post('/cadastro', (req, res) => {
  const { nome, idade, email, data, cpf, rg, telefone, contatoEmergencia } = req.body;
  const cpfValue = req.body.cpf; 

  if (!nome || !idade || !email || !data || !cpf || !rg || !telefone || !contatoEmergencia) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ erro: "Email inválido." });
  }

  if (!contatoEmergencia.nome || !contatoEmergencia.telefone) {
    return res.status(400).json({ erro: "Nome e telefone do contato de emergência são obrigatórios." });
  }

  const novoPaciente = {
    id: uuidv4(),
    nome,
    idade,
    email,
    data,
    cpf,
    rg,
    telefone,
    contatoEmergencia
  };
 
  pacientes.push(novoPaciente);
  salvarPacientes(pacientes);

  res.status(201).json(novoPaciente);
});


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

app.post('/ramCreate', (req, res) => {
  const novoPaciente = {
    id: uuidv4(),
    nome: getRandomName(),
    idade: getRandomInt(18, 65),
    email: getRandomEmail(),
    data: getRandomDate(new Date('2023-01-01'), new Date()),
    imagem: getRandomInt(1, 11),
    cpf: getRandomCPF(),
    rg: getRandomRG(),
    telefone: getRandomPhoneNumber(),
    contatoEmergencia: {
      nome: getRandomName(),
      telefone: getRandomPhoneNumber()
    }
  };

  pacientes.push(novoPaciente);
  salvarPacientes(pacientes);

  res.status(201).json(novoPaciente);
});

app.get('/paciente/:id', (req, res) => {
  const pacienteId = req.params.id;
  const paciente = pacientes.find(p => p.id === pacienteId);

  if (!paciente) {
    return res.status(404).json({ erro: "Paciente não encontrado." });
  }

  const pacienteInfo = {
    nome: paciente.nome,
    dataNascimento: paciente.data,
    idFoto: paciente.imagem,
    email: paciente.email,
    telefone: paciente.telefone,
    contatoEmergencia: paciente.contatoEmergencia,
    cpf: paciente.cpf,
    rg: paciente.rg    
  };

  res.json(pacienteInfo);
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});