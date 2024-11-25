import Adicionar from "../componentes/agenda/adicionar/Adicionar";
import FormAdicionar from "../componentes/agenda/adicionar/formadicionar";
import Calendario from "../componentes/Calendario";
import Pagina from "./PagPadrao";


const FullLayout = () => {
  return (
    <Pagina>
      <Adicionar/>
      <FormAdicionar/>
      <Calendario/>
    </Pagina>
  );
};

export default FullLayout;