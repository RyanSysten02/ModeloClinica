import React from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const AcessoNegado = () => {
const navigate = useNavigate();

return (
<div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center">
<div className="p-5 shadow rounded bg-white">
<h1 className="text-danger mb-4">Acesso Negado!</h1>
<p className="mb-4">
Você não tem permissão para acessar este recurso, por favor contate o Administrador.
</p>
<Button color="primary" onClick={() => navigate("/paginicial")}>
Voltar para o início
</Button>
</div>
</div>
);
};

export default AcessoNegado;