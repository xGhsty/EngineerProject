import { useState, useEffect } from "react";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";


export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Wymuszaj light mode na stronie logowania
    useEffect(() => {
        document.documentElement.classList.remove('dark-mode');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const data = await login(email, password);

            if (typeof data === "object" && data !== null && "token" in data && typeof (data as any).token === "string") {
                localStorage.setItem("token", (data as any).token);
                localStorage.setItem("role", (data as any).role);
                navigate("/dashboard");
            } else {
                throw new Error("Nieprawidłowa odpowiedź serwera");
            }
        } catch (error: any) {
            let errorMessage = "Nie udało się zalogować";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.title) {
                errorMessage = error.response.data.title;
            } else if (error.response?.status === 401) {
                errorMessage = "Nieprawidłowy email lub hasło";
            } else if (error.response?.status === 400) {
                errorMessage = "Nieprawidłowe dane logowania";
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
        }
    };

    return (
        <div className="login-container">
            <h1 className="logo">ParkRent</h1>
            <h2 className="title">Zaloguj się</h2>

            <form onSubmit={handleSubmit} className="login-form">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    required
                />
                <input
                    type="password"
                    placeholder="Hasło"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    required
                />
                <button type="submit" className="login-button">
                    Zaloguj się
                </button>
            </form>

            <p className="reset-password">Zresetuj hasło</p>

            <p className="register-text">
                Nie masz konta?{" "}
                <button onClick={() => navigate("/register")} className="register-link">
                    Zarejestruj się!
                </button>
            </p>
        </div>
    );
}
