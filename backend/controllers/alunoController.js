const alunoservices = require('../services/alunoservices');
const jwt = require('jsonwebtoken');

const createAluno = async (req, res) => {
    const { nome, cpf, rg, dataNascimento, sexo, numeroBeneficio,  endereco, num, complemento, 
        celular, telefone, email, contatoEmergencia, observacoes } = req.body;
    const cpfNormalizado = cpf.replace(/\D/g, '');
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    try {
        const tokenLimpo = token.split(' ')[1];
        const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = decoded;

        // Verifica se já existe aluno com esse CPF
        const alunoExistente = await alunoservices.getAlunoByCpf(cpfNormalizado);
        if (alunoExistente) {
            return res.status(409).json({ message: 'CPF já cadastrado para outro aluno' });
        }

        await alunoservices.createAluno(nome, cpf, rg, dataNascimento, sexo, numeroBeneficio,  endereco, num, complemento, 
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
  const {
    nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, 
    endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes
  } = req.body;
  const cpfNormalizado = cpf ? cpf.replace(/\D/g, '') : '';
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    const alunoExistente = await alunoservices.getAlunoById(id);
    if (!alunoExistente) {
      return res.status(404).json({ message: 'Não foi possível localizar o aluno' });
    }

    const alunoComMesmoCpf = await alunoservices.getAlunoByCpf(cpfNormalizado);
    if (alunoComMesmoCpf && String(alunoComMesmoCpf.id) !== String(id)) {
      return res.status(409).json({ message: 'CPF já cadastrado para outro aluno' });
    }

    await alunoservices.updateAluno(id, nome, cpf, rg, dataNascimento, sexo, numeroBeneficio, 
      endereco, num, complemento, celular, telefone, email, contatoEmergencia, observacoes);

    res.status(200).json({ message: 'Dados do aluno atualizados com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  console.log('Body recebido:', req.body);
console.log('ID param:', req.params.id);
console.log('CPF:', cpf);

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
        // Verificação específica para violação de chave estrangeira
        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.message.includes('a foreign key constraint fails')
        ) {
            return res.status(400).json({
                message: 'Não é possível excluir o aluno. Existe uma matrícula vinculada a este aluno.'
            });
        }

        res.status(400).json({ message: error.message });
    }
};


const verificarCpfExistente = async (req, res) => {
    const { cpf } = req.params;

    try {
        const aluno = await alunoservices.getAlunoByCpf(cpf);
        if (aluno) {
            return res.status(200).json({ existe: true });
        }
        res.status(200).json({ existe: false });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao verificar CPF', erro: error.message });
    }
    console.log('Body recebido:', req.body);
console.log('ID param:', req.params.id);
console.log('CPF:', cpf);

};


module.exports = {
    createAluno,
    getAluno,
    getAlunoById,
    updateAluno,
    deleteAluno,
    verificarCpfExistente,
};
