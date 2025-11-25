import { useNavigate } from "react-router-dom";
import "../../public/styles/welcome.css";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <img
          src="/miss_minutes.png"
          alt="Miss Minutes Logo"
          className="welcome-logo"
        />

        <h1 className="welcome-title">Miss Minutes</h1>
        <p className="welcome-tagline">
          Your personal AI-powered writing assistant.
        </p>

        <button className="welcome-button" onClick={() => navigate("/editor")}>
          Start Writing ✨
        </button>
      </div>

      <footer className="welcome-footer">
        Crafted with ❤️ for Chronicle Assignment
      </footer>
    </div>
  );
}
