import { useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Profile from "../components/Profile";
import UserProfileButton from "../components/UserProfileButton";
import VideoCard from "../components/VideoCard";

import "./DigMarketing.css";


function DigMarketing() {

    const [profileOpen, setProfileOpen] = useState(false);
    const [pesquisa, setPesquisa] = useState("");


    const videos = [

        {
            id: 1,
            titulo: "Fechadura Digital - Vídeo 01",
            descricao: "Material em vídeo para divulgação da fechadura digital Synter.",
            video: "/videos/marketing/video-01.mp4",
            capa: "/capas/marketing/capa-01.png"
        },

        {
            id: 2,
            titulo: "Fechadura Digital - Vídeo 02",
            descricao: "Material em vídeo para divulgação da fechadura digital Synter.",
            video: "/videos/marketing/video-02.mp4",
            capa: "/capas/marketing/capa-02.png"
        },

        {
            id: 3,
            titulo: "Fechadura Digital - Vídeo 03",
            descricao: "Material em vídeo para divulgação da fechadura digital Synter.",
            video: "/videos/marketing/video-03.mp4",
            capa: "/capas/marketing/capa-03.png"
        },

        {
            id: 4,
            titulo: "Fechadura Digital - Vídeo 04",
            descricao: "Material em vídeo para divulgação da fechadura digital Synter.",
            video: "/videos/marketing/video-04.mp4",
            capa: "/capas/marketing/capa-04.png"
        },

        {
            id: 5,
            titulo: "Fechadura Digital - Vídeo 05",
            descricao: "Material em vídeo para divulgação da fechadura digital Synter.",
            video: "/videos/marketing/video-05.mp4",
            capa: "/capas/marketing/capa-05.png"
        },

        {
            id: 6,
            titulo: "Fechadura Digital - Vídeo 06",
            descricao: "Material em vídeo para divulgação da fechadura digital Synter.",
            video: "/videos/marketing/video-06.mp4",
            capa: "/capas/marketing/capa-06.png"
        },

        {
            id: 7,
            titulo: "Fechadura Digital - Vídeo 07",
            descricao: "Material em vídeo para divulgação da fechadura digital Synter.",
            video: "/videos/marketing/video-07.mp4",
            capa: "/capas/marketing/capa-07.png"
        },

        {
            id: 8,
            titulo: "Fechadura Digital - Vídeo 08",
            descricao: "Material em vídeo para divulgação da fechadura digital Synter.",
            video: "/videos/marketing/video-08.mp4",
            capa: "/capas/marketing/capa-08.png"
        },

        {
            id: 9,
            titulo: "Fechadura Digital - Vídeo 09",
            descricao: "Material em vídeo para divulgação da fechadura digital Synter.",
            video: "/videos/marketing/video-09.mp4",
            capa: "/capas/marketing/capa-09.png"
        },

        {
            id: 10,
            titulo: "Fechadura Digital - Vídeo 10",
            descricao: "Material em vídeo para divulgação da fechadura digital Synter.",
            video: "/videos/marketing/video-10.mp4",
            capa: "/capas/marketing/capa-10.png"
        }

    ];


    const videosFiltrados = videos.filter((item) =>
        item.titulo
            .toLowerCase()
            .includes(pesquisa.toLowerCase())
    );


    return (

        <div className="dig-marketing-page">

            <Header />


            {/* ======================================== */}
            {/* PERFIL                                   */}
            {/* ======================================== */}

            <div className="dig-marketing-profile">

                <UserProfileButton
                    onClick={() => setProfileOpen(true)}
                />

            </div>


            {/* ======================================== */}
            {/* CONTEÚDO                                 */}
            {/* ======================================== */}

            <main className="dig-marketing-container">


                {/* ======================================== */}
                {/* TÍTULO                                   */}
                {/* ======================================== */}

                <div className="dig-marketing-title">

                    <div className="dig-marketing-title-bar"></div>

                    <h4>
                        VÍDEOS DE MARKETING
                    </h4>

                </div>


                {/* ======================================== */}
                {/* PESQUISA                                 */}
                {/* ======================================== */}

                <div className="dig-marketing-search">

                    <input
                        type="text"
                        placeholder="Pesquisar vídeo..."
                        value={pesquisa}
                        onChange={(e) =>
                            setPesquisa(e.target.value)
                        }
                    />

                </div>


                {/* ======================================== */}
                {/* CARDS                                    */}
                {/* ======================================== */}

                <div className="dig-marketing-grid">

                    {videosFiltrados.map((item) => (

                        <VideoCard
                            key={item.id}
                            titulo={item.titulo}
                            descricao={item.descricao}
                            video={item.video}
                            capa={item.capa}
                        />

                    ))}

                </div>


                {/* ======================================== */}
                {/* SEM RESULTADOS                           */}
                {/* ======================================== */}

                {videosFiltrados.length === 0 && (

                    <div className="dig-marketing-empty">

                        <h3>Nenhum vídeo encontrado</h3>

                        <p>
                            Tente pesquisar utilizando outro nome.
                        </p>

                    </div>

                )}

            </main>


            <Footer />


            {/* ======================================== */}
            {/* PERFIL                                   */}
            {/* ======================================== */}

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

export default DigMarketing;