import { useCallback, useEffect, useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import TurmaService from '../../services/Turma';
import { toast } from 'react-toastify';

export const ModalList = ({ show, onHide, selected }) => {
  const [list, setList] = useState();

  const getData = useCallback(async () => {
    try {
      if (!selected?.id) return;

      const result = await TurmaService.listStudents(selected?.id);

      setList(result);
    } catch (error) {
      toast.error(error?.message);
    }
  }, [selected?.id]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Modal show={show} onHide={onHide} size='xl'>
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
            {list?.map((item) => (
              <tr key={item?.id}>
                <td>{item?.nome}</td>
                <td>{item?.cpf}</td>
                <td>{selected?.nome}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
