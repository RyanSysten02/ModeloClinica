require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const alunoRoutes = require('./routes/alunoroutes');
const professorRoutes = require('./routes/professorroutes');
const responsavelRoutes = require('./routes/responsavelRoutes');
const disciplinaRoutes = require('./routes/disciplina.routes');
const turmaRoutes = require('./routes/turma.routes');
const matriculaRoutes = require('./routes/matricularoutes');
const aulasRoutes = require('./routes/aularoutes'); 

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/aulas', aulasRoutes); 
app.use('/api/aluno', alunoRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/responsavel', responsavelRoutes);
app.use('/api/disciplina', disciplinaRoutes);
app.use('/api/turma', turmaRoutes);
app.use('/api/matricula', matriculaRoutes);

const PORT = 5001;
app.listen(PORT, () => console.log('Servidor rodando na porta ' + PORT));
