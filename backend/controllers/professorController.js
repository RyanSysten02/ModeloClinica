const professorservices = require("../services/professorservices");
const jwt = require("jsonwebtoken");

const createProfessor = async (req, res) => {
  const {
    nome,
    cpf,
    rg,
    cep,
    end_rua,
    end_numero,
    bairro,
    cidade,
    data_nasc,
    
    habilitacao,
    
    
    telefone,
    sexo,
    email
  } = req.body;

  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  try {
    const tokenLimpo = token.split(" ")[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;
    const id = req.user.id;

    await professorservices.createProfessor(
      nome,
      cpf,
      rg,
      cep,
      end_rua,
      end_numero,
      bairro,
      cidade,
      data_nasc,
      
      habilitacao,
      
      
      telefone,
      sexo,
      email,
    );
    res.status(201).json({ message: "Professor cadastrado com sucesso" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProfessor = async (req, res) => {
  try {
    const professor = await professorservices.getProfessor();
    const professorPlano = professor[0] || [];
    res.status(200).json(professorPlano);
  } catch (error) {
    console.error("Erro ao buscar professores:", error);
    res.status(400).json({ message: error.message });
  }
};

const getProfessorById = async (req, res) => {
  const { id } = req.params;
  try {
    const professor = await professorservices.getProfessorById(id);
    if (!professor) {
      return res.status(404).json({
        message: "Erro ao buscar os dados do professor selecionado",
      });
    }
    res.status(200).json(professor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProfessor = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    cpf,
    rg,
    cep,
    end_rua,
    end_numero,
    bairro,
    cidade,
    data_nasc,
    
    habilitacao,
    
    
    telefone,
    sexo,
    email
  } = req.body;

  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  try {
    const tokenLimpo = token.split(" ")[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;
    const professor = await professorservices.getProfessorById(id);

    if (!professor) {
      return res
        .status(404)
        .json({ message: "Não foi possivel localizar o professor" });
    }

    await professorservices.updateProfessor(
      id,
      nome,
      cpf,
      rg,
      cep,
      end_rua,
      end_numero,
      bairro,
      cidade,
      data_nasc,
      
      habilitacao,
      
      
      telefone,
      sexo,
      email
    );
    res
      .status(200)
      .json({ message: "Dados do professor atualizados com sucesso" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProfessor = async (req, res) => {
  const { id } = req.params;

  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  try {
    const tokenLimpo = token.split(" ")[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    const professor = await professorservices.getProfessorById(id);
    if (!professor) {
      return res.status(404).json({ message: "Professor não encontrado" });
    }

    await professorservices.deleteProfessor(id);
    res.status(200).json({ message: "Professor deletado com sucesso" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllProfessores = async (req, res) => {
  try {
    const professores = await professorservices.getAll();
    res.status(200).json(professores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createProfessor,
  getProfessor,
  getProfessorById,
  updateProfessor,
  deleteProfessor,
  getAllProfessores,
};
