const professormodel = require("../models/professorModel");

const createProfessor = async (
  nome,
  cpf,
  rg,
  cep,
  end_rua,
  end_numero,
  bairro,
  cidade,
  data_nasc,
  num_regis,
  habilitacao,
  especializacao,
  cursos,
  telefone,
  sexo,
  email
) => {
  const professor = await professormodel.createProfessor(
    nome,
    cpf,
    rg,
    cep,
    end_rua,
    end_numero,
    bairro,
    cidade,
    data_nasc,
    num_regis,
    habilitacao,
    especializacao,
    cursos,
    telefone,
    sexo,
    email
  );
  return professor;
};

const getProfessor = async (
  nome,
  cpf,
  rg,
  cep,
  end_rua,
  end_numero,
  bairro,
  cidade,
  data_nasc,
  num_regis,
  habilitacao,
  especializacao,
  cursos,
  telefone,
  sexo,
  email
) => {
  const professor = await professormodel.getProfessor(
    nome,
    cpf,
    rg,
    cep,
    end_rua,
    end_numero,
    bairro,
    cidade,
    data_nasc,
    num_regis,
    habilitacao,
    especializacao,
    cursos,
    telefone,
    sexo,
    email
  );
  return professor;
};

const updateProfessor = async (
  id,
  nome,
  cpf,
  rg,
  cep,
  end_rua,
  end_numero,
  bairro,
  cidade,
  data_nasc,
  num_regis,
  habilitacao,
  especializacao,
  cursos,
  telefone,
  sexo,
  email
) => {
  const professor = await professormodel.updateProfessor(
    id,
    nome,
    cpf,
    rg,
    cep,
    end_rua,
    end_numero,
    bairro,
    cidade,
    data_nasc,
    num_regis,
    habilitacao,
    especializacao,
    cursos,
    telefone,
    sexo,
    email
  );
  return professor;
};

const getProfessorById = async (id) => {
  return await professormodel.getProfessorById(id);
};

const deleteProfessor = async (id) => {
  const professor = await professormodel.deleteProfessor(id);
  return professor;
};

const getAll = async () => {
  return await professormodel.getAll();
};

module.exports = {
  createProfessor,
  getProfessor,
  deleteProfessor,
  updateProfessor,
  getProfessorById,
  getAll,
};
