import { useAuth } from "../context/AuthContext"

import "../styles/UserProfileButton.css"


function UserProfileButton({ onClick }) {

    const { user } = useAuth()

    const userName =
        user?.user_metadata?.full_name ||
        user?.email ||
        "Usuário"


    // Pega as iniciais do nome
    const initials = userName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((name) => name[0]?.toUpperCase())
        .join("")


    return (

        <button
            className="user-profile-button"
            type="button"
            onClick={onClick}
        >

            {/* Avatar */}
            <span className="user-profile-avatar">
                {initials}
            </span>


            {/* Nome */}
            <span className="user-profile-name">
                {userName}
            </span>


            {/* Seta */}
            <span className="user-profile-arrow">
               ⌄
            </span>

        </button>

    )

}


export default UserProfileButton