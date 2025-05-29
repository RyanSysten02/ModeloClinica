const pool = require('../db.js');

const createAluno = async (
    nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma, endereco, num, complemento, 
    celular, telefone, email, contatoEmergencia, observacoes
) => {
    const result = await pool.query(
        `INSERT INTO Aluno (
            nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma, 
            endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma,
            endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes
        ]
    );
    return result;
};


const getAluno = async () => {
    const result = await pool.query('SELECT * FROM aluno');
    return result;
};



const getAlunoById = async (id) => {
    const result = await pool.query('SELECT * FROM aluno WHERE id = ?', [id]);
   return result[0]; 
};

const updateAluno = async ( id,
nome,cpf,rg,dataNascimento,sexo,numeroBeneficio,alunoTurma,endereco,num,complemento,
celular,telefone,email,contatoEmergencia,observacoes
) => { const result = await pool.query(
`UPDATE aluno SET nome = ?,cpf = ?,rg = ?,dataNascimento = ?,sexo = ?,numeroBeneficio = ?,alunoTurma = ?,
endereco = ?,num = ?,complemento = ?,celular = ?,telefone = ?,email = ?,contatoEmergencia = ?,observacoes = ? 
WHERE id = ?`,        [
            nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma,
            endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes, id
        ]
    );
    return result;
};


const deleteAluno = async (id) => {
    const result = await pool.query('DELETE FROM aluno WHERE id = ?', [id]);
    return result;
};

const getAlunoByCpf = async (cpf) => {
    const result = await pool.query('SELECT * FROM aluno WHERE cpf = ?', [cpf]);
    const alunos = result[0]; // geralmente é um array de resultados
    return alunos.length > 0 ? alunos[0] : null;
};



module.exports = {
    createAluno,
    getAluno,
    getAlunoById,
    updateAluno,
    deleteAluno,
    getAlunoByCpf,
};
