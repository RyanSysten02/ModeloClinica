import { useCallback, useEffect, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import TurmaService from "../../services/Turma";
import { toast } from "react-toastify";

export const ModalList = ({ show, onHide, selected }) => {
  const [list, setList] = useState();

  const getData = useCallback(async () => {
    try {
      if (!selected?.id) return;

      const filters = {
        name: selected?.nome,
      };

      const result = await TurmaService.findQuery(filters);

      setList(result);
    } catch (error) {
      toast.error(error?.message);
    }
  }, [selected?.nome, selected?.id]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Turma</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Turma</th>
            </tr>
          </thead>
          <tbody>
            {list?.map((aluno) => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>{aluno.cpf}</td>
                <td>{aluno.alunoTurma}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
