import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import CardsDashboard from "../components/CardsDashboard";

import "../styles/TreinamentoComercial.css";

// IMAGENS DOS TREINAMENTOS
import produtosIcon from "../assets/treinamento-icon.png";
import vendasIcon from "../assets/treinamento-icon.png";
import atendimentoIcon from "../assets/treinamento-icon.png";
import comercialIcon from "../assets/treinamento-icon.png";


function TreinamentoComercial() {

    const [profileOpen, setProfileOpen] =
        useState(false);


    return (

        <div className="treinamento-comercial-page">


            {/* ================================= */}
            {/* HEADER                            */}
            {/* ================================= */}

            <Header />


            {/* ================================= */}
            {/* HERO                              */}
            {/* ================================= */}

            <section className="treinamento-comercial-hero">


                {/* PERFIL */}

                <div className="treinamento-comercial-profile">

                    <UserProfileButton
                        onClick={() =>
                            setProfileOpen(true)
                        }
                    />

                </div>


                {/* HERO */}

                <div className="treinamento-comercial-hero-content">

                    <Hero
                        variant="dashboard"
                        one="Universidade Synter"
                        two="Treinamentos Comerciais"
                        three="Acesse conteúdos de capacitação comercial, produtos, vendas e atendimento ao cliente."
                    />

                </div>


            </section>


            {/* ================================= */}
            {/* CONTEÚDO                          */}
            {/* ================================= */}

            <main className="treinamento-comercial-content">


                {/* TÍTULO */}

                <div className="treinamento-comercial-title">

                    <div className="treinamento-comercial-bar"></div>

                    <h4>
                        TREINAMENTOS DISPONÍVEIS
                    </h4>

                </div>


                {/* DESCRIÇÃO */}

                <div className="treinamento-comercial-intro">

                    <h2>
                        Capacitação Comercial
                    </h2>

                    <p>
                        Selecione uma categoria para acessar
                        os treinamentos e materiais disponíveis.
                    </p>

                </div>


                {/* ================================= */}
                {/* CARDS                             */}
                {/* ================================= */}

                <section className="treinamento-comercial-grid">


                    {/* PRODUTOS */}

                    <CardsDashboard
                        image={produtosIcon}
                        title="Treinamento de Produtos"
                        desc="Conheça os produtos, funcionalidades, diferenciais e aplicações das soluções Synter."
                        route="/treinamento-comercial/produtos"
                    />


                    {/* VENDAS */}

                    <CardsDashboard
                        image={vendasIcon}
                        title="Técnicas de Vendas"
                        desc="Conteúdos para aprimorar abordagem comercial, negociação e fechamento de vendas."
                        route="/treinamento-comercial/vendas"
                    />


                    {/* ATENDIMENTO */}

                    <CardsDashboard
                        image={atendimentoIcon}
                        title="Atendimento ao Cliente"
                        desc="Boas práticas para proporcionar um atendimento profissional, consultivo e eficiente."
                        route="/treinamento-comercial/atendimento"
                    />


                    {/* COMERCIAL */}

                    <CardsDashboard
                        image={comercialIcon}
                        title="Argumentação Comercial"
                        desc="Aprenda a apresentar diferenciais, benefícios e soluções de forma estratégica."
                        route="/treinamento-comercial/argumentacao"
                    />


                </section>


            </main>


            {/* ================================= */}
            {/* FOOTER                            */}
            {/* ================================= */}

            <Footer />


            {/* ================================= */}
            {/* MODAL PERFIL                      */}
            {/* ================================= */}

            {profileOpen && (

                <Profile
                    onClose={() =>
                        setProfileOpen(false)
                    }
                />

            )}


        </div>

    );

}


export default TreinamentoComercial;