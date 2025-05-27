const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const registerUser = async (email, nome, password, role = 'Professor') => {
  const userExists = await userModel.findUserByEmail(email);
  if (userExists) {
    throw new Error('Usuário com este e-mail já existe');
  }

  const hashedPassword = await bcryptjs.hash(password, 10);
  await userModel.createUser(email, nome, hashedPassword, role);
};

const loginUser = async (email, password) => {
  const user = await userModel.findUserByEmail(email);
  if (!user || !(await bcryptjs.compare(password, user.senha))) {
    throw new Error('Usuário ou senha incorretos!');
  }

  const [rows] = await require('../db').query(
    `SELECT p.recurso, p.pode_acessar
     FROM permissoes p
     WHERE p.role_id = ?`,
    [user.role_id]
  );

  const permissoes = {};
  rows.forEach(row => {
    permissoes[row.recurso] = !!row.pode_acessar;
  });

  const token = jwt.sign(
    {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      permissoes
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return token;
};

module.exports = {
  registerUser,
  loginUser
};
