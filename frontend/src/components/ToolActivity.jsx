function ToolActivity({ tools }) {
  if (!tools.length) return null;

  return (
    <div className="tool-panel">
      <h3>Tool Activity</h3>

      {tools.map((tool, index) => (
        <div className="tool-item" key={index}>
          <div>
            <strong>{tool.name}</strong>
            <span className={`tool-status ${tool.status}`}>{tool.status}</span>
          </div>

          {tool.args && <pre>{JSON.stringify(tool.args, null, 2)}</pre>}

          {tool.result && <pre>{JSON.stringify(tool.result, null, 2)}</pre>}
        </div>
      ))}
    </div>
  );
}

export default ToolActivity;
