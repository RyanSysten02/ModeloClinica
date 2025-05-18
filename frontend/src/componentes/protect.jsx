import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles = [], allowedPermissions = [] }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // Se o usuário for ADM, permite tudo
    if (decoded.role === "ADM") return children;

    // Validação por role
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/acesso-negado" replace />;
    }

    // Validação por permissões
    if (
      allowedPermissions.length > 0 &&
      (!decoded.permissoes ||
        !allowedPermissions.some((perm) => decoded.permissoes[perm]))
    ) {
      return <Navigate to="/acesso-negado" replace />;
    }

    return children;
  } catch (err) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
