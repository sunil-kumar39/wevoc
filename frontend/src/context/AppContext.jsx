import { createContext, useContext, useEffect, useState } from "react";

import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
} from "../api/auth.api";


const Ctx = createContext(null);


export function AppProvider({ children }) {

    // -------------------------
    // Navigation state
    // -------------------------

    const [page, setPage] = useState("feed");
    const [pageData, setPageData] = useState(null);
    const [stack, setStack] = useState([]);


    // -------------------------
    // UI state
    // -------------------------

    const [bookmarks, setBookmarks] = useState(["p1", "p3"]);
    const [theme, setTheme] = useState("light");
    const [searchQuery, setSearchQuery] = useState("");


    // -------------------------
    // Authentication state
    // -------------------------

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);


    // -------------------------
    // Check logged-in user
    // -------------------------

    useEffect(() => {
        const checkCurrentUser = async () => {
            try {
                const response = await getCurrentUser();
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem("accessToken");
                setUser(null);
            } finally {
                setAuthLoading(false);
            }
        };

        checkCurrentUser();
    }, []);


    // -------------------------
    // Login
    // -------------------------

    const login = async ({ identifier, email, username, password }) => {
        const response = await loginUser({
            identifier: identifier || email || username,
            email: identifier || email || username,
            username: identifier || email || username,
            password,
        });

        if (response?.data?.accessToken) {
            localStorage.setItem("accessToken", response.data.accessToken);
        }

        if (response?.data?.user) {
            setUser(response.data.user);
        }

        return response;
    };


    // -------------------------
    // Register
    // -------------------------

    const register = async ({
        fullname,
        email,
        username,
        password,
        avatar,
        coverImage,
    }) => {
        const response = await registerUser({
            fullname,
            email,
            username,
            password,
            avatar,
            coverImage,
        });

        if (response?.data?.accessToken) {
            localStorage.setItem("accessToken", response.data.accessToken);
        }

        if (response?.data?.user) {
            setUser(response.data.user);
        }

        return response;
    };


    // -------------------------
    // Logout
    // -------------------------

    const logout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem("accessToken");
            setUser(null);
            setPage("feed");
            setPageData(null);
            setStack([]);
        }
    };


    // -------------------------
    // Navigation
    // -------------------------

    const navigate = (nextPage, data = null) => {

        setStack((s) => [
            ...s,
            {
                page,
                data: pageData,
            },
        ]);

        setPage(nextPage);
        setPageData(data);
    };


    const goBack = () => {

        if (!stack.length) return;

        const prev = stack[stack.length - 1];

        setStack((s) => s.slice(0, -1));

        setPage(prev.page);
        setPageData(prev.data);
    };


    const navTo = (pg) => {

        setStack([]);
        setPage(pg);
        setPageData(null);
    };


    // -------------------------
    // Bookmarks
    // -------------------------

    const toggleBookmark = (id) => {

        setBookmarks((b) =>
            b.includes(id)
                ? b.filter((x) => x !== id)
                : [...b, id]
        );
    };


    // -------------------------
    // Theme
    // -------------------------

    const toggleTheme = () => {

        setTheme((t) =>
            t === "light" ? "dark" : "light"
        );
    };


    return (
        <Ctx.Provider
            value={{
                // Navigation
                page,
                pageData,
                navigate,
                goBack,
                navTo,

                // UI
                bookmarks,
                toggleBookmark,
                theme,
                toggleTheme,
                searchQuery,
                setSearchQuery,

                // Authentication
                user,
                setUser,
                authLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </Ctx.Provider>
    );
}


export const useApp = () => useContext(Ctx);