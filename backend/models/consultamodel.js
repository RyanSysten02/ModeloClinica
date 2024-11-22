const pool = require('../db.js');

const createConsulta = async (title, start, end, desc, color, tipo) => {
    const result = await pool.query(
        'INSERT INTO consultas (title, start, end, `desc`, color, tipo) VALUES (?, ?, ?, ?, ?, ?)',
        [title, start, end, desc, color, tipo]
    );
    return result;
};

const getConsultas = async () => {
    const result = await pool.query('SELECT * FROM consultas');
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

const updateConsultaCancelamento = async (id) => {
    const result = await pool.query(
        'UPDATE consultas SET `status` = ?, `dh_cancelamento` = NOW() WHERE id = ?',
        ['C', id] 
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
    deleteConsulta
};
