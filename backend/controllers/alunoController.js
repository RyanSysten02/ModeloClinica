const alunoservices = require('../services/alunoservices');
const jwt = require('jsonwebtoken');

const createAluno = async (req, res) => {
    const { nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma, endereco, num, complemento, 
        celular, telefone, email, contatoEmergencia, observacoes} = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const id = req.user.id;

        await alunoservices.createAluno( nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma, endereco, num, complemento, 
            celular, telefone, email, contatoEmergencia, observacoes);
        res.status(201).json({ message: 'Aluno cadastrado com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const getAluno = async (req, res) => {
    try {
        const aluno = await alunoservices.getAluno();
        const alunoPlano = aluno[0] || [];  
        res.status(200).json(alunoPlano); 
    } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        res.status(400).json({ message: error.message });
    }
};


const getAlunoById = async (req, res) => {
    const { id } = req.params;
    try {
        const aluno = await alunoservices.getAlunoById(id);
        if (!aluno) {
            return res.status(404).json({ message: 'Erro ao buscar os dados do aluno selecionado' });
        }
        res.status(200).json(aluno);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateAluno = async (req, res) => {
    const { id } = req.params;
    const { nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma, endereco, num, complemento, 
        celular, telefone, email, contatoEmergencia, observacoes } = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const aluno = await alunoservices.getAlunoById(id);

        if (!aluno) {
            return res.status(404).json({ message: 'Não foi possivel localizar o aluno' });
        }

        await alunoservices.updateAluno(id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, alunoTurma, endereco, num, complemento, 
            celular, telefone, email, contatoEmergencia, observacoes);
        res.status(200).json({ message: 'Dados do aluno atualizados com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const deleteAluno = async (req, res) => {
    const { id } = req.params;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        
        const aluno = await alunoservices.getAlunoById(id);
        if (!aluno) {
            return res.status(404).json({ message: 'Aluno não encontrado' });
        }

        await alunoservices.deleteAluno(id);
        res.status(200).json({ message: 'Aluno deletado com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



module.exports = {
    createAluno,
    getAluno,
    getAlunoById,
    updateAluno,
    deleteAluno
};
