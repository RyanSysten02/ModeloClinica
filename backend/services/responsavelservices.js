const responsavelmodel = require('../models/responsavelModel');

const createResponsavel = async (nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma,
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const responsavel = await responsavelmodel.createResponsavel(nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma,
        endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);
    return responsavel;
};

const getResponsavel = async (nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma,
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const responsavel = await responsavelmodel.getResponsavel(nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma,
        endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);
    return responsavel;
};

const updateResponsavel = async (id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma,
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const responsavel = await responsavelmodel.updateResponsavel(id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma,
        endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);
    return responsavel;
};

const getResponsavelById = async (id) => {
    return await responsavelmodel.getResponsavelById(id);
};

const deleteResponsavel = async (id) => {
    const responsavel = await responsavelmodel.deleteResponsavel(id);
    return responsavel;
};

module.exports = {
    createResponsavel,
    getResponsavel,
    deleteResponsavel,
    updateResponsavel,
    getResponsavelById,  
};
