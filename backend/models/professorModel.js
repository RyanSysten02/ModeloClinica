const pool = require("../db.js");

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
  const result = await pool.query(
    `INSERT INTO professor (
            nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade,
             data_nasc, num_regis, habilitacao, especializacao,cursos,telefone, sexo, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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
      email,
    ]
  );
  return result;
};

const getProfessor = async () => {
  const result = await pool.query("SELECT * FROM professor");
  return result;
};

const getProfessorById = async (id) => {
  const result = await pool.query("SELECT * FROM professor WHERE id = ?", [id]);
  return result[0];
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
  const result = await pool.query(
    `UPDATE professor SET 
            nome = ?, cpf = ?, rg = ?, cep = ?, end_rua = ?,
            end_numero = ?, bairro = ?, cidade = ?, data_nasc = ?, num_regis = ?,
            habilitacao = ?, especializacao = ?, cursos = ?, telefone = ? , sexo = ?, email = ?
        WHERE id = ?`,
    [
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
      email,
      id,
    ]
  );
  return result;
};

const deleteProfessor = async (id) => {
  const result = await pool.query("DELETE FROM professor WHERE id = ?", [id]);
  return result;
};

module.exports = {
  createProfessor,
  getProfessor,
  getProfessorById,
  updateProfessor,
  deleteProfessor,
};
