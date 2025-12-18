# Gemini 3 Flash API – Python Examples for Key Use Cases

## Overview

**Gemini 3 Flash** is Google/DeepMind’s latest Gemini model variant, offering **Pro-level intelligence at the speed and cost of Flash**.  
The Gemini 3 series is designed for state-of-the-art reasoning and supports:

- Agentic workflows
- Autonomous coding
- Complex multimodal tasks

Below are **practical Python examples** using the **Google GenAI SDK**, covering common production use cases with clear request/response patterns.

---

## Covered Use Cases

- **Retrieval-Augmented Generation (RAG)**  
  Ground model responses on private or external data.
- **Agentic System Interactions**  
  Enable tool usage and function calling.
- **AI-Assisted Coding**  
  Generate, analyze, and explain code.
- **Image Generation**  
  Produce images from text prompts using multimodal models.

---

## Retrieval-Augmented Generation (RAG)

Gemini provides a built-in **File Search** tool for RAG.  
This tool allows you to upload and index documents so the model can retrieve relevant information during generation, injecting grounded context without managing a separate vector database.

### Example: File Search–Based RAG

```python
from google import genai
from google.genai import types

# Initialize Gemini API client
client = genai.Client(api_key="YOUR_GEMINI_API_KEY")
````

### 1. Create a File Search Store

```python
file_search_store = client.file_search_stores.create(
    config={"display_name": "my-knowledge-base"}
)
```

### 2. Upload a Document

```python
operation = client.file_search_stores.upload_to_file_search_store(
    file="company_faq.txt",
    file_search_store_name=file_search_store.name
)

# Wait for indexing to complete (omitted for brevity)
```

### 3. Query with Grounding

```python
query = "What benefits do we offer to full-time employees?"

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=query,
    config=types.GenerateContentConfig(
        tools=[
            {
                "file_search": {
                    "file_search_store_names": [file_search_store.name]
                }
            }
        ]
    )
)

print(response.text)
```

**Result:**
The model retrieves relevant passages from `company_faq.txt` and incorporates them into the final answer.

> File Search is a fully managed RAG solution built into the Gemini API. No external vector database required.

---

## Agentic System Interactions

Gemini 3 models support **tool usage and function calling**, enabling agentic workflows.

* **Built-in tools** (e.g. Google Search, Code Execution) can be invoked internally.
* **Custom functions** allow the model to return structured JSON calls for your application to execute.

### Example: Custom Function Calling

#### Define a Function Schema

```python
meeting_function = {
    "name": "schedule_meeting",
    "description": "Schedules a meeting given attendees, date, time, and topic.",
    "parameters": {
        "type": "object",
        "properties": {
            "attendees": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of meeting attendees"
            },
            "date": {
                "type": "string",
                "description": "Meeting date (YYYY-MM-DD)"
            },
            "time": {
                "type": "string",
                "description": "Meeting time (HH:MM)"
            },
            "topic": {
                "type": "string",
                "description": "Meeting topic"
            }
        },
        "required": ["attendees", "date", "time", "topic"]
    }
}
```

#### Call the Model with Tool Access

```python
tool_config = types.Tool(function_declarations=[meeting_function])

user_request = (
    "Schedule a meeting with Alice and Bob tomorrow at 10:00 AM "
    "about quarterly planning."
)

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=user_request,
    config=types.GenerateContentConfig(tools=[tool_config])
)
```

#### Handle the Function Call

```python
parts = response.candidates[0].content.parts

if parts and parts[0].function_call:
    fn_call = parts[0].function_call
    print("Function call requested:", fn_call.name)
    print("Arguments:", fn_call.args)

    # Execute the function in your system:
    # schedule_meeting(**fn_call.args)

else:
    print("Model answer:", response.text)
```

**Result:**
The model emits a structured `schedule_meeting` call instead of free text, allowing your system to execute real-world actions before returning a confirmation.

---

## AI-Assisted Coding

Gemini 3 Flash excels at:

* Code generation
* Bug detection
* Refactoring
* Explanation and documentation

### Example: Code Generation

```python
prompt = (
    "Write a Python function `is_prime(n)` that returns True if n is a prime "
    "number and False otherwise. Include a brief docstring."
)

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=prompt
)

print(response.text)
```

**Typical Output:**

```python
def is_prime(n):
    """Check if n is a prime number."""
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True
```

This same pattern applies to explaining code, generating tests, or refactoring existing implementations.

---

## Image Generation

For image creation, Gemini offers **Gemini 3 Pro Image** (codename *Nano Banana Pro*), the highest-quality image model in the family.

* Supports grounded image generation
* Can optionally use tools like Google Search
* Returns images as inline binary data

### Example: Image Generation with Grounding

```python
from PIL import Image

image_prompt = (
    "An infographic illustrating the current weather in Tokyo, "
    "with icons and temperatures."
)

response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=image_prompt,
    config=types.GenerateContentConfig(
        tools=[{"google_search": {}}],
        image_config=types.ImageConfig(
            aspect_ratio="16:9",
            image_size="2K"
        )
    )
)
```

#### Extract and Save the Image

```python
image_parts = [
    part for part in response.parts
    if part.inline_data
]

if image_parts:
    img = image_parts[0].as_image()
    img.save("tokyo_weather.png")
    print("Image saved to tokyo_weather.png")
```

**Result:**
A high-resolution, grounded infographic image generated and saved locally.

---

## Summary

These examples demonstrate how **Gemini 3 Flash** supports:

* Knowledge-grounded generation (RAG)
* Agentic tool usage
* Advanced coding workflows
* High-quality multimodal image generation

All examples are built using the **official Gemini API and Python SDK**, making them suitable for production integration.

---

## References

* Gemini 3 Developer Guide
  [https://ai.google.dev/gemini-api/docs/gemini](https://ai.google.dev/gemini-api/docs/gemini)
* File Search (RAG)
  [https://ai.google.dev/gemini-api/docs/file-search](https://ai.google.dev/gemini-api/docs/file-search)
* Tools & Agents
  [https://ai.google.dev/gemini-api/docs/tools](https://ai.google.dev/gemini-api/docs/tools)
* Function Calling
  [https://ai.google.dev/gemini-api/docs/function-calling](https://ai.google.dev/gemini-api/docs/function-calling)
* Build with Gemini 3 Flash
  [https://blog.google/technology/developers/build-with-gemini-3-flash/](https://blog.google/technology/developers/build-with-gemini-3-flash/)

```

---

