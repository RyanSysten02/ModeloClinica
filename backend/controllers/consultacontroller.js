const consultasservices = require('../services/consultaservices');
const jwt = require('jsonwebtoken');

const createConsulta = async (req, res) => {
    const {title, start, end, desc, color, tipo} = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const id = req.user.id;

        await consultasservices.createConsulta(title, start, end, desc, color, tipo);
        res.status(201).json({ message: 'Consulta criada com sucesso' });
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
    deleteConsulta
};
