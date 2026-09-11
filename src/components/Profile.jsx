import { useAuth } from "../context/AuthContext"
import { CloseCircle,  ArrowRight4} from 'reicon-react';

import "../styles/Profile.css"


function Profile({ onClose }) {

    const { user, logout } = useAuth()


    const userName =
        user?.user_metadata?.full_name ||
        user?.email ||
        "Usuário"


    // Cria as iniciais do usuário
    const initials = userName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((name) => name[0]?.toUpperCase())
        .join("")


    return (

        <div
            className="profile-overlay"
            onClick={onClose}
        >

            <div
                className="profile-modal"
                onClick={(e) => e.stopPropagation()}
            >


                {/* Botão fechar */}

                <button
                    className="profile-close"
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar perfil"
                >
                    <CloseCircle />
                </button>



                {/* Cabeçalho */}

                <div className="profile-header">

                    <div className="profile-avatar">
                        {initials}
                    </div>


                    <div className="profile-header-text">

                        <span>
                            CONTA
                        </span>

                        <h1>
                            Meu Perfil
                        </h1>

                        <p>
                            Informações da sua conta Synter
                        </p>

                    </div>

                </div>



                {/* Divisor */}

                <div className="profile-line"></div>



                {/* Informações */}

                <div className="profile-info">

                    <div className="profile-info-item">

                        <span className="profile-info-label">
                            Nome
                        </span>

                        <span className="profile-info-value">
                            {userName}
                        </span>

                    </div>


                    <div className="profile-info-item">

                        <span className="profile-info-label">
                            E-mail
                        </span>

                        <span className="profile-info-value">
                            {user?.email}
                        </span>

                    </div>

                </div>



                {/* Logout */}

                <button
                    className="profile-logout"
                    type="button"
                    onClick={logout}
                >

                    <span>
                        Sair da Conta
                    </span>

                    <span className="profile-logout-arrow">
                        <ArrowRight4 />
                    </span>

                </button>

            </div>

        </div>

    )

}


export default Profile