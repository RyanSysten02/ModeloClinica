const aulamodel = require('../models/aulamodel');

const createAula = async (id_turma, id_func_responsavel, start, end, desc, color, tipo, id_usuario_inclusao) => {
    const aulaId = await aulamodel.createAula(id_turma, id_func_responsavel, start, end, desc, color, tipo, id_usuario_inclusao);
    return aulaId;
};

const adiarAula = async (id_aula_original, start, end, motivo_adiamento, id_usuario_inclusao) => {
    const aula = await aulamodel.adiarAula(id_aula_original, start, end, motivo_adiamento, id_usuario_inclusao);
    return aula;
};

const getAulas = async () => {
    const aulas = await aulamodel.getAulas();
    return aulas;
};

const getAulasTipo = async (tipo) => {
    const aulas = await aulamodel.getAulasTipo(tipo);
    return aulas;
};

const updateAula = async (id, id_turma, id_func_responsavel, start, end, desc, color, tipo) => {
    const aula = await aulamodel.updateAula(id, id_turma, id_func_responsavel, start, end, desc, color, tipo);
    return aula;
};

const cancelarAula = async (id, motivocancelamento) => {
    const aula = await aulamodel.cancelarAula(id, motivocancelamento);
    return aula;
};

const getAulaById = async (id) => {
    return await aulamodel.getAulaById(id);
};

const getHistoricoAulasByTurmaId = async (idTurma) => {
    const historico = await aulamodel.getHistoricoAulasByTurmaId(idTurma);
    return historico;
};
const deleteAula = async (id) => {
    const aula = await aulamodel.deleteAula(id);
    return aula;
};

module.exports = {
    createAula,
    adiarAula,
    getAulas,
    getAulasTipo,
    updateAula,
    cancelarAula,
    getAulaById,
    getHistoricoAulasByTurmaId,
    deleteAula
};
