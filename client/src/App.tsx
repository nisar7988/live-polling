import "./App.css";
import { usePoll } from "./hooks/usePoll";
import { CreatePoll } from "./components/CreatePoll";
import { ActivePoll } from "./components/ActivePoll";
import { PollResults } from "./components/PollResults";

function App() {
  const {
    question,
    setQuestion,
    active,
    timeLeft,
    results,
    totalVotes,
    startPoll,
  } = usePoll();

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>YouTube Live Polling System</h1>
      
      {!active && results.length === 0 && (
        <CreatePoll
          question={question}
          setQuestion={setQuestion}
          startPoll={startPoll}
        />
      )}

      {active && (
        <ActivePoll question={question} timeLeft={timeLeft} />
      )}

      {!active && results.length > 0 && (
        <PollResults totalVotes={totalVotes} results={results} />
      )}
    </div>
  );
}

export default App;
