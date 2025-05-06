import React, { useState, useEffect } from "react";
import { Modal, Container, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AlunoDetalhesModal from './ResponsavelDetalhesModal';
import FormularioAluno from '../aluno/Aluno'; 
import { format } from 'date-fns';

const ListaAlunosModal = ({ show, onHide, onSelectAluno }) => {
  const [alunos, setAlunos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false); // Controle do modal de cadastro
  const navigate = useNavigate();

  // Função para buscar alunos - agora fora do useEffect
  const fetchAlunos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5001/api/aluno/allaluno", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlunos(data);
      } else {
        setMensagemErro("Erro ao carregar os alunos.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  // Chama a função fetchAlunos quando o componente é montado
  useEffect(() => {
    fetchAlunos();
  }, [navigate]);

  const handleDetalhes = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }
      const response = await fetch(`http://localhost:5001/api/aluno/aluno/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setAlunoSelecionado(data[0]);
          setShowModal(true);
        } else {
          setMensagemErro("Dados do aluno não encontrados.");
        }
      } else {
        setMensagemErro("Erro ao carregar detalhes do aluno.");
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

      const response = await fetch(`http://localhost:5001/api/aluno/aluno/${formData.id}`, {
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
        setAlunos(prevState =>
          prevState.map(p =>
            p.id === formData.id ? formData : p
          )
        );
      } else {
        setMensagemErro("Erro ao salvar alterações do aluno.");
      }
    } catch (error) {
      console.error("Erro na atualização:", error.message);
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  const handleDelete = async (id) => {
    // Lógica para deletar aluno...
  };

  const closeModal = () => {
    setShowModal(false);
    setAlunoSelecionado(null);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Lista de Alunos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensagemErro && <p className="text-danger">{mensagemErro}</p>}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Turma</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.nome}</td>
                  <td>{aluno.cpf}</td>
                  <td>{aluno.alunoTurma}</td>
                  <td>
                    <Button variant="primary" onClick={() => handleDetalhes(aluno.id)}>
                      Detalhes
                    </Button>
                    <Button variant="success" onClick={() => onSelectAluno(aluno)} style={{ marginLeft: '10px' }}>
                      Selecionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {showModal && (
            <AlunoDetalhesModal show={showModal} onHide={closeModal} aluno={alunoSelecionado} onSave={handleSave} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Fechar</Button>
          <Button variant="info" onClick={() => setShowCadastroModal(true)}>Cadastrar Aluno</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Cadastro de Alunos */}
      <FormularioAluno
        show={showCadastroModal}
        onHide={() => {
          setShowCadastroModal(false);
          fetchAlunos(); // Atualiza a lista de alunos após fechar o modal
        }}
        onAlunosAtualizados={fetchAlunos} // Passa a função para atualizar a lista
      />
    </>
  );
};

export default ListaAlunosModal;
