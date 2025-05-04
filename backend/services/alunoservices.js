const alunomodel = require('../models/alunoModel');

const createAluno = async (nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma,
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const aluno = await alunomodel.createAluno(nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma,
        endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);
    return aluno;
};

const getAluno = async (nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma,
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const aluno = await alunomodel.getAluno(nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma,
        endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);
    return aluno;
};

const updateAluno = async (id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma,
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const aluno = await alunomodel.updateAluno(id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma,
        endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);
    return aluno;
};

const getAlunoById = async (id) => {
    return await alunomodel.getAlunoById(id);
};

const deleteAluno = async (id) => {
    const aluno = await alunomodel.deleteAluno(id);
    return aluno;
};

module.exports = {
    createAluno,
    getAluno,
    deleteAluno,
    updateAluno,
    getAlunoById,  
};
