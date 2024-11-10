require('dotenv').config();
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const consultaRoutes = require('./routes/consultaroutes')
const app =express();
app.use(cors())

app.use(express.json());

app.use('/api/auth', authRoutes)
app.use('/api/consulta', consultaRoutes)

const PORT =5001;
app.listen(PORT, ()=> console.log('Servidor rodando:'+PORT))