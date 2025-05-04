require('dotenv').config();
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const consultaRoutes = require('./routes/consultaroutes')
const alunoRoutes = require('./routes/alunoroutes')
const funcionarioRoutes = require('./routes/funcionarioroutes')
const app =express();
app.use(cors())

app.use(express.json());

app.use('/api/auth', authRoutes)
app.use('/api/consulta', consultaRoutes)
app.use('/api/aluno', alunoRoutes)
app.use('/api/funcionario', funcionarioRoutes)

const PORT =5001;
app.listen(PORT, ()=> console.log('Servidor rodando:'+PORT))