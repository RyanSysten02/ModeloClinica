const pool = require('../db.js');

const getHorarios = async () => {
  const result = await pool.query(
    'SELECT * FROM horarios ORDER BY sequencia ASC'
  );
  return result[0] || [];
};

const getAulasByDia = async (dia_semana) => {
  const sql = `
    SELECT a.id,
           a.dia_semana,
           a.horario_id,
           a.turma,
           a.disciplina_id,
           d.nome AS disciplina_nome,
           a.professor_id,
           p.nome AS professor_nome,
           a.cor
    FROM aulas a
    JOIN disciplina d ON d.id = a.disciplina_id
    JOIN professor  p ON p.id = a.professor_id
    WHERE a.dia_semana = ?
  `;
  const result = await pool.query(sql, [dia_semana]);
  return result[0] || [];
};

/**
 * Salva as aulas de um dia e grava no histórico
 * um snapshot de TODA a semana (todos os dias).
 */
const replaceDia = async (dia_semana, aulas, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Apaga o dia atual
    await conn.query('DELETE FROM aulas WHERE dia_semana = ?', [dia_semana]);

    // Reinsere as aulas desse dia
    if (Array.isArray(aulas) && aulas.length) {
      const sqlInsert = `
        INSERT INTO aulas (dia_semana, horario_id, turma, disciplina_id, professor_id, cor)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      for (const a of aulas) {
        await conn.query(sqlInsert, [
          dia_semana,
          a.horario_id,
          a.turma,
          a.disciplina_id,
          a.professor_id,
          a.cor || null,
        ]);
      }
    }

    // Agora buscamos TODAS as aulas da semana (Seg–Sex)
    const [rowsSemana] = await conn.query(
      `
      SELECT a.id,
             a.dia_semana,
             a.horario_id,
             a.turma,
             a.disciplina_id,
             d.nome  AS disciplina_nome,
             a.professor_id,
             p.nome  AS professor_nome,
             a.cor
      FROM aulas a
      JOIN disciplina d ON d.id = a.disciplina_id
      JOIN professor  p ON p.id = a.professor_id
      WHERE a.dia_semana IN ('Segunda','Terça','Quarta','Quinta','Sexta')
      `
    );

    // Grava histórico: snapshot = estado de TODA a semana nesse momento
    await conn.query(
      `
      INSERT INTO aulas_historico (dia_semana, snapshot, id_usuario)
      VALUES (?, ?, ?)
      `,
      [
        dia_semana, // dia que disparou o salvamento (apenas informativo)
        JSON.stringify(rowsSemana || []),
        userId || null,
      ]
    );

    await conn.commit();
    return { ok: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Lista histórico com filtro opcional por intervalo de datas.
 * dataInicio / dataFim no formato 'YYYY-MM-DD'.
 */
const getHistorico = async (dataInicio, dataFim) => {
  let sql = `
    SELECT id, dia_semana, dh_versao, id_usuario
    FROM aulas_historico
    WHERE 1=1
  `;
  const params = [];

  if (dataInicio) {
    sql += ' AND dh_versao >= ?';
    params.push(`${dataInicio} 00:00:00`);
  }
  if (dataFim) {
    sql += ' AND dh_versao <= ?';
    params.push(`${dataFim} 23:59:59`);
  }

  sql += ' ORDER BY dh_versao DESC';

  const [rows] = await pool.query(sql, params);
  return rows || [];
};

const getHistoricoSnapshot = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT id, dia_semana, dh_versao, id_usuario, snapshot
    FROM aulas_historico
    WHERE id = ?
    `,
    [id]
  );
  return rows[0] || null;
};

module.exports = {
  getHorarios,
  getAulasByDia,
  replaceDia,
  getHistorico,
  getHistoricoSnapshot,
};
