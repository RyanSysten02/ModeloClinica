const responsavelservices = require('../services/responsavelservices');
const jwt = require('jsonwebtoken');

const createResponsavel = async (req, res) => {
    const { nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma, endereco, num, complemento, 
        celular, telefone, email, contatoEmergencia, observacoes} = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const id = req.user.id;

        await responsavelservices.createResponsavel( nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma, endereco, num, complemento, 
            celular, telefone, email, contatoEmergencia, observacoes);
        res.status(201).json({ message: 'Responsavel cadastrado com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const getResponsavel = async (req, res) => {
    try {
        const responsavel = await responsavelservices.getResponsavel();
        const responsavelPlano = responsavel[0] || [];  
        res.status(200).json(responsavelPlano); 
    } catch (error) {
        console.error("Erro ao buscar responsavels:", error);
        res.status(400).json({ message: error.message });
    }
};


const getResponsavelById = async (req, res) => {
    const { id } = req.params;
    try {
        const responsavel = await responsavelservices.getResponsavelById(id);
        if (!responsavel) {
            return res.status(404).json({ message: 'Erro ao buscar os dados do responsavel selecionado' });
        }
        res.status(200).json(responsavel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateResponsavel = async (req, res) => {
    const { id } = req.params;
    const { nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma, endereco, num, complemento, 
        celular, telefone, email, contatoEmergencia, observacoes } = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const responsavel = await responsavelservices.getResponsavelById(id);

        if (!responsavel) {
            return res.status(404).json({ message: 'Não foi possivel localizar o responsavel' });
        }

        await responsavelservices.updateResponsavel(id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, responsavelTurma, endereco, num, complemento, 
            celular, telefone, email, contatoEmergencia, observacoes);
        res.status(200).json({ message: 'Dados do responsavel atualizados com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const deleteResponsavel = async (req, res) => {
    const { id } = req.params;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        
        const responsavel = await responsavelservices.getResponsavelById(id);
        if (!responsavel) {
            return res.status(404).json({ message: 'Responsavel não encontrado' });
        }

        await responsavelservices.deleteResponsavel(id);
        res.status(200).json({ message: 'Responsavel deletado com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



module.exports = {
    createResponsavel,
    getResponsavel,
    getResponsavelById,
    updateResponsavel,
    deleteResponsavel
};
