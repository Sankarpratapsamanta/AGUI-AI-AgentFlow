from dotenv import load_dotenv
import os
from langchain_core.messages import SystemMessage
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnableConfig
from langchain_core.callbacks.manager import adispatch_custom_event
from app.agent.tools import tools


load_dotenv()


llm = ChatGroq(
    model = os.getenv("GROQ_MODEL"),
    temperature = 0,
    api_key = os.getenv("GROQ_API_KEY"),
)

llm_with_tools = llm.bind_tools(tools)


SYSTEM_PROMPT = """
You are Agentflow AI , a helpful AI assistant.

Available tools:

1.Calculate: Use for calculating mathematical expressions.
2.Greet User: Use for generating a personalized greeting for the user.
3.Create Meeting: Use for creating a demo meeting after human approval.
4.Send Email: Use for sending a demo email after human approval.

Instructions:
- Use the tools when appropriate based on the user's request.
- Do not calculate manually when calculator is appropriate.
- Do not claim a meeting was created or an email was sent without human approval.
- If no tool is needed , answer normally and concisely.
"""

async def agent_node(state,config:RunnableConfig):
    
    messages = [SystemMessage(content=SYSTEM_PROMPT),*state["messages"]]
    
    response = await llm_with_tools.ainvoke(messages,config=config)
    
    if response.tool_calls:
        tool_name = [call["name"] for call in response.tool_calls]
        
        await adispatch_custom_event("agent_action_summary",{
            "message": f"Agent used tools: {', '.join(tool_name)}",
            "tools":tool_name
        },config=config)
        
    else:
        await adispatch_custom_event("agent_action_summary",{
            "message": "I can answer this request without using any tools.",
            "tools":[]
        },config=config)
        
    
    return {
        "messages":[response]
    }
        
