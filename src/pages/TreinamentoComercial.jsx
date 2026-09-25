import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import CardsDashboard from "../components/CardsDashboard";

import ImgIcon from "../assets/img-icon.png";

import "../styles/TreinamentoComercial.css";


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


                {/* CONTEÚDO HERO */}

                <div className="treinamento-comercial-hero-content">

                    <Hero
                        variant="dashboard"
                        one="Universidade Synter"
                        two="Treinamento Comercial"
                        three="Acesse ferramentas e materiais de apoio para treinamentos e atividades comerciais."
                    />

                </div>


            </section>


            {/* ================================= */}
            {/* CONTEÚDO PRINCIPAL                */}
            {/* ================================= */}

            <main className="treinamento-comercial-content">


                {/* ================================= */}
                {/* TÍTULO                            */}
                {/* ================================= */}

                <div className="treinamento-comercial-title">

                    <div className="treinamento-comercial-bar"></div>

                    <h4>
                        FERRAMENTAS COMERCIAIS
                    </h4>

                </div>


                {/* ================================= */}
                {/* INTRODUÇÃO                        */}
                {/* ================================= */}

                <div className="treinamento-comercial-intro">

                    <h2>
                        Ferramentas disponíveis
                    </h2>

                    <p>
                        Utilize as ferramentas disponíveis para
                        auxiliar na preparação de materiais e
                        documentos comerciais.
                    </p>

                </div>


                {/* ================================= */}
                {/* CARD                              */}
                {/* ================================= */}

                <section className="treinamento-comercial-grid">

                    <CardsDashboard
                        image={ImgIcon}
                        title="Converter Imagem em PDF"
                        desc="Transforme uma ou várias imagens em um arquivo PDF de forma rápida e organizada."
                        route="/imagem-para-pdf"
                    />

                </section>


            </main>


            {/* ================================= */}
            {/* FOOTER                            */}
            {/* ================================= */}

            <Footer />


            {/* ================================= */}
            {/* PERFIL                            */}
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