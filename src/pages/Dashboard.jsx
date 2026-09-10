import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Header from "../components/Header"
import Hero from "../components/Hero"
import Footer from "../components/Footer"

import UserProfileButton from "../components/UserProfileButton"
import Profile from "../components/Profile"
import CardsDashboard from "../components/CardsDashboard"

import ManualIcon from "../assets/manual-icon.png"
import YtIcon from "../assets/yt-icon.png"
import TreinamentoIcon from "../assets/treinamento-icon.png"
import TabelaIcon from "../assets/tabela-icon.png"
import FtIcon from "../assets/Ft-icon.png"
import ImgIcon from "../assets/img-icon.png"
import TcIcon from "../assets/tc-icon.png"
import MktIcon from "../assets/mkt-icon.png"
import AppIcon from "../assets/app-icon.png"
import QuestionIcon from "../assets/perguntas-icon.png"
import AstIcon from "../assets/ast-icon.png"
import NvdIcon from "../assets/nvd-icon.png"

import "../styles/Dashboard.css"

function Dashboard() {

        const navigate = useNavigate()

    // Controla se o modal está aberto
    const [profileOpen, setProfileOpen] = useState(false)


    return (

        <div>

            <Header />


            <div className="dashboard-profile">

                <UserProfileButton
                    onClick={() => setProfileOpen(true)}
                />

            </div>


            <Hero />

            <div className="cards">
                <div className="cards-parts-1">
                    <CardsDashboard
                        image={ManualIcon}
                        title="Manual de Produtos"
                        desc="Acesse os manuais dos nossos produtos"
                        onClick={() => navigate("/manuals")} />
                    <CardsDashboard
                        image={YtIcon}
                        title="Vídeos de Instalação"
                        desc="Acesse nossos vídeos de instalação" />
                        <CardsDashboard
                        image={TreinamentoIcon}
                        title="Treinamentos Técnicos"
                        desc="Acesse nossos treinamentos técnicos" />
                        <CardsDashboard
                        image={TabelaIcon}
                        title="Tabela de Preços"
                        desc="Acesse nossa tabela de preços" />
                </div>
                <div className="cards-parts-2">
                    <CardsDashboard
                        image={FtIcon}
                        title="Fichas Técnicas"
                        desc="Acesse as fichas técnicas dos nossos produtos" />
                    <CardsDashboard
                        image={ImgIcon}
                        title="Imagens de Produtos"
                        desc="Acesse as imagens dos nossos produtos" />
                        <CardsDashboard
                        image={TcIcon}
                        title="Treinamento Comercial"
                        desc="Acesse nosso treinamento comercial" />
                        <CardsDashboard
                        image={MktIcon}
                        title="Materiais de Marketing"
                        desc="Acesse nossos materias de marketing" />
                </div>
                <div className="cards-parts-3">
                    <CardsDashboard
                        image={AppIcon}
                        title="Aplicativo Synter"
                        desc="Desbrave mais sobre o aplicativo Synter" />
                    <CardsDashboard
                        image={QuestionIcon}
                        title="Perguntas Frequentes"
                        desc="Caso tenha uma pergunta acesse aqui" />
                        <CardsDashboard
                        image={AstIcon}
                        title="Assistência Técnica"
                        desc="Caso você realizou uma assistência técnica, pegue seu documento aqui" />
                        <CardsDashboard
                        image={NvdIcon}
                        title="Novidades Synter"
                        desc="Quer receber as novidades dos nossos produtos e empresas? Clique aqui" />
                </div>
            </div>


            <Footer />


            {/* Só mostra o perfil quando profileOpen for true */}
            {profileOpen && (

                <Profile
                    onClose={() => setProfileOpen(false)}
                />

            )}



        </div>

    )

}

export default Dashboard