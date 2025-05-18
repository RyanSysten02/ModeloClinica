const pool = require('../db');

const getAllRoles = async () => {
  const [rows] = await pool.query('SELECT * FROM roles');
  return rows;
};

module.exports = {
  getAllRoles,
};
