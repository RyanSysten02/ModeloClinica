const pool = require('../db.js');


const getHorarios = async () => {
  const result = await pool.query('SELECT * FROM horarios ORDER BY sequencia ASC');
  return result[0] || [];
};


const getAulasByDia = async (dia_semana) => {
  const sql = `
    SELECT a.id, a.dia_semana, a.horario_id, a.turma, a.disciplina_id, d.nome AS disciplina_nome,
           a.professor_id, p.nome AS professor_nome, a.cor
    FROM aulas a
    JOIN disciplina d ON d.id = a.disciplina_id
    JOIN professor  p ON p.id = a.professor_id
    WHERE a.dia_semana = ?
  `;
  const result = await pool.query(sql, [dia_semana]);
  return result[0] || [];
};


const replaceDia = async (dia_semana, aulas) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM aulas WHERE dia_semana = ?', [dia_semana]);

    if (Array.isArray(aulas) && aulas.length) {
      const sql = `
        INSERT INTO aulas (dia_semana, horario_id, turma, disciplina_id, professor_id, cor)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      for (const a of aulas) {
        await conn.query(sql, [
          dia_semana,
          a.horario_id,
          a.turma,
          a.disciplina_id,
          a.professor_id,
          a.cor || null,
        ]);
      }
    }
    await conn.commit();
    return { ok: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  getHorarios,
  getAulasByDia,
  replaceDia,
};
