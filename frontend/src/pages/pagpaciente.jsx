import Calendario from "../componentes/Calendario";
import TelaListaPacientes from "../componentes/paciente/telalispaciente";
import Pagina from "./PagPadrao";


const Layoutpaciente = () => {
  return (
    <Pagina>
      <TelaListaPacientes></TelaListaPacientes>
    </Pagina>
  );
};

export default Layoutpaciente;