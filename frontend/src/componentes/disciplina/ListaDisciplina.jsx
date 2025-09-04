import { useEffect, useMemo, useState } from 'react';
import { Button, Container, Form, InputGroup, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import DisciplinaService from '../../services/Disciplina';
import { ModalForm } from './ModalForm';
import { ModalDeletar } from '../ModalDeletar';

export const ListaDisciplina = () => {
  const [listAll, setListAll] = useState(null);
  const [messageError, setMessageError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState();
  const [showModalDelete, setShowModalDelete] = useState(false);

  const listFiltered = useMemo(() => {
    if (!searchText) return listAll;

    const list = listAll?.filter((disciplina) => {
      const currentSearch = searchText?.toLowerCase();

      return disciplina?.nome?.toLowerCase()?.includes(currentSearch);
    });

    return list;
  }, [searchText, listAll]);

  const getData = async () => {
    try {
      const response = await DisciplinaService.findAll();

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
      await DisciplinaService.create(formData);
      toast.success('Disciplina cadastrada com sucesso!');

      await getData();

      onCloseModal();
    } catch (error) {
      setMessageError(error?.response?.data?.message);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await DisciplinaService.update(selected?.id, formData);
      toast.success('Disciplina atualizada com sucesso!');

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

  const handleDelete = async () => {
    try {
      await DisciplinaService.delete(selected?.id);
      toast.success('Disciplina deletada com sucesso!');

      await getData();
      onCloseModal();
    } catch (error) {
      setMessageError(error?.response?.data?.message);
    }
  };

  const onCloseModal = () => {
    setShowModal(false);
    setShowModalDelete(false);
    setSelected(null);
  };

  const resetAll = () => {
    setMessageError(null);
    setSelected(null);
    setSearchText(null);
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
      <h1 className='mt-4'>Lista de Disciplinas</h1>

      <div className='mb-2 d-flex justify-content-start'>
        <Button
          variant='info'
          onClick={() => {
            resetAll();
            setShowModal(true);
          }}
        >
          Cadastrar Disciplina
        </Button>
      </div>

      <InputGroup className='mb-3'>
        <Form.Control
          aria-label='Example text with button addon'
          aria-describedby='basic-addon1'
          placeholder='Busque o aluno'
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
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {listFiltered?.map((item) => (
            <tr key={item?.id}>
              <td>{item?.nome}</td>
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
                  variant='danger'
                  onClick={() => {
                    setShowModalDelete(true);
                    setSelected(item);
                  }}
                >
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

      <ModalDeletar
        onCancel={onCloseModal}
        onSave={handleDelete}
        show={showModalDelete}
        entity='Disciplina'
      />
    </Container>
  );
};
