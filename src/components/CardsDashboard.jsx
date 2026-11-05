import { useNavigate } from "react-router-dom";
import "../styles/CardsDashboard.css";

function CardsDashboard({
  image,
  title,
  desc,
  route,
  enabled = true,
  available = false
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!enabled || !route) return;
    navigate(route);
  };

  return (
    <button
      type="button"
      className={`card-dashboard ${!enabled ? "disabled" : ""}`}
      onClick={handleClick}
      disabled={!enabled}
    >
      {available && (
        <div className="card-dashboard-status">
          <span className="card-dashboard-status-dot"></span>
          <span className="card-dashboard-status-text">
            Disponível
          </span>
        </div>
      )}

      <div className="card-dashboard-left">
        <div className="card-dashboard-icon-box">
          <img
            src={image}
            alt={title}
            className="card-dashboard-icon"
          />
        </div>

        <div className="card-dashboard-texts">
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
      </div>

      <div className="card-dashboard-arrow">
        <span>➜</span>
      </div>
    </button>
  );
}

export default CardsDashboard;