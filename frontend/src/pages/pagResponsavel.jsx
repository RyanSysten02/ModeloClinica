import Calendario from "../componentes/Calendario";
import TelaListaResponsavels from "../componentes/responsavel/telalisresponsavel";
import Pagina from "./PagPadrao";


const Layoutresponsavel = () => {
  return (
    <Pagina>
      <TelaListaResponsavels></TelaListaResponsavels>
    </Pagina>
  );
};

export default Layoutresponsavel;