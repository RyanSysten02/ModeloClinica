const consultamodel = require('../models/consultamodel');

const createConsulta =async (title, start, end, desc, color, tipo)=>{
const  consulta = await consultamodel.createConsulta(title, start, end, desc, color, tipo);
return consulta
}

const getConsultas =async (title, start, end, desc, color, tipo)=>{
    const  consulta = await consultamodel.getConsultas(title, start, end, desc, color, tipo);
    return consulta
    }

const getConsultasTipo =async (tipo)=>{
    const  consulta = await consultamodel.getConsultasTipo(tipo);
    return consulta
    }

module.exports={
    createConsulta,
    getConsultas,
    getConsultasTipo,

}