const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: "masterkey",
    database: "backend",
    port: 3306,
  },
});


module.exports = knex