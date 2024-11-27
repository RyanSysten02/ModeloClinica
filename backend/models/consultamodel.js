const pool = require('../db.js');

const createConsulta = async (title, start, end, desc, color, tipo, id_usuario_inclusao) => {
    // Inserir a nova consulta
    const [result] = await pool.query(
        'INSERT INTO consultas (title, start, end, `desc`, color, tipo, id_usuario_inclusao) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, start, end, desc, color, tipo, id_usuario_inclusao]
    );

    const insertedId = result.insertId; // Obter o ID da consulta recém-criada

    // Atualizar o lote_agendamento com o ID da consulta
    await pool.query(
        'UPDATE consultas SET lote_agendamento = ? WHERE id = ?',
        [insertedId, insertedId]
    );

    return insertedId; // Retornar o ID da consulta criada
};


const adiarConsulta = async (id_consulta_original, start, end, motivo_adiamento, id_usuario_inclusao) => {
    const result = await pool.query(
        `INSERT INTO consultas (title, start, end, \`desc\`, color, tipo, status, dh_adiamento, motivo_adiamento, lote_agendamento, id_usuario_inclusao)
         SELECT title, ?, ?, \`desc\`, color, tipo, 'AD', NOW(), ?, lote_agendamento, ?
         FROM consultas
         WHERE id = ?`,
        [start, end, motivo_adiamento, id_usuario_inclusao, id_consulta_original]
    );
    return result;
};



const getConsultas = async () => {
    const result = await pool.query(`
        SELECT c.*, 
               p.nome AS paciente_nome, 
               f.nome AS funcionario_nome
        FROM consultas c
        INNER JOIN (
            SELECT lote_agendamento, MAX(dh_inclusao) AS max_dh_inclusao
            FROM consultas
            WHERE status != 'C'
            GROUP BY lote_agendamento
        ) latest ON c.lote_agendamento = latest.lote_agendamento AND c.dh_inclusao = latest.max_dh_inclusao
        LEFT JOIN paciente p ON c.id_paciente = p.id
        LEFT JOIN funcionario f ON c.id_func_responsavel = f.id
        WHERE c.status != 'C'
    `);
    return result;
};


const getConsultasTipo = async () => {
    try {
        const result = await pool.query('SELECT DISTINCT tipo FROM consultas');
        const tipos = result[0];
        return tipos.filter(item => item.tipo !== '');
    } catch (error) {
        throw new Error('Erro ao buscar tipos de consultas: ' + error.message);
    }
};



const getConsultaById = async (id) => {
    const result = await pool.query('SELECT * FROM consultas WHERE id = ?', [id]);
   return result[0]; 
};

const updateConsulta = async (id, title, start, end, desc, color, tipo) => {
    const result = await pool.query(
        'UPDATE consultas SET title = ?, start = ?, end = ?, `desc` = ?, color = ?, tipo = ? WHERE id = ?',
        [title, start, end, desc, color, tipo, id]
    );
    return result;
};

const updateConsultaCancelamento = async (id, motivocancelamento) => {
    const result = await pool.query(
        'UPDATE consultas SET `status` = ?, `dh_cancelamento` = NOW(), `motivocancelamento`  = ? WHERE id = ?',
        ['C', motivocancelamento, id] 
    );
    return result;
};


const deleteConsulta = async (id) => {
    const result = await pool.query('DELETE FROM consultas WHERE id = ?', [id]);
    return result;
};

module.exports = {
    createConsulta,
    getConsultasTipo,
    getConsultas,
    getConsultaById,
    updateConsulta,
    updateConsultaCancelamento,
    deleteConsulta,
    adiarConsulta,
};
