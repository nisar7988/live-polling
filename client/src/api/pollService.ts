const API_BASE = "http://localhost:3001";

export const startPollAPI = async (question: string, options: string[], duration: number) => {
  const response = await fetch(`${API_BASE}/start-poll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, options, duration }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to start poll");
  }
  return response.json();
};

export const fetchPollStatusAPI = async () => {
  const response = await fetch(`${API_BASE}/poll-status`);
  if (!response.ok) {
    throw new Error("Failed to fetch status");
  }
  return response.json();
};

export const fetchPollResultsAPI = async () => {
  const response = await fetch(`${API_BASE}/poll-result`);
  if (!response.ok) {
    throw new Error("Failed to fetch results");
  }
  return response.json();
};
