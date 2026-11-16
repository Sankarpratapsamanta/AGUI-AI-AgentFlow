from langchain_core.tools import tool
from simpleeval import simple_eval
from langgraph.types import interrupt


@tool
def calculate(expression: str) -> str:
    """ 
    Use this tool whenever the user asks to calculate,solve a mathemetical expression, find percentages or perform arthimatic operations.
    """
    try:
        result = simple_eval(expression)
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"
    
@tool
def greet_user(name:str):
    """Generate a personalized greeting for the user."""
    return f"Hello, {name}! How can I assist you today?"

@tool
def create_meeeting(attendee:str,date:str,time:str,purpose:str):
    """
    Create a meeting using the following required details:
    - attendee: Name of the person attending the meeting.
    - date: Meeting date.
    - time: Meeting time.
    - purpose: Reason for the meeting.
    
    Requires human approval before creating the meeting.This is for an demo purpose only no additional information required for this.
    """
    approval = interrupt({
        "type":"meeting_approval",
        "message":f"Do you approve the meeting with {attendee} on {date} at {time} for {purpose}?",
        "details": {
            "attendee": attendee,
            "date": date,
            "time": time,
            "purpose": purpose
        }
        
    })
    
    # if not approval is True:
        # return "Meeting creation was not approved."
    return f"Meeting with {attendee} on {date} at {time} for {purpose} has been created successfully."

@tool
def send_email(recipient:str,subject:str,body:str):
    """Send a demo email after human approval."""
    approval = interrupt({
        "type":"email_approval",
        "message":f"Do you approve sending an email to {recipient} with subject '{subject}'?",
        "details": {
            "recipient": recipient,
            "subject": subject,
            "body": body
        }
        
    })
    
    # if not approval is True or isinstance(approval, dict) and approval.get("approved") is True:
    #     return "Email sending was not approved."
    return f"Email to {recipient} with subject '{subject}' has been sent successfully."



tools = [calculate, greet_user, create_meeeting, send_email]
    
    