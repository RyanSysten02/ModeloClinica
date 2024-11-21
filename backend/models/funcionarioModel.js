const pool = require('../db.js');

const createFuncionario = async (
    nome, matricula, funcao, habilitacao
) => {
    const result = await pool.query(
        `INSERT INTO Funcionario (
            nome, matricula, funcao, habilitacao
        ) VALUES (?, ?, ?, ?)`,
        [
            nome, matricula, funcao, habilitacao
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
    nome, matricula, funcao, habilitacao,
) => { const result = await pool.query(
`UPDATE funcionario SET nome = ?, 
WHERE id = ?`,        [
    nome, matricula, funcao, habilitacao, id
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
