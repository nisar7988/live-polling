import { usePoll } from "./hooks/usePoll";
import CreatePoll from "./components/CreatePoll";
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
    error,
    startPoll,
    resetPoll,
  } = usePoll();

  return (
    <div>
      {!active && results.length === 0 && (
        <CreatePoll
          question={question}
          setQuestion={setQuestion}
          startPoll={startPoll}
          error={error}
        />
      )}

      {active && <ActivePoll question={question} timeLeft={timeLeft} />}

      {!active && results.length > 0 && (
        <PollResults
          totalVotes={totalVotes}
          results={results}
          resetPoll={resetPoll}
        />
      )}
    </div>
  );
}

export default App;
