function ChatWindow({ messages, activity }) {

    return (
        <div className="chat-window">
            <div className="messages">
                {messages.map((message,index)=>(
                    <div key={message.id ?? index} className={`message ${message.role}`}>

                        <div className="message-role">
                            {message.role === "user" ? "You" : "AgentFlow AI"}
                        </div>

                        <div className="message-content">
                            {typeof message.content === "string" ? message.content : JSON.stringify(message.content)}
                        </div>
                    </div>
                ))}

            </div>


            {activity && (
                <div className="activity">
                    <span className="acticity-dot"></span>
                    {activity}
                </div>
            )}
        </div>
    )
}


export default ChatWindow;