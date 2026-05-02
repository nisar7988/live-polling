const API_BASE = "http://localhost:3001";

export const startPollAPI = async (question: string) => {
  const response = await fetch(`${API_BASE}/start-poll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, duration: 30000 }),
  });
  if (!response.ok) {
    throw new Error("Failed to start poll");
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
