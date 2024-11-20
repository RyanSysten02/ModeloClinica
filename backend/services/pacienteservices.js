const pacientemodel = require('../models/pacienteModel');

const createPaciente = async (nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude,
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const paciente = await pacientemodel.createPaciente(nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude,
        endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);
    return paciente;
};

const getPaciente = async (nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude,
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const paciente = await pacientemodel.getPaciente(nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude,
        endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);
    return paciente;
};

const updatePaciente = async (id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude,
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes) => {
    const paciente = await pacientemodel.updatePaciente(id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude,
        endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);
    return paciente;
};

const getPacienteById = async (id) => {
    return await pacientemodel.getPacienteById(id);
};

const deletePaciente = async (id) => {
    const paciente = await pacientemodel.deletePaciente(id);
    return paciente;
};

module.exports = {
    createPaciente,
    getPaciente,
    deletePaciente,
    updatePaciente,
    getPacienteById,  
};
