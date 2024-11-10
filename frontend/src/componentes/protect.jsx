import {jwtDecode} from 'jwt-decode'
import { Navigate } from 'react-router-dom';

const ProtectedRoute=({children})=>{
    const token = localStorage.getItem('token')
        if(!token){
        return <Navigate to ="/login" ></Navigate>
        }
        try {
             const decodedToken = jwtDecode(token)
             const currentTime = Date.now()/1000;
             if(decodedToken.exp < currentTime){
             localStorage.removeItem('token')
                return <Navigate to ="/login" ></Navigate>
             }

            return children  
        } catch (error) {
            localStorage.removeItem('token');
            return <Navigate to ="/login" ></Navigate>      
        }
    
}

export default ProtectedRoute
