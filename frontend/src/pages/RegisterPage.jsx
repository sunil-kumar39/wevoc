import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function RegisterPage({ onLogin }) {

    const { register } = useApp();

    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        // Required text fields
        if (
            !fullname.trim() ||
            !email.trim() ||
            !username.trim() ||
            !password
        ) {
            setError(
                "Full name, email, username and password are required"
            );
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            await register({
                fullname: fullname.trim(),
                email: email.trim(),
                username: username.trim().replace(/^@+/, ""),
                password,
                avatar,
                coverImage,
            });

            setSuccess(
                "Account created successfully!"
            );

            // Clear form
            setFullname("");
            setEmail("");
            setUsername("");
            setPassword("");
            setAvatar(null);
            setCoverImage(null);
            setShowPassword(false);


        } catch (error) {

            setError(
                error.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="auth-page">

            <div className="auth-card">


                {/* Header */}

                <div className="auth-header">

                    <h1>
                        Create account
                    </h1>

                    <p>
                        Join the WeVoc community
                    </p>

                </div>


                <form onSubmit={handleSubmit}>


                    {/* Error */}

                    {error && (

                        <div className="auth-error">
                            {error}
                        </div>

                    )}


                    {/* Success */}

                    {success && (

                        <div className="auth-success">
                            {success}
                        </div>

                    )}


                    {/* Full name */}

                    <div className="form-group">

                        <label>
                            Full name
                        </label>

                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={fullname}
                            onChange={(e) =>
                                setFullname(
                                    e.target.value
                                )
                            }
                            autoComplete="name"
                        />

                    </div>


                    {/* Email */}

                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            autoComplete="email"
                        />

                    </div>


                    {/* Username */}

                    <div className="form-group">

                        <label>
                            Username
                        </label>

                        <input
                            type="text"
                            placeholder="Choose a username (e.g. alex99)"
                            value={username}
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            autoComplete="username"
                        />

                    </div>


                    {/* Password */}

                    <div className="form-group">

                        <label>
                            Password
                        </label>


                        <div
                            style={{
                                position: "relative",
                            }}
                        >

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                autoComplete="new-password"
                                style={{
                                    width: "100%",
                                    paddingRight: "48px",
                                }}
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) =>
                                            !prev
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                style={{
                                    position:
                                        "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform:
                                        "translateY(-50%)",
                                    border: "none",
                                    background:
                                        "transparent",
                                    cursor:
                                        "pointer",
                                    fontSize: "18px",
                                    padding: "4px",
                                    color:
                                        "var(--ink3)",
                                }}
                            >

                                {showPassword
                                    ? "🙈"
                                    : "👁️"}

                            </button>

                        </div>

                    </div>


                    {/* Avatar */}

                    <div className="form-group">

                        <label>
                            Avatar
                            <span
                                style={{
                                    marginLeft: 6,
                                    color:
                                        "var(--ink4)",
                                    fontSize: 12,
                                    fontWeight: 400,
                                }}
                            >
                                (optional)
                            </span>
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setAvatar(
                                    e.target.files?.[0] ||
                                    null
                                )
                            }
                        />

                    </div>


                    {/* Cover image */}

                    <div className="form-group">

                        <label>
                            Cover image
                            <span
                                style={{
                                    marginLeft: 6,
                                    color:
                                        "var(--ink4)",
                                    fontSize: 12,
                                    fontWeight: 400,
                                }}
                            >
                                (optional)
                            </span>
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setCoverImage(
                                    e.target.files?.[0] ||
                                    null
                                )
                            }
                        />

                    </div>


                    {/* Create account */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating account..."
                            : "Create account"}

                    </button>

                </form>


                {/* Login */}

                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        className="auth-link"
                        onClick={onLogin}
                    >
                        Login
                    </button>

                </div>


            </div>

        </div>

    );
}