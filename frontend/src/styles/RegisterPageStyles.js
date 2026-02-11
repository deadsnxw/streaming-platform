export const registerContainer = {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "20px",
};

export const registerStepInfo = {
    marginTop: 0,
    color: "#555",
};

export const registerErrorBox = {
    marginBottom: "12px",
    padding: "8px 12px",
    borderRadius: "4px",
    backgroundColor: "#ffe5e5",
    color: "#a00",
};

export const registerFieldGroup = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
};

export const registerLabel = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
};

export const registerInput = {
    padding: "8px 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
};

export const registerCheckboxLabel = {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
};

export const registerFieldError = {
    color: "#a00",
    fontSize: "13px",
};

export const registerStepActions = (isFirstStep) => ({
    marginTop: "24px",
    display: "flex",
    justifyContent: isFirstStep ? "flex-end" : "space-between",
    gap: "12px",
});

export const registerBackButton = {
    padding: "8px 16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
};

export const registerNextButton = (enabled) => ({
    padding: "8px 16px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: enabled ? "#6441A5" : "#ccc",
    color: "#fff",
    fontWeight: 600,
    cursor: enabled ? "pointer" : "default",
});

export const registerPopularWrapper = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
};

export const registerPopularText = {
    margin: 0,
};

export const registerPopularList = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
};

export const registerPopularItem = (selected) => ({
    padding: "6px 12px",
    borderRadius: "999px",
    border: selected ? "1px solid #6441A5" : "1px solid #ccc",
    backgroundColor: selected ? "#6441A5" : "#fff",
    color: selected ? "#fff" : "#333",
    cursor: "pointer",
    fontSize: "14px",
});

export const registerSkipButton = {
    padding: "8px 16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
};

export const registerChooseButton = {
    padding: "8px 16px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#6441A5",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
};

