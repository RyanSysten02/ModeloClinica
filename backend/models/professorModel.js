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
  
  habilitacao,
  
  
  telefone,
  sexo,
  email
) => {
  const result = await pool.query(
    `INSERT INTO professor (
            nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade,
             data_nasc,  habilitacao, telefone, sexo, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      
      habilitacao,
      
      
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
  
  habilitacao,
  
  
  telefone,
  sexo,
  email
) => {
  const result = await pool.query(
    `UPDATE professor SET 
            nome = ?, cpf = ?, rg = ?, cep = ?, end_rua = ?,
            end_numero = ?, bairro = ?, cidade = ?, data_nasc = ?,
            habilitacao = ?, telefone = ? , sexo = ?, email = ?
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
      
      habilitacao,
      
      
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

const getAll = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      nome, 
      tipo, 
      area_conhecimento AS areaConhecimento, 
      carga_horaria AS cargaHoraria 
    FROM professor
  `);
  return rows;
};

module.exports = {
  createProfessor,
  getProfessor,
  getProfessorById,
  updateProfessor,
  deleteProfessor,
  getAll,
};
