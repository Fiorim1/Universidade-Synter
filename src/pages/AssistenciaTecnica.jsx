import { useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/AssistenciaTecnica.css";
import "../styles/AssistenciaHero.css";


function AssistenciaTecnica() {

    // ==========================================
    // ESTADOS
    // ==========================================

    const [profileOpen, setProfileOpen] =
        useState(false);

    const [pesquisa, setPesquisa] =
        useState("");

    const [chamados, setChamados] =
        useState([]);

    const [carregando, setCarregando] =
        useState(false);

    const [mensagem, setMensagem] =
        useState("");

    const [pesquisou, setPesquisou] =
        useState(false);


    // ==========================================
    // BUSCAR CHAMADOS
    // ==========================================

    async function buscarChamados(evento) {

        evento.preventDefault();


        const valorPesquisa =
            pesquisa.trim();


        if (!valorPesquisa) {

            setMensagem(
                "Informe seu CPF, CNPJ ou nome completo."
            );

            setChamados([]);

            setPesquisou(false);

            return;

        }


        try {

            setCarregando(true);

            setMensagem("");

            setChamados([]);

            setPesquisou(true);


            const resposta =
                await fetch(
                    `/api/sat/buscar?q=${encodeURIComponent(
                        valorPesquisa
                    )}`
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.mensagem ||
                    "Não foi possível realizar a consulta."
                );

            }


            if (
                !dados.chamados ||
                dados.chamados.length === 0
            ) {

                setMensagem(
                    "Nenhum chamado foi encontrado com os dados informados."
                );

                return;

            }


            setChamados(
                dados.chamados
            );


        } catch (erro) {

            console.error(
                "Erro ao buscar chamados:",
                erro
            );


            setMensagem(
                "Não foi possível consultar os chamados no momento."
            );


        } finally {

            setCarregando(false);

        }

    }


    // ==========================================
    // FORMATAR DATA
    // ==========================================

    function formatarData(data) {

        if (!data) {

            return "Data não informada";

        }


        const partes =
            data
                .substring(0, 10)
                .split("-");


        if (
            partes.length !== 3
        ) {

            return data;

        }


        return (
            `${partes[2]}/${partes[1]}/${partes[0]}`
        );

    }


    // ==========================================
    // BAIXAR PDF
    // ==========================================

    function baixarPDF(
        notionPageId
    ) {

        const url =
            `/api/sat/pdf?pageId=${encodeURIComponent(
                notionPageId
            )}`;


        window.open(
            url,
            "_blank"
        );

    }


    return (

        <div className="assistencia-page">


            {/* =====================================
          HEADER
      ====================================== */}

            <Header />


            {/* =====================================
    HERO
====================================== */}

            <section className="synter-hero assistencia-synter-hero">
                <div className="synter-hero-container">
                    <div className="synter-hero-actions">
                        <UserProfileButton
                            onClick={() => setProfileOpen(true)}
                        />
                    </div>

                    <div className="synter-hero-kicker">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m12 2 9 5-9 5-9-5 9-5Z" />
                            <path d="M3 7v10l9 5 9-5V7" />
                            <path d="M12 12v10" />
                        </svg>
                        <span>SUPORTE E ATENDIMENTO</span>
                    </div>

                    <h1 className="synter-hero-title">
                        Assistência Técnica
                    </h1>
                    <p className="synter-hero-description">
                        Consulte seus chamados de assistência técnica e suporte Synter.
                    </p>
                </div>
            </section>


            {/* =====================================
          CONTEÚDO
      ====================================== */}

            <main className="assistencia-container">


                {/* CABEÇALHO DA SEÇÃO */}

                <div className="assistencia-heading">


                    <div className="assistencia-heading-line"></div>


                    <div>

                        <span>
                            ASSISTÊNCIA TÉCNICA
                        </span>

                        <h1>
                            Consulte seu chamado
                        </h1>

                        <p>
                            Informe seu CPF, CNPJ ou nome completo
                            para localizar os atendimentos registrados.
                        </p>

                    </div>


                </div>


                {/* =====================================
            PESQUISA
        ====================================== */}

                <form
                    className="assistencia-search"
                    onSubmit={buscarChamados}
                >


                    <div className="assistencia-search-field">

                        <label
                            htmlFor="pesquisaChamado"
                        >
                            CPF, CNPJ ou nome completo
                        </label>


                        <div className="assistencia-search-row">


                            <input

                                id="pesquisaChamado"

                                type="text"

                                value={pesquisa}

                                placeholder="Digite os dados para consulta"

                                autoComplete="off"

                                onChange={(evento) => {

                                    setPesquisa(
                                        evento.target.value
                                    );

                                    setMensagem("");

                                }}

                            />


                            <button
                                type="submit"
                                disabled={carregando}
                            >

                                {
                                    carregando
                                        ? "Buscando..."
                                        : "Buscar chamado"
                                }

                            </button>


                        </div>

                    </div>


                </form>


                {/* =====================================
            CARREGAMENTO
        ====================================== */}

                {carregando && (

                    <div className="assistencia-loading">

                        <div className="assistencia-spinner"></div>

                        <p>
                            Consultando chamados...
                        </p>

                    </div>

                )}


                {/* =====================================
            MENSAGEM
        ====================================== */}

                {
                    !carregando &&
                    mensagem &&
                    (

                        <div className="assistencia-message">

                            <strong>
                                Consulta de chamados
                            </strong>

                            <p>
                                {mensagem}
                            </p>

                        </div>

                    )
                }


                {/* =====================================
            RESULTADOS
        ====================================== */}

                {
                    !carregando &&
                    chamados.length > 0 &&
                    (

                        <section className="assistencia-results">


                            <div className="assistencia-results-header">

                                <div>

                                    <span>
                                        RESULTADO DA CONSULTA
                                    </span>

                                    <h2>
                                        {
                                            chamados.length === 1
                                                ? "1 chamado encontrado"
                                                : `${chamados.length} chamados encontrados`
                                        }
                                    </h2>

                                </div>


                                <div className="assistencia-results-count">

                                    {chamados.length}

                                </div>

                            </div>


                            <div className="assistencia-cards">


                                {
                                    chamados.map(
                                        (chamado) => (

                                            <article
                                                className="assistencia-card"
                                                key={
                                                    chamado.notionPageId
                                                }
                                            >


                                                {/* CARD TOPO */}

                                                <div className="assistencia-card-top">


                                                    <div className="assistencia-card-number">

                                                        <span>
                                                            CHAMADO
                                                        </span>

                                                        <strong>

                                                            #
                                                            {
                                                                chamado.id ||
                                                                "—"
                                                            }

                                                        </strong>

                                                    </div>


                                                    <div className="assistencia-card-status">

                                                        {
                                                            chamado.status ||
                                                            "Status não informado"
                                                        }

                                                    </div>


                                                </div>


                                                {/* CARD CONTEÚDO */}

                                                <div className="assistencia-card-content">


                                                    <div className="assistencia-card-item">

                                                        <span>
                                                            Cliente
                                                        </span>

                                                        <strong>

                                                            {
                                                                chamado.nome ||
                                                                "Não informado"
                                                            }

                                                        </strong>

                                                    </div>


                                                    <div className="assistencia-card-item">

                                                        <span>
                                                            Data do atendimento
                                                        </span>

                                                        <strong>

                                                            {
                                                                formatarData(
                                                                    chamado.dataInicio
                                                                )
                                                            }

                                                        </strong>

                                                    </div>


                                                </div>


                                                {/* DOWNLOAD */}

                                                <div className="assistencia-card-footer">


                                                    <div>

                                                        <span>
                                                            Documento
                                                        </span>

                                                        <p>
                                                            Relatório de Atendimento Técnico
                                                        </p>

                                                    </div>


                                                    <button

                                                        type="button"

                                                        className="assistencia-download-button"

                                                        onClick={() =>
                                                            baixarPDF(
                                                                chamado.notionPageId
                                                            )
                                                        }

                                                    >

                                                        <span>
                                                            ↓
                                                        </span>

                                                        Baixar PDF

                                                    </button>


                                                </div>


                                            </article>

                                        )
                                    )
                                }


                            </div>


                        </section>

                    )
                }


                {/* =====================================
            ESTADO INICIAL
        ====================================== */}

                {
                    !pesquisou &&
                    !carregando &&
                    !mensagem &&
                    chamados.length === 0 &&
                    (

                        <div className="assistencia-empty">


                            <div className="assistencia-empty-icon">

                                ↓

                            </div>


                            <h3>
                                Consulte seus atendimentos
                            </h3>


                            <p>
                                Os chamados encontrados serão exibidos
                                aqui e poderão ser baixados em PDF.
                            </p>


                        </div>

                    )
                }


            </main>


            {/* =====================================
          FOOTER
      ====================================== */}

            <Footer />


            {/* =====================================
          PERFIL
      ====================================== */}

            {
                profileOpen &&
                (

                    <Profile

                        onClose={() =>
                            setProfileOpen(false)
                        }

                    />

                )
            }


        </div>

    );

}


export default AssistenciaTecnica;