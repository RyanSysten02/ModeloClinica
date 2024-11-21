const funcionariomodel = require('../models/funcionarioModel');

const createFuncionario = async (nome, matricula, funcao, habilitacao,  dataNascimento) => {
    const funcionario = await funcionariomodel.createFuncionario(nome, matricula, funcao, habilitacao,  dataNascimento);
    return funcionario;
};

const getFuncionario = async (nome, matricula, funcao, habilitacao,  dataNascimento) => {
    const funcionario = await funcionariomodel.getFuncionario(nome, matricula, funcao, habilitacao,  dataNascimento);
    return funcionario;
};

const updateFuncionario = async (id, nome, matricula, funcao, habilitacao,  dataNascimento) => {
    const funcionario = await funcionariomodel.updateFuncionario(id, nome, matricula, funcao, habilitacao,  dataNascimento);
    return funcionario;
};

const getFuncionarioById = async (id) => {
    return await funcionariomodel.getFuncionarioById(id);
};

const deleteFuncionario = async (id) => {
    const funcionario = await funcionariomodel.deleteFuncionario(id);
    return funcionario;
};

module.exports = {
    createFuncionario,
    getFuncionario,
    deleteFuncionario,
    updateFuncionario,
    getFuncionarioById,  
};
