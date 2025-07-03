import { useState } from "react";
import { register } from "../../api/auth";
import "./RegisterForm.css";
import { useNavigate } from "react-router-dom";

export default function RegisterForm({ onBackClick }: { onBackClick?: () => void }) {
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [Name, setUsername] = useState("");
    const [Surname, setSurname] = useState("");
    const [ConfirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await register(Email, Password, Name, Surname, ConfirmPassword);
            navigate("/login");
            alert("Zarejestrowano!");
        } catch (error) {
            alert("Nie udało się zarejestrować: ");
        }
    };

    return (
        <div className="register-container">
            <h1 className="register">Rejestracja</h1>
            <form onSubmit={handleSubmit} className="register-form">
                <input required
                    type="Imie"
                    placeholder="Imię"
                    value={Name}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input"
                />
                <input required
                    type="Nazwisko"
                    placeholder="Nazwisko"
                    value={Surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="input"
                />
                <input required
                    type="email"
                    placeholder="Email"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                />
                <input required
                    type="password"
                    placeholder="Hasło"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                />
                <input required
                    type="password"
                    placeholder="Powtórz hasło"
                    value={ConfirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                />
                <button type="submit" className = "register-button">
                    Utwórz konto
                </button>

                <p className = "info-text">
                    Po rejestracji, na podany adres email zostanie wyslany link aktywacyjny.
                </p>

                <p className = "back">
                    <button onClick={() => navigate("/login") } className="back-link">
                    Powrót
                    </button>
                </p>        
            </form>
        </div>

    );
}