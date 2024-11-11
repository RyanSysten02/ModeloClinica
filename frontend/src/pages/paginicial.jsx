import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Cabecalho from "../componentes/Cabecalho";
import { Container } from "reactstrap";
import Calendario from "../componentes/Calendario";

const FullLayout = () => {
  return (
    <main>
      {/********header**********/}
      <Cabecalho />
      <div className="pageWrapper d-lg-flex">
        {/********Sidebar**********/}
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        {/********Content Area**********/}
        <div className="contentArea">
          {/********Middle Content**********/}
          <Container className="p-4" fluid>
          <Calendario/>
            <Outlet />
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;
