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

const deleteConsulta =async (id)=>{
    const  consulta = await consultamodel.deleteConsulta(id);
    return consulta
    }
    
const updateConsulta =async (id)=>{
    const  consulta = await consultamodel.updateConsulta(id);
    return consulta
    }

module.exports={
    createConsulta,
    getConsultas,
    getConsultasTipo,
    deleteConsulta,
    updateConsulta,

}