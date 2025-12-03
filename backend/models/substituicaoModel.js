const pool = require('../db.js');

/**
 * Busca a grade de aulas baseada no dia da semana.
 * Faz um LEFT JOIN com 'substituicoes_eventuais' para ver se existe troca para a data específica.
 */
const getAgendamentosParaSubstituicao = async (filtros = {}) => {
    const diaSemana = filtros.diaSemanaNome; // Ex: "Segunda", "Terça"
    const dataEspecifica = filtros.data;     // Ex: "2025-12-03"

    let query = `
        SELECT 
            a.id AS id_aula_grade,
            a.horario_id,
            a.dia_semana,
            h.inicio,
            h.fim,
            d.nome AS disciplina_nome,
            t.id AS turma_id,
            t.nome AS turma_nome,
            a.cor AS cor_original,
            
            -- IDs de controle
            sub.id AS id_substituicao_eventual, 
            
            -- Lógica do Professor: Se tiver substituto na tabela eventual, pega ele. Senão, pega o titular.
            COALESCE(p_sub.id, p_titular.id) AS professor_id,
            COALESCE(p_sub.nome, p_titular.nome) AS professor_nome,
            
            -- Flags para o Frontend
            IF(sub.id IS NOT NULL, true, false) AS is_substituida,
            sub.motivo
            
        FROM aulas AS a
        INNER JOIN horarios AS h ON a.horario_id = h.id
        INNER JOIN disciplina AS d ON a.disciplina_id = d.id
        -- Ajuste aqui se sua tabela aulas usa ID ou Nome para turma. Assumindo Nome conforme seu SQL anterior.
        INNER JOIN turma AS t ON a.turma = t.nome 
        INNER JOIN professor AS p_titular ON a.professor_id = p_titular.id
        
        -- O Pulo do Gato: Tenta encontrar uma substituição para ESTA aula NESTA data específica
        LEFT JOIN substituicoes_eventuais AS sub 
            ON a.id = sub.aula_id AND sub.data_aula = ?
            
        LEFT JOIN professor AS p_sub ON sub.professor_substituto_id = p_sub.id
        
        WHERE a.dia_semana = ?
    `;

    const params = [dataEspecifica, diaSemana];

    // Filtros opcionais
    if (filtros.id_turma) {
        query += ` AND t.id = ?`;
        params.push(filtros.id_turma);
    }

    if (filtros.disciplinaId) {
        query += ` AND d.id = ?`;
        params.push(filtros.disciplinaId);
    }

    // Filtro de professor complexo: Verifica se o ID buscado é o titular OU o substituto da vez
    if (filtros.id_professor) {
        query += ` AND (
            (sub.id IS NULL AND p_titular.id = ?) OR 
            (sub.id IS NOT NULL AND p_sub.id = ?)
        )`;
        params.push(filtros.id_professor, filtros.id_professor);
    }

    query += ` ORDER BY h.inicio ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
};

/**
 * Cria ou Atualiza uma substituição eventual.
 * Se já existir uma troca para aquela aula naquele dia, atualiza o professor.
 */
const createSubstituicaoEventual = async (dados) => {
    const { aula_id, professor_substituto_id, data_aula, motivo, criado_por } = dados;
    
    const [result] = await pool.query(`
        INSERT INTO substituicoes_eventuais 
        (aula_id, professor_substituto_id, data_aula, motivo, criado_por)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            professor_substituto_id = VALUES(professor_substituto_id),
            motivo = VALUES(motivo),
            criado_por = VALUES(criado_por)
    `, [aula_id, professor_substituto_id, data_aula, motivo, criado_por]);
    
    return result;
};

/**
 * Busca detalhes de uma substituição eventual específica (para o botão "Ver Histórico")
 */
const getDetalhesSubstituicao = async (id_aula_grade) => {
    // Aqui podemos retornar todas as substituições que essa aula já teve no passado
    const [rows] = await pool.query(`
        SELECT 
            sub.id,
            sub.data_aula,
            sub.motivo,
            sub.criado_em,
            p_sub.nome AS professor_novo_nome,
            u.nome AS usuario_responsavel_nome
        FROM substituicoes_eventuais AS sub
        INNER JOIN professor AS p_sub ON sub.professor_substituto_id = p_sub.id
        LEFT JOIN user AS u ON sub.criado_por = u.id
        WHERE sub.aula_id = ?
        ORDER BY sub.data_aula DESC
    `, [id_aula_grade]);
    
    // Mapeando para o formato que o frontend espera no modal de histórico
    return rows.map(r => ({
        id: r.id,
        data_substituicao: r.criado_em, // Data que foi feito o registro
        professor_anterior_nome: "Titular da Grade", // Como é eventual, quem saiu sempre é o titular
        professor_novo_nome: r.professor_novo_nome,
        usuario_responsavel_nome: r.usuario_responsavel_nome,
        motivo: `${r.motivo} (Para o dia: ${new Date(r.data_aula).toLocaleDateString('pt-BR')})`
    }));
};

module.exports = {
    getAgendamentosParaSubstituicao,
    createSubstituicaoEventual,
    getDetalhesSubstituicao
};