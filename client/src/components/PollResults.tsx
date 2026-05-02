import React from "react";
import type { PollResult } from "../hooks/usePoll";

interface PollResultsProps {
  totalVotes: number;
  results: PollResult[];
}

export const PollResults: React.FC<PollResultsProps> = ({ totalVotes, results }) => {
  return (
    <div>
      <h2>Poll Results</h2>
      <p>Total Votes: {totalVotes}</p>
      {results.map((result) => (
        <div key={result.option} style={{ margin: "10px 0" }}>
          <strong>{result.option}:</strong> {result.votes} votes (
          {result.percentage}%)
        </div>
      ))}
    </div>
  );
};
