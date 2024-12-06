import React, { useState, useEffect } from "react";
import { Container, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FuncionarioDetalhesModal from './FuncionarioDetalhesModal';
import { format } from 'date-fns';
import FormularioFuncionario from "./Funcionario";

const TelaListaFuncionarios = ({ onSelectFuncionario }) => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const navigate = useNavigate();

  // Função para buscar os funcionários
  const fetchFuncionarios = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5001/api/funcionario/allfuncionario", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFuncionarios(data);
      } else {
        setMensagemErro("Erro ao carregar os funcionários.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  useEffect(() => {
    fetchFuncionarios();
  }, [navigate]);

  const handleDetalhes = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5001/api/funcionario/funcionario/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setFuncionarioSelecionado(data[0]);
          setShowModal(true);
        } else {
          setMensagemErro("Dados do funcionário não encontrados.");
        }
      } else {
        setMensagemErro("Erro ao carregar detalhes do funcionário.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const handleSave = async (formData) => {
    console.log('Tentando salvar:', formData);

    if (formData.dataNascimento) {
      const date = new Date(formData.dataNascimento);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      formData.dataNascimento = format(date, 'yyyy-MM-dd');
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5001/api/funcionario/funcionario/${formData.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (response.ok) {
        // Após salvar, recarrega a lista de funcionários
        await fetchFuncionarios();
      } else {
        setMensagemErro("Erro ao salvar alterações do funcionário.");
      }
    } catch (error) {
      console.error("Erro na atualização:", error.message);
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5001/api/funcionario/funcionario/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Após deletar, recarrega a lista de funcionários
        await fetchFuncionarios();
      } else {
        setMensagemErro("Erro ao apagar o funcionário.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFuncionarioSelecionado(null);
  };

  return (
    <Container>
      <h1 className="mt-4">Lista de Funcionários</h1>
      <div className="m-2 d-flex justify-content-start">
        <Button variant="info" onClick={() => setShowCadastroModal(true)}>Cadastrar Funcionário</Button>
      </div>
      {mensagemErro && <p className="text-danger">{mensagemErro}</p>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Matricula</th>
            <th>Função</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map((funcionario) => (
            <tr key={funcionario.id}>
              <td>{funcionario.nome}</td>
              <td>{funcionario.matricula}</td>
              <td>{funcionario.funcao}</td>
              <td>
                <Button variant="primary" onClick={() => handleDetalhes(funcionario.id)}>
                  Detalhes
                </Button>
      
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {showModal && (
        <FuncionarioDetalhesModal show={showModal} onHide={closeModal} funcionario={funcionarioSelecionado} onSave={handleSave} />
      )}

      <FormularioFuncionario
  show={showCadastroModal}
  onHide={() => setShowCadastroModal(false)}
  onCadastroSuccess={fetchFuncionarios} 
/>
    </Container>
  );
};

export default TelaListaFuncionarios;
