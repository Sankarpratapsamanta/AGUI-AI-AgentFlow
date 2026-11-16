from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ag_ui_langgraph import LangGraphAgent,add_langgraph_fastapi_endpoint


from app.agent.graph import graph

app=FastAPI(
    title="AgentFlow AI",
)

app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_methods=["*"],allow_headers=["*"],allow_credentials=True)

agui_agent = LangGraphAgent(name="AgentFlow AI", graph=graph,enable_legacy_on_interrupt_event=False,emit_interrupt_outcome=True)


add_langgraph_fastapi_endpoint(app,agui_agent,"/agent")