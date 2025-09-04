import { Button, Modal } from 'react-bootstrap';

export const ModalDeletar = ({ onSave, onCancel, show, entity }) => {
  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Atenção</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Deseja deletar&nbsp;<strong>{entity}</strong>&nbsp;?
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={onCancel}>
          Fechar
        </Button>

        <Button variant='primary' onClick={onSave}>
          Continuar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
