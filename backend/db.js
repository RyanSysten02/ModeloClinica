const mysql = require ('mysql2/promise')
const pool =mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'masterkey',
    database: 'backend',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
})

module.exports =pool