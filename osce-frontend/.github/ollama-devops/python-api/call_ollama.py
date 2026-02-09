from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess

app = FastAPI()

class CodeReviewRequest(BaseModel):
    code_snippet: str

@app.post("/code-review")
async def code_review(request: CodeReviewRequest):
    prompt = f"Please review this code snippet:\n{request.code_snippet}"

    try:
        result = subprocess.run(
            ["ollama", "run", "gpt-oss:20b", prompt],
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"OLlama CLI error: {result.stderr.strip()}")

        review_output = result.stdout.strip()
        return {"review": review_output}

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Ollama CLI request timed out.")
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(ex)}")
