function ApprovalCard({ approval, onDecision }) {
  if (!approval) return null;

  return (
    <div className="approval-card">
      <h3>Approval Required</h3>
      <p>{approval.message}</p>
      {approval.details && (
        <div className="approval-details">
          {Object.entries(approval.details).map(([key, value]) => (
            <div key={key} className="approval-detail">
              <strong>{key}:</strong>{" "}
              {typeof value === "string" ? value : JSON.stringify(value)}
            </div>
          ))}
        </div>
      )}

      <div className="approval-action">
        <button className="approve-button" onClick={() => onDecision(true)}>
          Approve
        </button>
        <button className="reject-button" onClick={() => onDecision(false)}>
          Reject
        </button>
      </div>
    </div>
  );
}

export default ApprovalCard;
