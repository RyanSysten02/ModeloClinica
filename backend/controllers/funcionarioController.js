const funcionarioservices = require('../services/funcionarioservices');
const jwt = require('jsonwebtoken');

const createFuncionario = async (req, res) => {
    const { nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc, num_regis, habilitacao, especializacao, cursos} = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const id = req.user.id;

        await funcionarioservices.createFuncionario( nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc, num_regis, habilitacao, especializacao,cursos);
        res.status(201).json({ message: 'Funcionario cadastrado com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const getFuncionario = async (req, res) => {
    try {
        const funcionario = await funcionarioservices.getFuncionario();
        const funcionarioPlano = funcionario[0] || [];  
        res.status(200).json(funcionarioPlano); 
    } catch (error) {
        console.error("Erro ao buscar funcionarios:", error);
        res.status(400).json({ message: error.message });
    }
};


const getFuncionarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const funcionario = await funcionarioservices.getFuncionarioById(id);
        if (!funcionario) {
            return res.status(404).json({ message: 'Erro ao buscar os dados do funcionario selecionado' });
        }
        res.status(200).json(funcionario);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateFuncionario = async (req, res) => {
    const { id } = req.params;
    const { nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc, num_regis, habilitacao, especializacao,cursos } = req.body;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        const funcionario = await funcionarioservices.getFuncionarioById(id);

        if (!funcionario) {
            return res.status(404).json({ message: 'Não foi possivel localizar o funcionario' });
        }

        await funcionarioservices.updateFuncionario(id, nome, cpf, rg, cep, end_rua, end_numero, bairro, cidade, data_nasc, num_regis, habilitacao, especializacao,cursos);
        res.status(200).json({ message: 'Dados do funcionario atualizados com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const deleteFuncionario = async (req, res) => {
    const { id } = req.params;

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;
        
        const funcionario = await funcionarioservices.getFuncionarioById(id);
        if (!funcionario) {
            return res.status(404).json({ message: 'Funcionario não encontrado' });
        }

        await funcionarioservices.deleteFuncionario(id);
        res.status(200).json({ message: 'Funcionario deletado com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



module.exports = {
    createFuncionario,
    getFuncionario,
    getFuncionarioById,
    updateFuncionario,
    deleteFuncionario
};
