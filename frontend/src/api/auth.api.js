import apiClient from "./apiClient";

export const registerUser = async ({
    fullname,
    email,
    username,
    password,
    avatar,
    coverImage,
}) => {
    const formData = new FormData();

    formData.append("fullname", (fullname || "").trim());
    formData.append("email", (email || "").trim().toLowerCase());
    formData.append("username", (username || "").trim().replace(/^@+/, "").toLowerCase());
    formData.append("password", password);

    if (avatar) {
        formData.append("avatar", avatar);
    }

    if (coverImage) {
        formData.append("coverImage", coverImage);
    }

    return apiClient("/users/register", {
        method: "POST",
        body: formData,
    });
};

export const loginUser = async ({ identifier, email, username, password }) => {
    const loginCredential = (identifier || email || username || "").trim();
    return apiClient("/users/login", {
        method: "POST",
        body: JSON.stringify({
            identifier: loginCredential,
            email: loginCredential,
            username: loginCredential,
            password,
        }),
    });
};

export const logoutUser = async () => {
    return apiClient("/users/logout", {
        method: "POST",
    });
};

export const getCurrentUser = async () => {
    return apiClient("/users/current-user", {
        method: "GET",
    });
};

export const refreshAccessToken = async () => {
    return apiClient("/users/refresh-token", {
        method: "POST",
    });
};

export const changeCurrentPassword = async ({
    oldPassword,
    newPassword,
}) => {
    return apiClient("/users/change-password", {
        method: "POST",
        body: JSON.stringify({
            oldPassword,
            newPassword,
        }),
    });
};

export const updateAccountDetails = async ({
    fullname,
    email,
    bio,
}) => {
    return apiClient("/users/update-account", {
        method: "PATCH",
        body: JSON.stringify({
            fullname,
            email,
            bio,
        }),
    });
};

export const updateUserAvatar = async (avatar) => {
    const formData = new FormData();

    formData.append("avatar", avatar);

    return apiClient("/users/avatar", {
        method: "PATCH",
        body: formData,
    });
};

export const updateUserCoverImage = async (coverImage) => {
    const formData = new FormData();

    formData.append("coverImage", coverImage);

    return apiClient("/users/cover-image", {
        method: "PATCH",
        body: formData,
    });
};

export const forgotPassword = async ({ identifier, email, username }) => {
    const cred = (identifier || email || username || "").trim();
    return apiClient("/users/forgot-password", {
        method: "POST",
        body: JSON.stringify({
            identifier: cred,
            email: cred,
            username: cred,
        }),
    });
};

export const resetPassword = async ({
    identifier,
    email,
    username,
    otp,
    newPassword,
}) => {
    const cred = (identifier || email || username || "").trim();
    return apiClient("/users/reset-password", {
        method: "POST",
        body: JSON.stringify({
            identifier: cred,
            email: cred,
            username: cred,
            otp: (otp || "").trim(),
            newPassword,
        }),
    });
};