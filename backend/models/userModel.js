const { hash } = require('bcryptjs')
const pool =require('../db.js')

const  findUserByEmail =async (email)=>{

    const [rows] = await pool.query(`
        SELECT u.*, r.nome as role 
        FROM user u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
      `, [email]);
      
      return rows[0];
      
}

const createUser = async (email, nome, hashedPassword, role_id) => {
    const result = await pool.query(
      'INSERT INTO user (email, nome, senha, role_id) VALUES (?, ?, ?, ?)',
      [email, nome, hashedPassword, role_id]
    );
    return result;
  };
  




module.exports={
findUserByEmail,
createUser

}

