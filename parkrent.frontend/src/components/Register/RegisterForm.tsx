import { useState, useEffect } from "react";
import { register } from "../../api/auth";
import "./RegisterForm.css";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [Name, setName] = useState("");
    const [Surname, setSurname] = useState("");
    const [Username, setUsername] = useState("");
    const [ConfirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.classList.remove('dark-mode');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (Password !== ConfirmPassword) {
            setError("Hasła nie są zgodne.");
            return;
        }

        try {
            await register(Email, Password, Name, Surname, Username, ConfirmPassword);
            navigate("/login");
        } catch (err: any) {
            const msg = err?.response?.data?.message
                || err?.response?.data
                || "Nie udało się zarejestrować.";
            setError(typeof msg === 'string' ? msg : "Nie udało się zarejestrować.");
        }
    };

    return (
        <div className="register-container">
            <h1 className="register">Rejestracja</h1>
            <form onSubmit={handleSubmit} className="register-form">
                <input required
                    type="text"
                    placeholder="Imię"
                    value={Name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    maxLength={50}
                />
                <input required
                    type="text"
                    placeholder="Nazwisko"
                    value={Surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="input"
                    maxLength={50}
                />
                <input
                    type="text"
                    placeholder="Nazwa użytkownika (opcjonalnie)"
                    value={Username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input"
                    maxLength={30}
                />
                <input required
                    type="email"
                    placeholder="Email"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    maxLength={100}
                />
                <input required
                    type="password"
                    placeholder="Hasło"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    maxLength={100}
                />
                <input required
                    type="password"
                    placeholder="Powtórz hasło"
                    value={ConfirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    maxLength={100}
                />

                {error && <div className="register-error">{error}</div>}

                <button type="submit" className="register-button">
                    Utwórz konto
                </button>

                <p className="info-text">
                    Jeśli jesteś mieszkańcem osiedla, skontaktuj się ze swoim administratorem w celu dodania do osiedla.
                </p>

                <p className="back">
                    <button onClick={() => navigate("/login")} className="back-link">
                    Powrót
                    </button>
                </p>
            </form>
        </div>
    );
}
