import React, { useState } from "react";

interface CreatePollProps {
  question: string;
  setQuestion: (val: string) => void;
  startPoll: (options: string[]) => void;
}

export const CreatePoll: React.FC<CreatePollProps> = ({ question, setQuestion, startPoll }) => {
  const [options, setOptions] = useState<string[]>(["A", "B", "C"]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleStart = () => {
    // Filter out empty options
    const validOptions = options.map(opt => opt.trim().toUpperCase()).filter(opt => opt !== "");
    
    // Ensure uniqueness
    const uniqueOptions = Array.from(new Set(validOptions));

    if (uniqueOptions.length >= 2) {
      startPoll(uniqueOptions);
    } else {
      alert("Please provide at least 2 unique, non-empty options.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
      <input
        type="text"
        placeholder="Enter poll question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ padding: "10px", width: "100%", boxSizing: "border-box" }}
      />
      
      <div style={{ marginTop: "10px" }}>
        <h3 style={{ marginTop: 0 }}>Options</h3>
        {options.map((option, index) => (
          <div key={index} style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              style={{ padding: "8px", flexGrow: 1, boxSizing: "border-box" }}
            />
            {options.length > 2 && (
              <button onClick={() => removeOption(index)} style={{ padding: "8px" }}>
                X
              </button>
            )}
          </div>
        ))}
        <button onClick={addOption} style={{ padding: "8px", width: "100%", marginTop: "5px" }}>
          + Add Option
        </button>
      </div>

      <button onClick={handleStart} style={{ padding: "10px 20px", marginTop: "10px" }}>
        Start Poll
      </button>
    </div>
  );
};
