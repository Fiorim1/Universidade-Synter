import Header from "../components/Header";
import Footer from "../components/Footer";

import "../styles/NotFound.css";


function NotFound() {

  return (

    <div className="notfound-page">

      <Header />


      <main className="notfound-main">

        <div className="notfound-glow notfound-glow-one"></div>
        <div className="notfound-glow notfound-glow-two"></div>


        <section className="notfound-content">

          <div className="notfound-code-wrapper">

            <span className="notfound-code">
              404
            </span>

            <div className="notfound-code-shadow">
              404
            </div>

          </div>


          <h1>
            Parece que você saiu da rota.
          </h1>


          <p>
            A página que você tentou acessar não existe,
            foi removida ou está temporariamente indisponível.
          </p>


          <div className="notfound-system">

            <span></span>

            <p>
              ERRO 404 • ROTA NÃO LOCALIZADA
            </p>

            <span></span>

          </div>

        </section>

      </main>


      <Footer />

    </div>

  );

}

export default NotFound;