import { useState } from "react";

import Header from "../components/Header";
import Profile from "../components/Profile";
import Hero from "../components/Hero";
import UserProfileButton from "../components/UserProfileButton";
import Footer from "../components/Footer";
import CardsDashboard from "../components/CardsDashboard";

// Ícones
import AppIcon from "../assets/app-icon.png";
import AstIcon from "../assets/ast-icon.png";
import FtIcon from "../assets/Ft-icon.png";

import "../styles/Marketing.css"

function Marketing() {
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <div>

            <Header />

            <section className="dashboard-hero-area">

                <div className="dashboard-profile">
                    <UserProfileButton
                        onClick={() => setProfileOpen(true)}
                    />
                </div>

                <div className="dashboard-hero-content">

                    <Hero
                        variant="dashboard"
                        one="Conteúdos para Divulgação"
                        two="Materiais de Marketing"
                        three="Encontre artes, conteúdos e materiais de apoio para divulgar os produtos Synter e fortalecer suas ações de marketing."
                        showFeatures
                    />

                </div>

            </section>

            <main className="dashboard-content">

                <div className="dashboard-section-title">

                    <div className="dashboard-section-bar"></div>

                    <h4>MATERIAS DE MARKETING</h4>

                </div>


                <div className="cards">

                    <CardsDashboard
                        image={AppIcon}
                        title="Vídeos e Imagens de Fechaduras Digitais"
                        desc="Acesse vídeos, imagens e materiais visuais das fechaduras digitais Synter para divulgação e apoio comercial."
                        enabled={false}
                    />

                    <CardsDashboard
                        image={AppIcon}
                        title="Vídeos e Imagens de Fechaduras Mecânicas"
                        desc="Acesse vídeos, imagens e materiais visuais das fechaduras mecânicas Synter para divulgação e apoio comercial."
                        enabled={false}
                    />

                    <CardsDashboard
                        image={FtIcon}
                        title="Vídeos e Imagens de Fechaduras Ferragens"
                        desc="Acesse vídeos, imagens e materiais visuais das ferragensgi Synter para divulgação e apoio comercial."
                        enabled={false}
                    />

                </div>

            </main>

            <Footer />

            {profileOpen && (
                <Profile
                    onClose={() => setProfileOpen(false)}
                />
            )}

        </div>
    );
}

export default Marketing;