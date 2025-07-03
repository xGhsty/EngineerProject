import { useState } from "react";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";


export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            if (typeof data === "object" && data !== null && "token" in data && typeof (data as any).token === "string") {
                localStorage.setItem("token", (data as any).token);
                alert("Zalogowano!");
                navigate("/dashboard");
            } else {
                throw new Error("Invalid login response");
            }
        } catch (error) {
            alert("Nie udało się zalogować");
        }
    };

    return (
        <div className="login-container">
            <h1 className="logo">ParkRent</h1>
            <h2 className="title">Zaloguj się</h2>

            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                />
                <input
                    type="password"
                    placeholder="Hasło"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
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
