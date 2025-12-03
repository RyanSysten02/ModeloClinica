const substituicaoService = require('../services/substituicaoService');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs'); 
require('dayjs/locale/pt-br');
dayjs.locale('pt-br');

const getAgendamentos = async (req, res) => {
  try {
    const filtros = req.query; 
    
    if (!filtros.data) {
        return res.status(400).json({ message: "Data é obrigatória." });
    }

    const dataObjeto = dayjs(filtros.data);
    const diaSemanaRaw = dataObjeto.format('dddd');
    
    const mapaDias = {
        'segunda-feira': 'Segunda', 'terça-feira': 'Terça', 'quarta-feira': 'Quarta',
        'quinta-feira': 'Quinta', 'sexta-feira': 'Sexta', 'sábado': 'Sábado', 'domingo': 'Domingo'
    };
    
    filtros.diaSemanaNome = mapaDias[diaSemanaRaw.toLowerCase()] || 'Domingo';

    const aulas = await substituicaoService.getAgendamentosParaSubstituicao(filtros);

    const agendamentosFormatados = aulas.map(aula => {
        let corFinal = aula.cor_original || '#fff'; // Branco padrão se vazio
        if (aula.is_substituida) corFinal = '#fff3cd'; // Amarelo claro (warning do bootstrap)

        return {
            id: aula.id_aula_grade,
            id_substituicao: aula.id_substituicao_eventual,
            // Importante para a Grade: precisamos dos IDs crus
            horario_id: aula.horario_id, // Certifique-se que o Model retorna isso (veja abaixo)
            turma_id: aula.turma_id,
            start: `${filtros.data}T${aula.inicio}`, 
            end: `${filtros.data}T${aula.fim}`,
            disciplina_nome: aula.disciplina_nome,
            turma_nome: aula.turma_nome,
            professor_id: aula.professor_id,
            professor_nome: aula.professor_nome,
            is_substituida: aula.is_substituida,
            motivo: aula.motivo,
            cor: corFinal
        };
    });

    res.status(200).json(agendamentosFormatados);
  } catch (error) {
    console.error("Erro getAgendamentos:", error);
    res.status(500).json({ message: error.message });
  }
};

// ... (substituirProfessor e getHistorico mantêm-se iguais ao anterior) ...
// Apenas exporte tudo corretamente
const substituirProfessor = async (req, res) => {
    // (Código igual ao anterior que te enviei)
    // ...
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        const id_usuario_responsavel = decoded.id;

        const { id_aula, id_professor_novo, data_aula, motivo } = req.body;
        
        if (!id_aula || !id_professor_novo || !data_aula) {
            return res.status(400).json({ message: 'Dados insuficientes.' });
        }

        await substituicaoService.executarSubstituicaoEventual({
            aula_id: id_aula,
            professor_substituto_id: id_professor_novo,
            data_aula: data_aula,
            motivo,
            criado_por: id_usuario_responsavel
        });

        res.status(200).json({ message: 'Substituição agendada com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

const getHistorico = async (req, res) => {
    // (Código igual ao anterior)
     try {
        const { id_agendamento } = req.params; 
        const historico = await substituicaoService.getDetalhesSubstituicao(id_agendamento);
        res.status(200).json(historico);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAgendamentos, substituirProfessor, getHistorico };