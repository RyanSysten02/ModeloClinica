const consultamodel = require('../models/consultamodel');

const createConsulta = async (id_aluno,id_func_responsavel, start, end, desc, color, tipo, id_usuario_inclusao) => {
    const consultaId = await consultamodel.createConsulta(id_aluno,id_func_responsavel, start, end, desc, color, tipo, id_usuario_inclusao);
    return consultaId;
};

const adiarConsulta = async (id_consulta_original, start, end, motivo_adiamento, id_usuario_inclusao) => {
    const consulta = await consultamodel.adiarConsulta(
        id_consulta_original, start, end, motivo_adiamento, id_usuario_inclusao
    );
    return consulta;
};



const getConsultas = async (id_aluno,id_func_responsavel, start, end, desc, color, tipo) => {
    const consulta = await consultamodel.getConsultas(id_aluno,id_func_responsavel, start, end, desc, color, tipo);
    return consulta;
};

const getConsultasTipo = async (tipo) => {
    const consulta = await consultamodel.getConsultasTipo(tipo);
    return consulta;
};


const updateConsulta = async (id, id_aluno,id_func_responsavel, start, end, desc, color, tipo) => {
    const consulta = await consultamodel.updateConsulta(id, id_aluno,id_func_responsavel, start, end, desc, color, tipo);
    return consulta;
};

const updateConsultaCancelamento = async (id, motivocancelamento) => {
    const consulta = await consultamodel.updateConsultaCancelamento(id, motivocancelamento);
    return consulta;
};

const getConsultaById = async (id) => {
    return await consultamodel.getConsultaById(id);
};

const getHistoricoConsultasByAlunoId = async (idAluno) => {
    const historico = await consultamodel.getHistoricoConsultasByAlunoId(idAluno);
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
    getHistoricoConsultasByAlunoId
};
