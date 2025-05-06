const pool = require('../db.js');

const createResponsavel = async (
    nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma, endereco, num, complemento, 
    celular, telefone, email, contatoEmergencia, observacoes
) => {
    const result = await pool.query(
        `INSERT INTO Responsavel (
            nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma, 
            endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma,
            endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes
        ]
    );
    return result;
};


const getResponsavel = async () => {
    const result = await pool.query('SELECT * FROM responsavel');
    return result;
};



const getResponsavelById = async (id) => {
    const result = await pool.query('SELECT * FROM responsavel WHERE id = ?', [id]);
   return result[0]; 
};

const updateResponsavel = async ( id,
nome,cpf,rg,dataNascimento,sexo,numeroBeneficio,responsavelTurma,endereco,num,complemento,
celular,telefone,email,contatoEmergencia,observacoes
) => { const result = await pool.query(
`UPDATE responsavel SET nome = ?,cpf = ?,rg = ?,dataNascimento = ?,sexo = ?,numeroBeneficio = ?,responsavelTurma = ?,
endereco = ?,num = ?,complemento = ?,celular = ?,telefone = ?,email = ?,contatoEmergencia = ?,observacoes = ? 
WHERE id = ?`,        [
            nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma,
            endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes, id
        ]
    );
    return result;
};


const deleteResponsavel = async (id) => {
    const result = await pool.query('DELETE FROM responsavel WHERE id = ?', [id]);
    return result;
};

module.exports = {
    createResponsavel,
    getResponsavel,
    getResponsavelById,
    updateResponsavel,
    deleteResponsavel
};
