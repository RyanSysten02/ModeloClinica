const pacienteservices = require('../services/pacienteservices');
const jwt = require('jsonwebtoken');

const createPaciente = async (req, res) => {
    const { nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude, endereco, num, complemento, 
        celular, telefone, email, contatoEmergencia, observacoes} = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const id = req.user.id;

        await pacienteservices.createPaciente( nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, planoSaude, endereco, num, complemento, 
            celular, telefone, email, contatoEmergencia, observacoes);
        res.status(201).json({ message: 'Paciente cadastrado com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const getPaciente = async (req, res) => {
    try {
        const paciente = await pacienteservices.getPaciente();
        const pacientePlano = paciente[0] || [];  
        res.status(200).json(pacientePlano); 
    } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
        res.status(400).json({ message: error.message });
    }
};


const getPacienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const paciente = await pacienteservices.getPacienteById(id);
        if (!paciente) {
            return res.status(404).json({ message: 'Erro ao buscar os dados do paciente selecionado' });
        }
        res.status(200).json(paciente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePaciente = async (req, res) => {
    const { id } = req.params;
    const { title, start, end, desc, color, tipo } = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const paciente = await pacienteservices.getPacienteById(id);

        if (!paciente) {
            return res.status(404).json({ message: 'Não foi possivel localizar o paciente' });
        }

        await pacienteservices.updatePaciente(id, title, start, end, desc, color, tipo);
        res.status(200).json({ message: 'Dados do paciente atualizados com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const deletePaciente = async (req, res) => {
    const { id } = req.params;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        
        const paciente = await pacienteservices.getPacienteById(id);
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente não encontrado' });
        }

        await pacienteservices.deletePaciente(id);
        res.status(200).json({ message: 'Paciente deletado com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



module.exports = {
    createPaciente,
    getPaciente,
    getPacienteById,
    updatePaciente,
    deletePaciente
};
