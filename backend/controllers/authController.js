const authService = require('../services/userServices')
const register = async  (req,res)=>{
    const {email,nome,password}=req.body;
    
    try {
        await authService.registerUser(email,nome,password)
        res.status(201).json({message:'Usuário criado com sucesso'})
    } catch (error) {
        res.status(400).json({message:error.message})
        
    }

}

const login = async (req,res)=>{

    const {email,password}=req.body;
    try {
        const token =await authService.loginUser(email,password);
        res.json({token})
    } catch (error) {
        res.status(400).json({message:error.message});
        
    }
}

module.exports={
    register,
    login
}