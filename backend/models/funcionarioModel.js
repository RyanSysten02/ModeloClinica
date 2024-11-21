const pool = require('../db.js');

const createFuncionario = async (
    nome, matricula, funcao, habilitacao,  dataNascimento
) => {
    const result = await pool.query(
        `INSERT INTO Funcionario (
            nome, matricula, funcao, habilitacao,  dataNascimento
        ) VALUES (?, ?, ?, ?, ?)`,
        [
            nome, matricula, funcao, habilitacao,  dataNascimento
        ]
    );
    return result;
};


const getFuncionario = async () => {
    const result = await pool.query('SELECT * FROM funcionario');
    return result;
};



const getFuncionarioById = async (id) => {
    const result = await pool.query('SELECT * FROM funcionario WHERE id = ?', [id]);
   return result[0]; 
};

const updateFuncionario = async ( id,
    nome, matricula, funcao, habilitacao,  dataNascimento,
) => { const result = await pool.query(
`UPDATE funcionario SET nome = ?, matricula = ?, funcao = ?, habilitacao = ?,  dataNascimento = ?
WHERE id = ?`,        [
    nome, matricula, funcao, habilitacao,  dataNascimento, id
        ]
    );
    return result;
};


const deleteFuncionario = async (id) => {
    const result = await pool.query('DELETE FROM funcionario WHERE id = ?', [id]);
    return result;
};

module.exports = {
    createFuncionario,
    getFuncionario,
    getFuncionarioById,
    updateFuncionario,
    deleteFuncionario
};
