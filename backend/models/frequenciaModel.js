const pool = require('../db.js');

// Criar registro de frequência
const createFrequencia = async (matricula_id, professor_id, presente, data_aula, periodo, cod_usuario_inclusao) => {
  const result = await pool.query(
    `INSERT INTO frequencia (
       matricula_id, professor_id, presente, data_aula, periodo, cod_usuario_inclusao
     ) VALUES (?, ?, ?, ?, ?, ?)`,
    [matricula_id, professor_id, presente, data_aula, periodo, cod_usuario_inclusao]
  );
  return result;
};

// Buscar todas as frequências
const getFrequencias = async () => {
  const result = await pool.query('SELECT * FROM frequencia');
  return result[0]; // array de registros
};

// Buscar frequência pelo ID
const getFrequenciaById = async (id) => {
  const result = await pool.query('SELECT * FROM frequencia WHERE id = ?', [id]);
  return result[0][0]; // único registro ou undefined
};

const getFrequenciasAgrupadas = async (turmaId, professorId, periodo) => {
  // Nota: Usamos m.turma_id no WHERE, pois a tabela frequencia não tem turma_id diretamente.
  const [rows] = await pool.query(`
    SELECT
      f.data_aula,
      f.periodo,
      f.professor_id,
      p.nome AS professor_nome,
      m.turma_id,
      t.nome AS turma_nome
    FROM frequencia AS f
    INNER JOIN matricula AS m ON f.matricula_id = m.id
    INNER JOIN turma AS t ON m.turma_id = t.id
    INNER JOIN professor AS p ON f.professor_id = p.id
    WHERE
      m.turma_id = ?
      AND f.professor_id = ?
      AND f.periodo = ?
    GROUP BY
      f.data_aula, f.periodo, f.professor_id, m.turma_id, t.nome, p.nome
    ORDER BY
      f.data_aula DESC;
  `, [turmaId, professorId, periodo]);

  return rows;
};

const getFrequenciaDetalhadaPorAula = async (turmaId, professorId, dataAula, periodo) => {
  const [rows] = await pool.query(`
    SELECT
      m.id AS matricula_id,
      a.id AS aluno_id,
      a.nome AS aluno_nome,
      f.presente
    FROM matricula AS m
    INNER JOIN aluno AS a ON m.aluno_id = a.id
    LEFT JOIN frequencia AS f ON m.id = f.matricula_id
      AND f.professor_id = ?
      AND f.data_aula = ?
      AND f.periodo = ?
    WHERE
      m.turma_id = ? AND m.status = 'ativa'
    ORDER BY
      a.nome;
  `, [professorId, dataAula, periodo, turmaId]);
  
  return rows;
};

// Atualizar registro de frequência
const updateFrequencia = async (id, matricula_id, professor_id, presente, data_aula, cod_usuario_alteracao) => {
  const result = await pool.query(
    `UPDATE frequencia 
        SET matricula_id = ?, professor_id = ?, presente = ?, data_aula = ?, 
            cod_usuario_alteracao = ?, data_alteracao = NOW()
      WHERE id = ?`,
    [matricula_id, professor_id, presente, data_aula, cod_usuario_alteracao, id]
  );
  return result;
};

// Deletar frequência
const deleteFrequencia = async (id) => {
  const result = await pool.query('DELETE FROM frequencia WHERE id = ?', [id]);
  return result;
};

// Buscar todas as frequências de uma matrícula (ex: histórico de um aluno)
const getFrequenciasPorMatricula = async (matricula_id) => {
  const result = await pool.query(
    'SELECT * FROM frequencia WHERE matricula_id = ? ORDER BY data_aula DESC',
    [matricula_id]
  );
  return result[0];
};

const upsertFrequencia = async (frequenciaData, cod_usuario_alteracao) => {
  const { matricula_id, professor_id, presente, data_aula, periodo } = frequenciaData;

  // Esta query especial do MySQL insere um novo registro. Se a chave única já existir,
  // ele executa a parte do ON DUPLICATE KEY UPDATE.
  await pool.query(`
    INSERT INTO frequencia (matricula_id, professor_id, presente, data_aula, periodo, cod_usuario_inclusao)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      presente = VALUES(presente),
      cod_usuario_alteracao = VALUES(cod_usuario_inclusao),
      data_alteracao = NOW();
  `, [matricula_id, professor_id, presente, data_aula, periodo, cod_usuario_alteracao]);
};

module.exports = {
  createFrequencia,
  getFrequencias,
  getFrequenciaById,
  updateFrequencia,
  deleteFrequencia,
  getFrequenciasPorMatricula,
  getFrequenciasAgrupadas,
  getFrequenciaDetalhadaPorAula,
  upsertFrequencia,
};
