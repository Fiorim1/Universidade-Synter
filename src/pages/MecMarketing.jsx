import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import VideoCard from "../components/VideoCard";

import "../styles/DigMarketing.css"

// ===============================
// VÍDEOS
// ===============================

const videoMarketing1 = "https://youtu.be/mc-EJPVmRbQ";
const videoMarketing2 = "";
const videoMarketing3 = "";
const videoMarketing4 = "";
const videoMarketing5 = "";
const videoMarketing6 = "";
const videoMarketing7 = "";
const videoMarketing8 = "";
const videoMarketing9 = "";


// ===============================
// CAPAS
// ===============================

import capaMarketing1 from "../assets/mecmkt1.png";
import capaMarketing2 from "../assets/mecmkt2.png";
import capaMarketing3 from "../assets/capaMarketing3.png";
import capaMarketing4 from "../assets/capaMarketing4.png";
import capaMarketing5 from "../assets/capaMarketing5.png";
import capaMarketing6 from "../assets/capaMarketing6.png";
import capaMarketing7 from "../assets/capaMarketing7.png";
import capaMarketing8 from "../assets/capaMarketing8.png";
import capaMarketing9 from "../assets/capaMarketing9.png";


import "../styles/Videos.css";


function MecMarketing() {

    const [profileOpen, setProfileOpen] = useState(false);

    const [pesquisa, setPesquisa] = useState("");


    // ===============================
    // PESQUISA
    // ===============================

    function mostrarCard(titulo) {

        return titulo
            .toLowerCase()
            .includes(pesquisa.toLowerCase());

    }


    return (

        <div className="videos-page">

            <Header />


            {/* ======================================== */}
            {/* HERO                                     */}
            {/* ======================================== */}

            <section className="videos-hero-area">


                <div className="videos-profile">

                    <UserProfileButton
                        onClick={() => setProfileOpen(true)}
                    />

                </div>


                {profileOpen && (

                    <Profile
                        onClose={() => setProfileOpen(false)}
                    />

                )}


                <div className="videos-hero-content">

                    <Hero
                        variant="dashboard"
                        one="Conteúdos para Divulgação"
                        two="Vídeos de Fechaduras Mecânicas"
                        three="Acesse vídeos das fechaduras mecânicas Synter para divulgação, campanhas e ações de marketing."
                    />

                </div>


            </section>


            {/* ======================================== */}
            {/* CONTEÚDO                                 */}
            {/* ======================================== */}

            <main className="videos-content">


                {/* ======================================== */}
                {/* TÍTULO                                   */}
                {/* ======================================== */}

                <div className="videos-section-title">

                    <div className="videos-section-bar"></div>

                    <h4>
                        VÍDEOS DE FECHADURAS MECÂNICAS
                    </h4>

                </div>


                {/* ======================================== */}
                {/* PESQUISA                                 */}
                {/* ======================================== */}

                <div className="pesquisa-videos">

                    <input
                        type="text"
                        placeholder="Pesquisar vídeo..."
                        value={pesquisa}
                        onChange={(evento) =>
                            setPesquisa(evento.target.value)
                        }
                    />

                </div>


                {/* ======================================== */}
                {/* CARDS                                    */}
                {/* ======================================== */}

                <div className="videos-grid">


                    {/* VIDEO 01 */}

                    {mostrarCard("Fechadura Mecânica - Acqua Max Escovada") && (

                        <VideoCard
                            titulo="Fechadura Digital - Acqua Max Escovada"
                            descricao="Conheça os recursos e diferenciais das fechaduras mecânicas Synter."
                            video={videoMarketing1}
                            capa={capaMarketing1}
                        />

                    )}


                    {/* VIDEO 02 */}

                    {mostrarCard("Fechadura Digital - Crispus Max") && (

                        <VideoCard
                            titulo="Fechadura Digital - Crispus Max"
                            descricao="Material audiovisual para divulgação das fechaduras mecânicas Synter."
                            video={videoMarketing2}
                            capa={capaMarketing2}
                        />

                    )}


                    {/* VIDEO 03 */}

                    {mostrarCard("Fechadura Digital - Syrius S3 Max") && (

                        <VideoCard
                            titulo="Fechadura Digital - Syrius S3 Max"
                            descricao="Apresente os principais benefícios das fechaduras digitais Synter."
                            video={videoMarketing3}
                            capa={capaMarketing3}
                        />

                    )}


                    {/* VIDEO 04 */}

                    {mostrarCard("Fechadura Digital - Venus S3 Pro") && (

                        <VideoCard
                            titulo="Fechadura Digital - Venus S3 Pro"
                            descricao="Conteúdo desenvolvido para divulgação comercial dos produtos Synter."
                            video={videoMarketing4}
                            capa={capaMarketing4}
                        />

                    )}


                    {/* VIDEO 05 */}

                    {mostrarCard("Fechadura Digital - Vega Face Id") && (

                        <VideoCard
                            titulo="Fechadura Digital - Vega Face Id"
                            descricao="Vídeo promocional para apresentação das fechaduras digitais Synter."
                            video={videoMarketing5}
                            capa={capaMarketing5}
                        />

                    )}


                    {/* VIDEO 06 */}

                    {mostrarCard("Fechadura Digital - Syrius S3 Pro") && (

                        <VideoCard
                            titulo="Fechadura Digital - Syrius S3 Pro"
                            descricao="Material visual para campanhas e divulgação das fechaduras Synter."
                            video={videoMarketing6}
                            capa={capaMarketing6}
                        />

                    )}


                    {/* VIDEO 07 */}

                    {mostrarCard("Fechadura Digital - Syrius S2 Pro Neo") && (

                        <VideoCard
                            titulo="Fechadura Digital - Syrius S2 Pro Neo"
                            descricao="Conheça detalhes e funcionalidades das fechaduras digitais Synter."
                            video={videoMarketing7}
                            capa={capaMarketing7}
                        />

                    )}


                    {/* VIDEO 08 */}

                    {mostrarCard("Fechadura Digital - Lyra Pro") && (

                        <VideoCard
                            titulo="Fechadura Digital - Lyra Pro"
                            descricao="Conteúdo para apoiar ações comerciais e de marketing."
                            video={videoMarketing8}
                            capa={capaMarketing8}
                        />

                    )}


                    {/* VIDEO 09 */}

                    {mostrarCard("Fechadura Digital - Eris Face Id") && (

                        <VideoCard
                            titulo="Fechadura Digital - Eris Face Id"
                            descricao="Vídeo desenvolvido para apresentação dos produtos Synter."
                            video={videoMarketing9}
                            capa={capaMarketing9}
                        />

                    )}


                    {/* ======================================== */}
                    {/* NENHUM RESULTADO                         */}
                    {/* ======================================== */}

                    {pesquisa !== "" &&

                        ![
                            "Fechadura Digital - Vídeo 01",
                            "Fechadura Digital - Vídeo 02",
                            "Fechadura Digital - Vídeo 03",
                            "Fechadura Digital - Vídeo 04",
                            "Fechadura Digital - Vídeo 05",
                            "Fechadura Digital - Vídeo 06",
                            "Fechadura Digital - Vídeo 07",
                            "Fechadura Digital - Vídeo 08",
                            "Fechadura Digital - Vídeo 09",
                            "Fechadura Digital - Vídeo 10"

                        ].some(mostrarCard) && (

                            <p className="nenhum-video">
                                Nenhum vídeo encontrado.
                            </p>

                        )

                    }


                </div>

            </main>


            <Footer />

        </div>

    );

}

export default MecMarketing;