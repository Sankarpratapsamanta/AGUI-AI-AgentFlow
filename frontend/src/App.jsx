import { useEffect, useState } from "react";
import "./App.css";
import { agent } from "./lib/agent";
import ChatWindow from "./components/ChatWindow";
import ApprovalCard from "./components/ApprovalCard";
import ToolActivity from "./components/ToolActivity";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState("");
  const [tools, setTools] = useState([]);
  const [customEvent, setCustomEvent] = useState(null);
  const [approval, setApproval] = useState(null);

  useEffect(() => {
    const subscription = agent.subscribe({
      onMessagesChanged: ({ messages }) => {
        setMessages([...messages]);
      },
      onRunStartedEvent() {
        setLoading(true);
        setActivity("Agent is processing your request...");
        setError("");
      },
      onToolCallStartEvent({ event }) {
        setActivity(`Agent is calling tool: ${event.toolName}`);

        setTools((prev) => [
          ...prev,
          {
            id: event.toolCallId,
            name: event.toolCallName,
            status: "Executing",
          },
        ]);
      },

      onToolCallResultEvent({ event }) {
        setActivity(`Tool execution completed.`);

        setTools((prev) =>
          prev.map((tool) => {
            if (tool.id === event.toolCallId) {
              return {
                ...tool,
                status: "Completed",
                result: event.content,
              };
            } else {
              return tool;
            }
          }),
        );
      },

      onTextMessageContentEvent() {
        setActivity("Generating a response...");
      },

      onCustomEvent({ event }) {
        if (event.name === "agent_action_summary") {
          setCustomEvent(event.value);
        }
      },

      onRunFinishedEvent({ event }) {
        setLoading(false);
        setActivity("");

        console.log(event);
        if (event.outcome.type === "interrupt") {
          const interrupt = event.outcome?.interrupts?.[0];
          if (interrupt) {
            const raw = interrupt.metadata?.langgraph?.raw;

            const details = raw?.details ?? raw?.value?.details ?? {};

            setApproval({
              id: interrupt.id,
              message:
                interrupt.message ?? "Please approve or reject the action.",
              details: details,
            });
          } else {
            return;
          }
        }
      },

      onRunErrorEvent({ event }) {
        setLoading(false);
        setActivity("");
        setError(
          event.message ?? "An error occurred while processing your request.",
        );
      },
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function sendMessage(e) {
    e.preventDefault();

    const text = input.trim();

    if (!text || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    agent.messages.push(userMessage);

    setMessages([...agent.messages]);
    setInput("");

    try {
      await agent.runAgent();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprovalDecision(approved) {
    if (!approval) return;

    setApproval(null);
    setLoading(true);
    setActivity(
      approved
        ? "Approval granted. Continuing..."
        : "Approval denied. Stopping...",
    );

    try {
      await agent.runAgent({
        resume: [
          {
            interruptId: approval.id,
            status: "resolved",
            payload: { approved },
          },
        ],
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setActivity("");
    }
  }

  console.log(messages);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>AgentFlow AI</h1>
          <p>AI Agent powered by LangGraph and AG-UI</p>
        </div>

        <span className="connection-status">Agent Client</span>
      </header>

      <main className="dashboard">
        <section className="chat-section">
          <ChatWindow messages={messages} activity={activity} />
          {approval && (
            <ApprovalCard
              approval={approval}
              onDecision={handleApprovalDecision}
            />
          )}
          {error && <div className="error-message">{error}</div>}

          <form className="chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AgentFlow AI something..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </section>

        <aside className="side-panel">
          <div className="panel-card">
            <h2>Custom Event</h2>

            {customEvent ? (
              <>
                <span className="custom-event-name">
                  CUSTOM / agent_action_summary
                </span>
                <p>{customEvent.message}</p>
                {customEvent.tools?.length > 0 && (
                  <p>Selected tools: {customEvent.tools.join(", ")}</p>
                )}

                <pre>{JSON.stringify(customEvent, null, 2)}</pre>
              </>
            ) : (
              <p>No custom event triggered.</p>
            )}
          </div>

          <ToolActivity tools={tools} />
        </aside>
      </main>
    </div>
  );
}

export default App;
