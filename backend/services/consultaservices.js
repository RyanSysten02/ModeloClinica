const consultamodel = require('../models/consultamodel');

const createConsulta = async (id_paciente,id_func_responsavel, start, end, desc, color, tipo, id_usuario_inclusao) => {
    const consultaId = await consultamodel.createConsulta(id_paciente,id_func_responsavel, start, end, desc, color, tipo, id_usuario_inclusao);
    return consultaId;
};

const adiarConsulta = async (id_consulta_original, start, end, motivo_adiamento, id_usuario_inclusao) => {
    const consulta = await consultamodel.adiarConsulta(
        id_consulta_original, start, end, motivo_adiamento, id_usuario_inclusao
    );
    return consulta;
};



const getConsultas = async (id_paciente,id_func_responsavel, start, end, desc, color, tipo) => {
    const consulta = await consultamodel.getConsultas(id_paciente,id_func_responsavel, start, end, desc, color, tipo);
    return consulta;
};

const getConsultasTipo = async (tipo) => {
    const consulta = await consultamodel.getConsultasTipo(tipo);
    return consulta;
};


const updateConsulta = async (id, id_paciente,id_func_responsavel, start, end, desc, color, tipo) => {
    const consulta = await consultamodel.updateConsulta(id, id_paciente,id_func_responsavel, start, end, desc, color, tipo);
    return consulta;
};

const updateConsultaCancelamento = async (id, motivocancelamento) => {
    const consulta = await consultamodel.updateConsultaCancelamento(id, motivocancelamento);
    return consulta;
};

const getConsultaById = async (id) => {
    return await consultamodel.getConsultaById(id);
};

const getHistoricoConsultasByPacienteId = async (idPaciente) => {
    const historico = await consultamodel.getHistoricoConsultasByPacienteId(idPaciente);
    return historico;
}


module.exports = {
    createConsulta,
    getConsultas,
    getConsultasTipo,
    updateConsulta,
    updateConsultaCancelamento,
    getConsultaById,
    adiarConsulta,
    getHistoricoConsultasByPacienteId
};
