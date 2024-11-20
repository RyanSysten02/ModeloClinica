const pool = require('../db.js');

const createPaciente = async (
    nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude, endereco, num, complemento, 
    celular, telefone, email, contatoEmergencia, observacoes
) => {
    const result = await pool.query(
        `INSERT INTO Paciente (
            nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude, 
            endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude,
            endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes
        ]
    );
    return result;
};


const getPaciente = async () => {
    const result = await pool.query('SELECT * FROM paciente');
    return result;
};



const getPacienteById = async (id) => {
    const result = await pool.query('SELECT * FROM paciente WHERE id = ?', [id]);
   return result[0]; 
};

const updatePaciente = async ( id,
nome,cpf,rg,dataNascimento,sexo,numeroBeneficio,planoSaude,endereco,num,complemento,
celular,telefone,email,contatoEmergencia,observacoes
) => { const result = await pool.query(
`UPDATE paciente SET nome = ?,cpf = ?,rg = ?,dataNascimento = ?,sexo = ?,numeroBeneficio = ?,planoSaude = ?,
endereco = ?,num = ?,complemento = ?,celular = ?,telefone = ?,email = ?,contatoEmergencia = ?,observacoes = ? 
WHERE id = ?`,        [
            nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude,
            endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes, id
        ]
    );
    return result;
};


const deletePaciente = async (id) => {
    const result = await pool.query('DELETE FROM paciente WHERE id = ?', [id]);
    return result;
};

module.exports = {
    createPaciente,
    getPaciente,
    getPacienteById,
    updatePaciente,
    deletePaciente
};
