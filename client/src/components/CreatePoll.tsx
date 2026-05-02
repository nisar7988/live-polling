import React from "react";

interface CreatePollProps {
  question: string;
  setQuestion: (val: string) => void;
  startPoll: () => void;
}

export const CreatePoll: React.FC<CreatePollProps> = ({ question, setQuestion, startPoll }) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Enter poll question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ padding: "10px", width: "300px", marginRight: "10px" }}
      />
      <button onClick={startPoll} style={{ padding: "10px 20px" }}>
        Start Poll
      </button>
    </div>
  );
};
