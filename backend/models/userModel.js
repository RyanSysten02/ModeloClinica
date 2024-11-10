const { hash } = require('bcryptjs')
const pool =require('../db.js')

const  findUserByEmail =async (email)=>{

    const [rows] = await pool.query('select * from user where email =?', [email])
    return rows[0]
}

const createUser =async (email,nome, hashedPassword)=>{
    const result = await pool.query('INSERT INTO user (email, nome, senha) VALUES (?, ?, ?)',[email,nome, hashedPassword])
    return result
}


module.exports={
findUserByEmail,
createUser

}

