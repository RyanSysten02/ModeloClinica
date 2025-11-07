const pool = require('../db.js');

// Criar registro de frequência
const createFrequencia = async (matricula_id, professor_id, disciplina_id, presente, data_aula, cod_usuario_inclusao) => {
  const result = await pool.query(
    `INSERT INTO frequencia (
        matricula_id, professor_id, disciplina_id, presente, data_aula, cod_usuario_inclusao
       ) VALUES (?, ?, ?, ?, ?, ?)`,
    [matricula_id, professor_id, disciplina_id, presente, data_aula, cod_usuario_inclusao]
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


const getFrequenciasAgrupadas = async (turmaId, professorId, disciplinaId, dataInicial, dataFinal) => {
    
    // --- CORRIGIDO --- Query SQL sem nenhuma referência à coluna 'periodo'.
    let query = `
        SELECT
            f.data_aula, f.professor_id, p.nome AS professor_nome,
            m.turma_id, t.nome AS turma_nome,
            f.disciplina_id, d.nome AS disciplina_nome
        FROM frequencia AS f
        INNER JOIN matricula AS m ON f.matricula_id = m.id
        INNER JOIN turma AS t ON m.turma_id = t.id
        INNER JOIN professor AS p ON f.professor_id = p.id
        INNER JOIN disciplina AS d ON f.disciplina_id = d.id
        WHERE
            m.turma_id = ?
            AND f.professor_id = ?
            AND f.data_aula BETWEEN ? AND ?
    `;
    
    const params = [turmaId, professorId, dataInicial, dataFinal];

    // Lógica dinâmica para o filtro opcional de disciplina
    if (disciplinaId) {
        query += ` AND f.disciplina_id = ?`;
        params.push(disciplinaId);
    }

    query += `
        GROUP BY
            f.data_aula, f.professor_id, m.turma_id, f.disciplina_id, t.nome, p.nome, d.nome
        ORDER BY
            f.data_aula DESC, d.nome ASC;
    `;

    const [rows] = await pool.query(query, params);
    return rows;
};


const getFrequenciaDetalhadaPorAula = async (turmaId, professorId, disciplinaId, dataAula) => { // Período removido
  const [rows] = await pool.query(`
    SELECT
      m.id AS matricula_id,
      a.id AS aluno_id,
      a.nome AS aluno_nome,
      (SELECT f.presente FROM frequencia f WHERE f.matricula_id = m.id AND f.professor_id = ? AND f.disciplina_id = ? AND f.data_aula = ? LIMIT 1) AS presente
    FROM matricula AS m
    INNER JOIN aluno AS a ON m.aluno_id = a.id
    WHERE
      m.turma_id = ? AND m.status = 'ativa'
    ORDER BY
      a.nome;
  `, [professorId, disciplinaId, dataAula, turmaId]); // Período removido dos parâmetros

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
  const { matricula_id, professor_id, disciplina_id, presente, data_aula } = frequenciaData;
  await pool.query(`
    INSERT INTO frequencia (matricula_id, professor_id, disciplina_id, presente, data_aula, cod_usuario_inclusao)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      presente = VALUES(presente),
      cod_usuario_alteracao = VALUES(cod_usuario_inclusao),
      data_alteracao = NOW();
  `, [matricula_id, professor_id, disciplina_id, presente, data_aula, cod_usuario_alteracao]);
};

const deleteBulkFrequencia = async (turma_id, professor_id, disciplina_id, data_aula) => { // Período removido
    const [result] = await pool.query(`
        DELETE FROM frequencia
        WHERE
            professor_id = ? AND
            disciplina_id = ? AND
            data_aula = ? AND
            matricula_id IN (SELECT id FROM matricula WHERE turma_id = ?);
    `, [professor_id, disciplina_id, data_aula, turma_id]); // Período removido dos parâmetros

    return result;
};

const getAlunosAusentes = async (turmaId, dataAula, disciplinaId) => {
    
    // Inicia a query base
    let query = `
        SELECT
            f.id AS frequencia_id,
            a.id AS aluno_id,
            a.nome AS aluno_nome,
            r.nome AS responsavel_nome,
            r.celular AS responsavel_celular,
            r.email AS responsavel_email,
            f.notificacao_status,
            d.nome AS disciplina_nome -- <<< CORREÇÃO: Adicionado nome da disciplina
        FROM frequencia AS f
        INNER JOIN matricula AS m ON f.matricula_id = m.id
        INNER JOIN aluno AS a ON m.aluno_id = a.id
        INNER JOIN disciplina AS d ON f.disciplina_id = d.id -- <<< CORREÇÃO: Adicionado JOIN
        LEFT JOIN responsavel AS r ON m.responsavel_id = r.id
        WHERE
            f.presente = 0
            AND m.turma_id = ?
            AND f.data_aula = ?
    `;

    const params = [turmaId, dataAula];

    // --- CORREÇÃO: Adiciona o filtro de disciplina dinamicamente ---
    if (disciplinaId) {
        query += ` AND f.disciplina_id = ?`;
        params.push(disciplinaId);
    }

    // Adiciona o final da query
    query += `
        GROUP BY f.id, d.nome -- <<< CORREÇÃO: Adicionado d.nome ao GROUP BY
        ORDER BY
            a.nome ASC;
    `;

    // Executa a query
    const [rows] = await pool.query(query, params);
    return rows;
};

const updateStatusNotificacao = async (frequenciaIds, status) => {
    // A interrogação (?) em "IN (?)" será substituída por uma lista de IDs (ex: 1, 2, 3)
    const [result] = await pool.query(
        'UPDATE frequencia SET notificacao_status = ? WHERE id IN (?)',
        [status, frequenciaIds]
    );
    return result;
};


const getDetalhesFaltasParaEmail = async (frequenciaIds) => {
  if (!frequenciaIds || frequenciaIds.length === 0) {
    return [];
  }
  const query = `
    SELECT
        f.id AS frequencia_id,
        a.id AS aluno_id,       -- <<< GARANTA QUE ESTA LINHA EXISTE
        a.nome AS aluno_nome,
        r.nome AS responsavel_nome,
        r.email AS responsavel_email,
        d.nome AS disciplina_nome,
        f.data_aula
    FROM frequencia AS f
    INNER JOIN matricula AS m ON f.matricula_id = m.id
    INNER JOIN aluno AS a ON m.aluno_id = a.id          -- Join com Aluno
    INNER JOIN disciplina AS d ON f.disciplina_id = d.id -- Join com Disciplina
    LEFT JOIN responsavel AS r ON m.responsavel_id = r.id -- Join com Responsavel
    WHERE f.id IN (?)`; // O driver lida com o array

  const [rows] = await pool.query(query, [frequenciaIds]);
  return rows;
};

// ... (mantenha a função updateStatusNotificacao como está)

// --- NOVA FUNÇÃO ---
const appendStatusNotificacao = async (frequenciaIds, statusToAdd) => {
  if (!frequenciaIds || frequenciaIds.length === 0) return { affectedRows: 0 };
  
  const query = `
    UPDATE frequencia
    SET notificacao_status = CASE
      -- Se o status atual for 'pendente', apenas substitua
      WHEN notificacao_status = 'pendente' THEN ?
      
      -- Se o status a adicionar já estiver lá, não faça nada
      WHEN FIND_IN_SET(?, notificacao_status) > 0 THEN notificacao_status
      
      -- Senão, anexe com uma vírgula
      ELSE CONCAT(notificacao_status, ',', ?)
    END
    WHERE id IN (?);
  `;
  
  const [result] = await pool.query(query, [statusToAdd, statusToAdd, statusToAdd, frequenciaIds]);
  return result;
};

/**
 * Relatório 1: Boletim Individual de Frequência (por disciplina)
 * --- ATUALIZADO para usar aluno_id ---
 */
const getBoletimIndividual = async (aluno_id, data_inicial, data_final, disciplina_id) => {
    let query = `
        SELECT
            d.nome AS disciplina_nome,
            d.id AS disciplina_id,
            COUNT(f.id) AS total_aulas,
            SUM(CASE WHEN f.presente = 1 THEN 1 ELSE 0 END) AS total_presencas,
            SUM(CASE WHEN f.presente = 0 THEN 1 ELSE 0 END) AS total_faltas,
            (SUM(CASE WHEN f.presente = 0 THEN 1 ELSE 0 END) / COUNT(f.id)) * 100 AS percentual_faltas
        FROM frequencia AS f
        JOIN disciplina AS d ON f.disciplina_id = d.id
        JOIN matricula AS m ON f.matricula_id = m.id -- <<< JOIN ADICIONADO
        WHERE m.aluno_id = ?                          -- <<< FILTRO ALTERADO
    `;
    
    const params = [aluno_id]; // <<< PARÂMETRO ALTERADO

    if (data_inicial && data_final) {
        query += ` AND f.data_aula BETWEEN ? AND ?`;
        params.push(data_inicial, data_final);
    }
    if (disciplina_id) {
        query += ` AND f.disciplina_id = ?`;
        params.push(disciplina_id);
    }

    query += `
        GROUP BY d.id, d.nome
        ORDER BY d.nome;
    `;
    
    const [rows] = await pool.query(query, params);
    return rows;
};

/**
 * Relatório 2: Boletim de Frequência por Turma
 */
const getBoletimPorTurma = async (turma_id, data_inicial, data_final, disciplina_id) => {
    let query = `
        SELECT
            a.id AS aluno_id,
            a.nome AS aluno_nome,
            m.id AS matricula_id,
            COUNT(f.id) AS total_aulas_lancadas,
            SUM(CASE WHEN f.presente = 1 THEN 1 ELSE 0 END) AS total_presencas,
            SUM(CASE WHEN f.presente = 0 THEN 1 ELSE 0 END) AS total_faltas,
            (SUM(CASE WHEN f.presente = 0 THEN 1 ELSE 0 END) / COUNT(f.id)) * 100 AS percentual_faltas
        FROM frequencia AS f
        JOIN matricula AS m ON f.matricula_id = m.id
        JOIN aluno AS a ON m.aluno_id = a.id
        WHERE m.turma_id = ? AND m.status = 'ativa'
    `;
    
    const params = [turma_id];

    if (data_inicial && data_final) {
        query += ` AND f.data_aula BETWEEN ? AND ?`;
        params.push(data_inicial, data_final);
    }
    if (disciplina_id) {
        query += ` AND f.disciplina_id = ?`;
        params.push(disciplina_id);
    }

    query += `
        GROUP BY a.id, a.nome, m.id
        ORDER BY percentual_faltas DESC, a.nome ASC;
    `;
    
    const [rows] = await pool.query(query, params);
    return rows;
};

/**
 * Relatório 3: Ranking de Alunos com Mais Faltas (Top N)
 */
const getRankingFaltas = async (limit, turma_id, data_inicial, data_final, disciplina_id) => {
    let query = `
        SELECT
            a.id AS aluno_id,
            a.nome AS aluno_nome,
            t.nome AS turma_nome,
            COUNT(f.id) AS total_faltas
        FROM frequencia AS f
        JOIN matricula AS m ON f.matricula_id = m.id
        JOIN aluno AS a ON m.aluno_id = a.id
        JOIN turma AS t ON m.turma_id = t.id
        WHERE f.presente = 0
    `;
    
    const params = [];

    if (turma_id) {
        query += ` AND m.turma_id = ?`;
        params.push(turma_id);
    }
    if (data_inicial && data_final) {
        query += ` AND f.data_aula BETWEEN ? AND ?`;
        params.push(data_inicial, data_final);
    }
    if (disciplina_id) {
        query += ` AND f.disciplina_id = ?`;
        params.push(disciplina_id);
    }

    query += `
        GROUP BY a.id, a.nome, t.nome
        ORDER BY total_faltas DESC
        LIMIT ?;
    `;
    params.push(limit); // Adiciona o LIMIT por último
    
    const [rows] = await pool.query(query, params);
    return rows;
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
  deleteBulkFrequencia,
  getAlunosAusentes,
  updateStatusNotificacao,
  getDetalhesFaltasParaEmail,
  appendStatusNotificacao,
  getBoletimIndividual,
  getBoletimPorTurma,
  getRankingFaltas,
};
