from langgraph.graph import StateGraph,START
from langgraph.prebuilt import ToolNode,tools_condition
from langgraph.checkpoint.memory import InMemorySaver

from app.agent.nodes import agent_node
from app.agent.state import AgentState
from app.agent.tools import tools


builder = StateGraph(AgentState)

builder.add_node("agent", agent_node)
builder.add_node("tools", ToolNode(tools=tools))

builder.add_edge(START,"agent")

builder.add_conditional_edges("agent",tools_condition)
builder.add_edge("tools","agent")


checkpointer = InMemorySaver()

graph = builder.compile(checkpointer=checkpointer)