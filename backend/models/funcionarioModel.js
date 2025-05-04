const pool = require('../db.js');

const createFuncionario = async (
    nome, cpf, rg, cep, end_rua, end_numero, bairro,
     cidade, data_nasc, num_regis, habilitacao, especializacao,cursos
) => {
    const result = await pool.query(
        `INSERT INTO professor (
            nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade,
             data_nasc, num_regis, habilitacao, especializacao,cursos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            nome, cpf, rg, cep, end_rua, end_numero,
             bairro, cidade, data_nasc, num_regis, habilitacao, especializacao,cursos
        ]
    );
    return result;
};


const getFuncionario = async () => {
    const result = await pool.query('SELECT * FROM professor');
    return result;
};



const getFuncionarioById = async (id) => {
    const result = await pool.query('SELECT * FROM professor WHERE id = ?', [id]);
   return result[0]; 
};

const updateFuncionario = async (
    id, nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc,
    num_regis, habilitacao, especializacao, cursos
) => {
    const result = await pool.query(
        `UPDATE professor SET 
            nome = ?, cpf = ?, rg = ?, cep = ?, end_rua = ?,
            end_numero = ?, bairro = ?, cidade = ?, data_nasc = ?, num_regis = ?,
            habilitacao = ?, especializacao = ?, cursos = ?
        WHERE id = ?`,
        [
            nome, cpf, rg, cep, end_rua, end_numero, bairro,
            cidade, data_nasc, num_regis, habilitacao, especializacao, cursos, id
        ]
    );
    return result;
};

const deleteFuncionario = async (id) => {
    const result = await pool.query('DELETE FROM professor WHERE id = ?', [id]);
    return result;
};

module.exports = {
    createFuncionario,
    getFuncionario,
    getFuncionarioById,
    updateFuncionario,
    deleteFuncionario
};
