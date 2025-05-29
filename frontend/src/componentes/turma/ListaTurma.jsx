import { useEffect, useMemo, useState } from 'react';
import { Button, Container, Form, InputGroup, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import TurmaService from '../../services/Turma';
import { ModalForm } from './ModalForm';
import { ModalList } from './ModalList';

export const ListaTurma = () => {
  const [listAll, setListAll] = useState(null);
  const [messageError, setMessageError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalList, setShowModalList] = useState(false);
  const [searchText, setSearchText] = useState();

  const listFiltered = useMemo(() => {
    if (!searchText) return listAll;

    const list = listAll?.filter((turma) => {
      const currentSearch = searchText?.toLowerCase();

      return (
        turma?.nome?.toLowerCase()?.includes(currentSearch) ||
        String(turma?.ano_letivo)?.toLowerCase()?.includes(currentSearch) ||
        turma?.periodo?.toLowerCase()?.includes(currentSearch) ||
        String(turma?.semestre)?.toLowerCase()?.includes(currentSearch) ||
        turma?.status?.toLowerCase()?.includes(currentSearch)
      );
    });

    return list;
  }, [searchText, listAll]);

  const getData = async () => {
    try {
      const response = await TurmaService.findAll();

      setListAll(response);
    } catch (error) {
      setMessageError(error?.response?.data?.message);
    }
  };

  const onDetails = (item) => {
    setSelected(item);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      await TurmaService.create(formData);
      toast.success('Turma cadastrada com sucesso!');

      await getData();

      onCloseModal();
    } catch (error) {
      setMessageError(error?.response?.data?.message);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await TurmaService.update(selected?.id, formData);
      toast.success('Turma atualizada com sucesso!');

      await getData();
      onCloseModal();
    } catch (error) {
      setMessageError(error?.response?.data?.message);
    }
  };

  const onSubmit = async (formData) => {
    if (!selected) {
      await handleSave(formData);
      return;
    }

    await handleUpdate(formData);
  };

  const handleDelete = async (id) => {
    try {
      await TurmaService.delete(id);
      toast.success('Turma deletada com sucesso!');

      await getData();
      onCloseModal();
    } catch (error) {
      setMessageError(error?.response?.data?.message);
    }
  };

  const onCloseModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (messageError) {
      toast.error(messageError);
    }
  }, [messageError]);

  return (
    <Container>
      <h1 className='mt-4'>Lista de Turmas</h1>

      <div className='mb-2 d-flex justify-content-start'>
        <Button variant='info' onClick={() => setShowModal(true)}>
          Cadastrar Turma
        </Button>
      </div>

      <InputGroup className='mb-3'>
        <Form.Control
          aria-label='Example text with button addon'
          aria-describedby='basic-addon1'
          placeholder='Busque a turma'
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Button variant='outline-secondary' id='button-addon1'>
          <i className='bi bi-search'></i>
        </Button>
      </InputGroup>

      {messageError && <p className='text-danger'>{messageError}</p>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ano Letivo</th>
            <th>Período</th>
            <th>Semestre</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {listFiltered?.map((item) => (
            <tr key={item?.id}>
              <td>{item?.nome}</td>
              <td>{item?.ano_letivo}</td>
              <td>{item?.periodo}</td>
              <td>{item?.semestre}</td>
              <td>{item?.status}</td>
              <td
                style={{
                  display: 'inline-flex',
                  gap: 10,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Button variant='primary' onClick={() => onDetails(item)}>
                  Detalhes
                </Button>

                <Button
                  variant='info'
                  onClick={() => {
                    setShowModalList(true);
                    setSelected(item);
                  }}
                >
                  Alunos matrículados
                </Button>

                <Button variant='danger' onClick={() => handleDelete(item?.id)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <ModalForm
        show={showModal}
        onHide={onCloseModal}
        onSave={onSubmit}
        selected={selected}
      />

      <ModalList
        show={showModalList}
        onHide={() => {
          setShowModalList(false);
          setSelected(null);
        }}
        selected={selected}
      />
    </Container>
  );
};
