import { useEffect, useState } from "react";
import "amazon-connect-streams";

const AgentStatePanel = () => {
  const [agent, setAgent] = useState(null);
  const [currentState, setCurrentState] = useState("Loading...");
  const [availableStates, setAvailableStates] = useState([]);

  useEffect(() => {
    connect.agent((agentObj) => {
      setAgent(agentObj);

      // 1️⃣ Get current agent state
      setCurrentState(agentObj.getState().name);

      // 2️⃣ Listen for state changes (like CCP)
      agentObj.onStateChange((stateChange) => {
        setCurrentState(stateChange.newState);
      });

      // 3️⃣ Get all configured agent states
      const states = agentObj.getAgentStates();
      setAvailableStates(states);
    });
  }, []);

  // 4️⃣ Change agent state
  const changeState = (stateName) => {
    if (!agent) return;

    const state = availableStates.find(
      (s) => s.name === stateName
    );

    if (!state) return;

    agent.setState(state, {
      success: () => console.log("✅ State changed to", state.name),
      failure: (err) => console.error("❌ Failed to change state", err)
    });
  };

  return (
    <div style={{ padding: "15px", border: "1px solid #ccc", width: "300px" }}>
      <h3>🧑‍💼 Agent Status</h3>

      <p>
        <strong>Current:</strong>{" "}
        <span style={{ fontWeight: "bold" }}>{currentState}</span>
      </p>

      <select
        value={currentState}
        onChange={(e) => changeState(e.target.value)}
        style={{ width: "100%", padding: "8px" }}
      >
        {availableStates.map((state) => (
          <option key={state.name} value={state.name}>
            {state.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AgentStatePanel;
