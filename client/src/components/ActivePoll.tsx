import React from "react";

interface ActivePollProps {
  question: string;
  timeLeft: number;
}

export const ActivePoll: React.FC<ActivePollProps> = ({ question, timeLeft }) => {
  return (
    <div>
      <h2>{question}</h2>
      <p>Time left: {Math.ceil(timeLeft / 1000)} seconds</p>
      <p>Polling is running...</p>
    </div>
  );
};
