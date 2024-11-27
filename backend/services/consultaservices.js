const consultamodel = require('../models/consultamodel');

const createConsulta = async (title, start, end, desc, color, tipo, id_usuario_inclusao) => {
    const consultaId = await consultamodel.createConsulta(title, start, end, desc, color, tipo, id_usuario_inclusao);
    return consultaId;
};



const adiarConsulta = async (id_consulta_original, start, end, motivo_adiamento, id_usuario_inclusao) => {
    const consulta = await consultamodel.adiarConsulta(
        id_consulta_original, start, end, motivo_adiamento, id_usuario_inclusao
    );
    return consulta;
};



const getConsultas = async (title, start, end, desc, color, tipo) => {
    const consulta = await consultamodel.getConsultas(title, start, end, desc, color, tipo);
    return consulta;
};

const getConsultasTipo = async (tipo) => {
    const consulta = await consultamodel.getConsultasTipo(tipo);
    return consulta;
};

const deleteConsulta = async (id) => {
    const consulta = await consultamodel.deleteConsulta(id);
    return consulta;
};

const updateConsulta = async (id, title, start, end, desc, color, tipo) => {
    const consulta = await consultamodel.updateConsulta(id, title, start, end, desc, color, tipo);
    return consulta;
};

const updateConsultaCancelamento = async (id, motivocancelamento) => {
    const consulta = await consultamodel.updateConsultaCancelamento(id, motivocancelamento);
    return consulta;
};

const getConsultaById = async (id) => {
    return await consultamodel.getConsultaById(id);
};

module.exports = {
    createConsulta,
    getConsultas,
    getConsultasTipo,
    deleteConsulta,
    updateConsulta,
    updateConsultaCancelamento,
    getConsultaById,
    adiarConsulta,
};
