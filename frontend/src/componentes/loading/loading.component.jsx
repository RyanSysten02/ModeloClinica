import { Spinner } from 'react-bootstrap';

export const Loading = () => {
  return (
    <div className='d-flex flex-column justify-content-center align-items-center w-100 vh-100'>
      <Spinner as='div' animation='border' size='xl' />
      <span className='ms-3'>Carregando...</span>
    </div>
  );
};
