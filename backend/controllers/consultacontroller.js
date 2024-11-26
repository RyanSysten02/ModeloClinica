const consultasservices = require('../services/consultaservices');
const jwt = require('jsonwebtoken');

const createConsulta = async (req, res) => {
    const { title, start, end, desc, color, tipo } = req.body;
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const id_usuario_inclusao = req.user.id;

        const id = req.user.id;
        const consultaId = await consultasservices.createConsulta(title, start, end, desc, color, tipo, id_usuario_inclusao);
        return res.status(201).json({ message: 'Consulta criada com sucesso', consultaId });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};



const adiarConsulta = async (req, res) => {
    const { id } = req.params; // ID da consulta original
    const { start, end, motivo_adiamento } = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const id_usuario_inclusao = req.user.id;

        const consultaOriginal = await consultasservices.getConsultaById(id);

        if (!consultaOriginal) {
            return res.status(404).json({ message: 'Consulta original não encontrada' });
        }

        // Criar nova consulta com base na original
        const novaConsulta = await consultasservices.adiarConsulta(
            id, // Passar o ID da consulta original
            start,
            end,
            motivo_adiamento,
            id_usuario_inclusao
        );

        res.status(201).json({
            message: 'Consulta adiada com sucesso',
            consulta: novaConsulta,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



const getConsultasTipo = async (req, res) => {
    try {
        const consultas = await consultasservices.getConsultasTipo();
        res.status(200).json(consultas);
    } catch (error) {
        console.error("Erro ao buscar tipos de consulta", error);
        res.status(400).json({ message: error.message });
    }
};

const getConsultas = async (req, res) => {
    try {
        const consultas = await consultasservices.getConsultas();
        const consultasPlano = consultas[0] || [];  
        res.status(200).json(consultasPlano); 
    } catch (error) {
        console.error("Erro ao buscar consultas:", error);
        res.status(400).json({ message: error.message });
    }
};


const getConsultaById = async (req, res) => {
    const { id } = req.params;
    try {
        const consulta = await consultasservices.getConsultaById(id);
        if (!consulta) {
            return res.status(404).json({ message: 'Consulta não encontrada' });
        }
        res.status(200).json(consulta);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateConsulta = async (req, res) => {
    const { id } = req.params;
    const { title, start, end, desc, color, tipo } = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const consulta = await consultasservices.getConsultaById(id);

        if (!consulta) {
            return res.status(404).json({ message: 'Consulta não encontrada' });
        }

        await consultasservices.updateConsulta(id, title, start, end, desc, color, tipo);
        res.status(200).json({ message: 'Consulta atualizada com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateConsultaCancelamento = async (req, res) => {
    const { id } = req.params;
    const {motivocancelamento} = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const consulta = await consultasservices.getConsultaById(id);

        if (!consulta) {
            return res.status(404).json({ message: 'Não foi possivel cancelar essa consulta' });
        }

        await consultasservices.updateConsultaCancelamento(id, motivocancelamento);
        res.status(200).json({ message: 'Consulta cancelada com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const deleteConsulta = async (req, res) => {
    const { id } = req.params;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        
        const consulta = await consultasservices.getConsultaById(id);
        if (!consulta) {
            return res.status(404).json({ message: 'Consulta não encontrada' });
        }

        await consultasservices.deleteConsulta(id);
        res.status(200).json({ message: 'Consulta deletada com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



module.exports = {
    createConsulta,
    getConsultasTipo,
    getConsultas,
    getConsultaById,
    updateConsulta,
    updateConsultaCancelamento,
    deleteConsulta,
    adiarConsulta
};
