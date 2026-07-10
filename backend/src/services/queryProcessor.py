import sys
import json
import urllib.request
import urllib.error

def query_gemini(key, history, company_context, model="gemini-2.5-flash"):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    
    # Map roles: 'user' -> 'user', 'assistant' -> 'model'
    contents = []
    for msg in history:
        role = "user" if msg.get("role") == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg.get("content", "")}]
        })
    
    # Construct a helpful system instruction that removes domain restrictions
    # while still providing company context in case the user asks business questions.
    system_prompt = (
        "You are a helpful, unrestricted AI assistant. You can answer any general knowledge, "
        "technical, or creative questions. You also have access to the following company context "
        "if needed for corporate OS queries:\n"
        f"{company_context}\n\n"
        "Respond fully, accurately, and directly. Do not pretend to be restricted to business "
        "tasks or corporate roles when answering general queries."
    )
    
    payload = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": contents
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            candidates = res_data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
            return ""
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode("utf-8")
            sys.stderr.write(f"Gemini API HTTP Error {e.code} for model {model}: {e.reason}\nBody: {err_body}\n")
        except Exception:
            sys.stderr.write(f"Gemini API HTTP Error {e.code} for model {model}: {e.reason}\n")
        
        # If rate-limited/out-of-quota (429) on gemini-2.5-flash, fall back to gemini-flash-latest
        if e.code == 429 and model == "gemini-2.5-flash":
            sys.stderr.write("Falling back to gemini-flash-latest due to rate limit/quota issue.\n")
            return query_gemini(key, history, company_context, model="gemini-flash-latest")
            
        return ""
    except Exception as e:
        sys.stderr.write(f"Gemini API request failed: {str(e)}\n")
        return ""

def query_openrouter(key, history, company_context):
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    system_prompt = (
        "You are a helpful, unrestricted AI assistant. You can answer any general knowledge, "
        "technical, or creative questions. You also have access to the following company context "
        "if needed for corporate OS queries:\n"
        f"{company_context}\n\n"
        "Respond fully, accurately, and directly. Do not pretend to be restricted to business "
        "tasks or corporate roles when answering general queries."
    )
    
    messages = [{"role": "system", "content": system_prompt}] + history
    
    payload = {
        "model": "google/gemini-2.5-flash",
        "messages": messages
    }
    
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://visuark.os",
        "X-Title": "Visuark OS"
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            choices = res_data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "")
            return ""
    except Exception as e:
        sys.stderr.write(f"OpenRouter API request failed: {str(e)}\n")
        return ""

def query_openai(key, history, company_context):
    url = "https://api.openai.com/v1/chat/completions"
    
    system_prompt = (
        "You are a helpful, unrestricted AI assistant. You can answer any general knowledge, "
        "technical, or creative questions. You also have access to the following company context "
        "if needed for corporate OS queries:\n"
        f"{company_context}\n\n"
        "Respond fully, accurately, and directly. Do not pretend to be restricted to business "
        "tasks or corporate roles when answering general queries."
    )
    
    messages = [{"role": "system", "content": system_prompt}] + history
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": messages
    }
    
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            choices = res_data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "")
            return ""
    except Exception as e:
        sys.stderr.write(f"OpenAI API request failed: {str(e)}\n")
        return ""

def search_tavily(api_key, query):
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "basic",
        "include_answer": False,
        "include_raw_content": False,
        "max_results": 5
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            results = res_data.get("results", [])
            search_text = "\n=== WEB RESEARCH RESULTS ===\n"
            for r in results:
                search_text += f"- **{r.get('title')}** (Source: {r.get('url')}):\n  {r.get('content')}\n\n"
            return search_text
    except Exception as e:
        sys.stderr.write(f"Tavily search failed: {str(e)}\n")
        return ""

def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except Exception as e:
        sys.stderr.write(f"Invalid JSON input: {str(e)}\n")
        sys.exit(1)
        
    open_router_key = input_data.get("openRouterKey")
    open_ai_key = input_data.get("openAIKey")
    tavily_key = input_data.get("tavilyKey")
    history = input_data.get("history", [])
    company_context = input_data.get("companyContext", "")
    text = input_data.get("text", "")
    
    if not history and text:
        history = [{"role": "user", "content": text}]
        
    # Execute web research if query has research keywords
    query_lower = text.lower()
    research_keywords = ["research", "search", "google", "find out", "latest", "recent", "news", "competitors", "market size", "trends", "forecast"]
    needs_research = any(kw in query_lower for kw in research_keywords)
    
    if needs_research and tavily_key:
        sys.stderr.write(f"Executing web research for query: '{text}' using Tavily...\n")
        web_context = search_tavily(tavily_key, text)
        if web_context:
            company_context = f"{company_context}\n{web_context}"
    
    is_gemini_key = open_router_key and (open_router_key.startswith("AIzaSy") or open_router_key.startswith("AQ."))
    
    reply = ""
    if is_gemini_key:
        reply = query_gemini(open_router_key, history, company_context)
    elif open_router_key:
        reply = query_openrouter(open_router_key, history, company_context)
    elif open_ai_key:
        reply = query_openai(open_ai_key, history, company_context)
        
    print(json.dumps({"reply": reply}))

if __name__ == "__main__":
    main()
