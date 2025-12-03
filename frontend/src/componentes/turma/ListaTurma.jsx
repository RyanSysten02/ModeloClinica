import { useEffect, useMemo, useState } from 'react';
import { Button, Container, Form, InputGroup, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import TurmaService from '../../services/Turma';
import { ModalForm } from './ModalForm';
import { ModalGerarRelatorio } from './ModalGerarRelatorio';
import { ModalList } from './ModalList';
import { ModalDeletar } from '../ModalDeletar';

export const ListaTurma = () => {
  const [listAll, setListAll] = useState(null);
  const [messageError, setMessageError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalGerarRelatorioTurmas, setShowModalGerarRelatorioTurmas] = useState(false);
  const [showModalList, setShowModalList] = useState(false);
  const [searchText, setSearchText] = useState(''); // Inicializado com string vazia
  const [showModalDelete, setShowModalDelete] = useState(false);

  const listFiltered = useMemo(() => {
    if (!searchText) return listAll;

    return listAll?.filter((turma) => {
      const currentSearch = searchText?.toLowerCase();

      return (
        turma?.nome?.toLowerCase()?.includes(currentSearch) ||
        turma?.nivel?.toLowerCase()?.includes(currentSearch) || // Filtro por Nivel
        String(turma?.ano_letivo)?.toLowerCase()?.includes(currentSearch) ||
        String(turma?.semestre)?.toLowerCase()?.includes(currentSearch) ||
        turma?.status?.toLowerCase()?.includes(currentSearch)
      );
    });
  }, [searchText, listAll]);

  const getData = async () => {
    try {
      const response = await TurmaService.findAll();
      setListAll(response);
    } catch (error) {
      setMessageError(error?.response?.data?.message || 'Erro ao buscar turmas');
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
      toast.error(error?.response?.data?.message || 'Erro ao salvar');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await TurmaService.update(selected?.id, formData);
      toast.success('Turma atualizada com sucesso!');
      await getData();
      onCloseModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar');
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
      await TurmaService.delete(selected?.id);
      toast.success('Turma deletada com sucesso!');
      await getData();
      onCloseModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erro ao deletar');
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
    setSearchText('');
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Container>
      <h1 className='mt-4'>Lista de Turmas</h1>

      <div className='mb-2 d-flex justify-content-start gap-2'>
        <Button
          variant='info'
          onClick={() => {
            resetAll();
            setShowModal(true);
          }}
        >
          Cadastrar Turma
        </Button>

        <Button
          variant='secondary'
          onClick={() => {
            setShowModalGerarRelatorioTurmas(true);
          }}
        >
          Gerar Relatório
        </Button>
      </div>

      <InputGroup className='mb-3'>
        <Form.Control
          aria-label='Busca'
          placeholder='Busque por nome, nível, ano ou status'
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
        />
        <Button variant='outline-secondary'>
          <i className='bi bi-search'></i>
        </Button>
      </InputGroup>

      {messageError && <p className='text-danger'>{messageError}</p>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Nível</th> 
            <th>Ano Letivo</th>
            <th>Semestre</th>
            <th>Status</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {listFiltered?.map((item) => (
            <tr key={item?.id}>
              <td>{item?.nome}</td>
              <td>{item?.nivel}</td> 
              <td>{item?.ano_letivo}</td>
              <td>{item?.semestre}º</td>
              <td>{item?.status}</td>
              <td className="text-center">
                <div className="d-flex gap-2 justify-content-center">
                    <Button size="sm" variant='primary' onClick={() => onDetails(item)}>
                    Detalhes
                    </Button>

                    <Button size="sm" variant='info' onClick={() => {
                        setShowModalList(true);
                        setSelected(item);
                    }}>
                    Alunos
                    </Button>

                    <Button size="sm" variant='danger' onClick={() => {
                        setShowModalDelete(true);
                        setSelected(item);
                    }}>
                    Excluir
                    </Button>
                </div>
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

      <ModalGerarRelatorio
        show={showModalGerarRelatorioTurmas}
        onHide={() => setShowModalGerarRelatorioTurmas(false)}
      />

      <ModalList
        show={showModalList}
        onHide={() => {
          setShowModalList(false);
          setSelected(null);
        }}
        selected={selected}
      />

      <ModalDeletar
        onCancel={onCloseModal}
        onSave={handleDelete}
        show={showModalDelete}
        entity='Turma'
      />
    </Container>
  );
};