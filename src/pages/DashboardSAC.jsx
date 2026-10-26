import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import CardsDashboard from "../components/CardsDashboard";

import ManualIcon from "../assets/manual-icon.png";
import YtIcon from "../assets/Yt-Icon.png";
import TreinamentoIcon from "../assets/treinamento-icon.png";
import TabelaIcon from "../assets/tabela-icon.png";
import FtIcon from "../assets/Ft-icon.png";
import ImgIcon from "../assets/img-icon.png";
import TcIcon from "../assets/tc-icon.png";
import MktIcon from "../assets/mkt-icon.png";
import AppIcon from "../assets/app-icon.png";
import QuestionIcon from "../assets/perguntas-icon.png";
import AstIcon from "../assets/ast-icon.png";
import NvdIcon from "../assets/nvd-icon.png";

import "../styles/Dashboard.css";


function DashboardSAC() {

    const navigate = useNavigate();

    const [profileOpen, setProfileOpen] =
        useState(false);


    return (

        <div className="dashboard-page">

            <Header />


            {/* ================================= */}
            {/* HERO                              */}
            {/* ================================= */}

            <section className="dashboard-hero-area">

                <div className="dashboard-profile">

                    <UserProfileButton
                        onClick={() =>
                            setProfileOpen(true)
                        }
                    />

                </div>


                <div className="dashboard-hero-content">

                    <Hero
                        variant="dashboard"
                        one="Plataforma de Conhecimento"
                        two="Universidade Synter"
                        three="Aqui você encontra tudo sobre nossos produtos, treinamentos e materiais de apoio para o seu dia a dia."
                        showFeatures
                    />

                </div>

            </section>


            {/* ================================= */}
            {/* ACESSO RÁPIDO                     */}
            {/* ================================= */}

            <main className="dashboard-content">

                <div className="dashboard-section-title">

                    <div className="dashboard-section-bar"></div>

                    <h4>
                        ACESSO RÁPIDO
                    </h4>

                </div>


                <div className="cards">


                    {/* ================================= */}
                    {/* APLICATIVO SYNTER                 */}
                    {/* ================================= */}

                    <CardsDashboard
                        image={AppIcon}
                        title="Chamados Técnicos"
                        desc="Ache o chamado técncio do seu cliente"
                        route="/assistencia-tecnica"
                    />

                    <CardsDashboard
                        image={AstIcon}
                        title="Documentos de Visita Técnica"
                        desc="Registre a visita técnica"
                        route="/visitas-tecnicas"
                    />

                </div>

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


export default DashboardSAC;