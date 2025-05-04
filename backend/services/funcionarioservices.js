const funcionariomodel = require('../models/funcionarioModel');

const createFuncionario = async (nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc, num_regis, habilitacao, especializacao,cursos) => {
    const funcionario = await funcionariomodel.createFuncionario(nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc, num_regis, habilitacao, especializacao,cursos);
    return funcionario;
};

const getFuncionario = async (nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc, num_regis, habilitacao, especializacao,cursos) => {
    const funcionario = await funcionariomodel.getFuncionario(nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc, num_regis, habilitacao, especializacao,cursos);
    return funcionario;
};

const updateFuncionario = async (id, nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc, num_regis, habilitacao, especializacao,cursos) => {
    const funcionario = await funcionariomodel.updateFuncionario(id, nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc, num_regis, habilitacao, especializacao,cursos);
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
