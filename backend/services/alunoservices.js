const alunomodel = require('../models/alunoModel');

const createAluno = async (nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, 
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const aluno = await alunomodel.createAluno(nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, 
        endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);
    return aluno;
};

const getAluno = async () => {
    const aluno = await alunomodel.getAluno();
    return aluno;
};


const updateAluno = async (id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, 
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const aluno = await alunomodel.updateAluno(id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, 
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

const getAlunoByCpf = async (cpf) => {
    return await alunomodel.getAlunoByCpf(cpf);
};


module.exports = {
    createAluno,
    getAluno,
    deleteAluno,
    updateAluno,
    getAlunoById,  
    getAlunoByCpf,
};
