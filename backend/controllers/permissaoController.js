const permissaoModel = require('../models/permissaoModel');

const getPermissoes = async (req, res) => {
  try {
    const permissoes = await permissaoModel.getPermissoesPorFuncao();
    res.json(permissoes);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter permissões' });
  }
};

const salvarPermissoes = async (req, res) => {
  try {
    await permissaoModel.salvarPermissoes(req.body);
    res.json({ message: 'Permissões salvas com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar permissões' });
  }
};

module.exports = {
  getPermissoes,
  salvarPermissoes,
};
