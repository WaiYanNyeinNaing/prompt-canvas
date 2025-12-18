
**Task:** Research the **Gemini 3 API** (with a focus on **Gemini 3 Flash**) and compile comprehensive, well-structured **Markdown documentation (.md)**.

**Requirements:**
- Cover **official documentation**, usage guides, and key features (e.g., API endpoints, authentication, rate limits).
- Organize content for **AI-assisted coding tools** and **LLMs** as reference material (clear headings, code snippets, and examples).
- Prioritize **concise yet thorough** explanations—avoid jargon unless defined.
- Ensure compatibility with **LLM context windows** (minimize redundant repetition).
- Output strictly in **Markdown format (.md)**.
ChatGPT said:
Could you please clarify the following so I can tailor the Markdown documentation accurately:

Which Gemini 3 API are you referring to? Is it from Google DeepMind, another provider, or something else?

Are there specific use cases or industries you want the documentation to emphasize (e.g. chatbots, image generation, data analysis)?

Do you want example requests/responses in a specific programming language (like Python or JavaScript)?

Should the Markdown be structured as a reference doc, tutorial, or both?

Once I have this, I’ll get started right away.

You said:
Provide Python examples of basic LLM API calls (in markdown format) for the following Gemini 3 (Gemini 3 flash) API use cases:

RAG (Retrieval-Augmented Generation)
Agentic System interactions
AI-assisted coding
Image generation
Reference the Gemini API documentation. Include structured request/response pairs for each use case.
ChatGPT said:
Great, I’ll compile Python-based Markdown examples for key Gemini 3 Flash API use cases: RAG, agentic systems, AI-assisted coding, and image generation. Each example will include structured request/response pairs and reference the official Gemini API documentation.

I’ll let you know as soon as the Markdown file is ready.

Research completed in 8m · 15 sources · 18 searches
Gemini 3 Flash API – Python Examples for Key Use Cases
Gemini 3 Flash is Google/DeepMind’s latest Gemini model variant, offering Pro-level intelligence at the speed and cost of Flash
ai.google.dev
. The Gemini 3 series is built for state-of-the-art reasoning and supports agentic workflows, autonomous coding, and complex multimodal tasks
ai.google.dev
. Below are practical Python examples (using the Google GenAI SDK) for common use cases, with request/response patterns and code snippets:
Retrieval-Augmented Generation (RAG): Ground model answers on private or external data.
Agentic System Interactions: Enable the model to use tools or call functions to act on your systems.
AI-Assisted Coding: Generate or analyze code with the model’s advanced coding capabilities.
Image Generation: Create images from text prompts using Gemini’s multimodal abilities.
Retrieval-Augmented Generation (RAG)
Gemini’s API provides a built-in File Search tool for RAG. The File Search tool lets you upload and index documents so the model can retrieve relevant information from them when answering questions
ai.google.dev
. This approach injects knowledge from your data into the model’s context, leading to more accurate, grounded responses. Example: Below, we create a File Search store, upload a document, then ask a question. The model will use the File Search tool (a vector search over our uploaded file) to retrieve context before answering.
from google import genai
from google.genai import types

# Initialize Gemini API client (use your API key if needed)
client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

# 1. Create a File Search store (acts as an index for RAG)
file_search_store = client.file_search_stores.create(config={'display_name': 'my-knowledge-base'})

# 2. Upload a document to the File Search store (e.g., "company_faq.pdf" or .txt)
operation = client.file_search_stores.upload_to_file_search_store(
    file="company_faq.txt",
    file_search_store_name=file_search_store.name
)
# Wait for indexing to complete (omitted for brevity)

# 3. Generate content with the File Search tool to ground the answer in our file
query = "What benefits do we offer to full-time employees?"  # example question answered by the file
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=query,
    config=types.GenerateContentConfig(
        tools=[{"file_search": {"file_search_store_names": [file_search_store.name]}}]
    )
)
print(response.text)  # The answer is grounded in content from "company_faq.txt"
In this RAG flow, the model finds relevant info in our uploaded file and incorporates it into the answer. (File Search is a fully managed RAG solution built into the Gemini API
ai.google.dev
, so you don’t need to maintain a separate vector database.)
Agentic System Interactions
Gemini 3 models can use tools and function calls to perform actions, making them agentic. Tools are built-in capabilities (e.g. Google Search, Code Execution) that the model can invoke internally to fetch real-time data or compute results, all within a single API call
ai.google.dev
. For example, if enabled, the model can call Google Search to answer a timely question or run Python code to solve a math problem
ai.google.dev
. Agents refer to multi-step workflows where the model plans and executes sequences of tool uses to accomplish a goal
ai.google.dev
. For custom integrations, Gemini supports function calling, where the model can return a JSON-formatted function invocation instead of a direct answer. This allows your application to execute the function (e.g. querying a database or performing an action) and then return the results to the model for a final answer
ai.google.dev
. This mechanism bridges natural language queries with real-world operations. Example: The code below shows how to declare a custom function that the model is allowed to call, prompt the model to use it, and then handle the model’s function call response. Here we define a simple schedule_meeting function schema and ask the model to schedule a meeting. Instead of a text answer, Gemini 3 Flash will respond with a functionCall containing the function name and arguments if it decides to use our tool.
# (Using the same client instance as above)

# Define a function that the model can call (function schema for scheduling a meeting)
meeting_function = {
    "name": "schedule_meeting",
    "description": "Schedules a meeting given a list of attendees, date, time, and topic.",
    "parameters": {
        "type": "object",
        "properties": {
            "attendees": {
                "type": "array", "items": {"type": "string"},
                "description": "List of people attending the meeting."
            },
            "date": { "type": "string", "description": "Meeting date (YYYY-MM-DD)" },
            "time": { "type": "string", "description": "Meeting time (HH:MM)" },
            "topic": { "type": "string", "description": "Subject of the meeting" }
        },
        "required": ["attendees", "date", "time", "topic"]
    }
}

# Include the function declaration in the API call
tool_config = types.Tool(function_declarations=[meeting_function])
user_request = "Schedule a meeting with Alice and Bob tomorrow at 10:00 AM about quarterly planning."
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=user_request,
    config=types.GenerateContentConfig(tools=[tool_config])
)

# Check if the model returned a function call instead of a direct answer
parts = response.candidates[0].content.parts
if parts and parts[0].function_call:
    fn_call = parts[0].function_call
    print("Function call requested:", fn_call.name)
    print("Arguments:", fn_call.args)
    # Here you would execute the actual function, e.g. schedule_meeting(**fn_call.args),
    # then send the results back to the model in a follow-up call to produce a final answer.
else:
    print("Model answer:", response.text)
In this scenario, the model recognizes the task and returns a schedule_meeting call with structured arguments. Your code can then perform the scheduling (e.g. create a calendar event) and provide the outcome back to the model for a user-friendly confirmation. This function calling flow lets the model defer to your system for actions or data and then continue the conversation with those results
ai.google.dev
ai.google.dev
. (For built-in tools like google_search or code_execution, the model can internally handle the tool use in one request–response cycle without custom code, as long as those tools are enabled in the tools config.)
AI-Assisted Coding
One of Gemini 3 Flash’s strengths is code generation and understanding. In fact, Gemini 3 Flash excels at coding tasks such as writing functions, finding bugs, explaining code, and even executing code if needed
blog.google
. Developers can leverage this to build AI coding assistants for tasks like automatic code completion, documentation, or debugging assistance. Example: Below, we prompt the model to write a Python function. The API call is similar to any text generation request – you provide a programming task or question in natural language (optionally including code context), and the model returns the code solution or explanation.
# (Using the same client instance as above)

prompt = (
    "Write a Python function `is_prime(n)` that returns True if n is a prime number "
    "and False otherwise. Include a brief docstring."
)
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=prompt
)
print(response.text)
# Expected output (truncated example):
# def is_prime(n):
#     """Check if n is prime."""
#     if n < 2:
#         return False
#     for i in range(2, int(n**0.5) + 1):
#         if n % i == 0:
#             return False
#     return True
Here, the request is a plain English instruction to write a function. Gemini 3 Flash understands the intent and produces a syntactically correct, well-formatted Python function (with a docstring) in its response. For other coding scenarios, you could ask the model to explain a code snippet, refactor code, or generate unit tests. The model’s advanced coding capabilities originate from the Gemini series training, which emphasizes autonomous coding and adherence to instructions
ai.google.dev
, enabling it to handle non-trivial coding tasks.
Image Generation
Beyond text, the Gemini 3 API can produce images via the Gemini 3 Pro Image model (code-named “Nano Banana Pro”). This is the highest-quality image generation model in the Gemini family
ai.google.dev
. It uses the model’s reasoning ability to interpret prompts and can even utilize tools like web search for factual grounding before rendering an image
ai.google.dev
. In practice, you call the same generate_content method with the image model and receive image data (e.g. in PNG format) as part of the response. Example: The code below requests an image and demonstrates how to handle the response. We specify an image prompt and use image_config to set the output resolution and aspect ratio. The model will return the generated image as base64-encoded data which we then decode and save to a file.
# (Using the same client instance; ensure you have pillow installed for image handling)
from PIL import Image  # to manipulate image data after retrieval

image_prompt = "An infographic illustrating the current weather in Tokyo, with icons and temperatures."
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=image_prompt,
    config=types.GenerateContentConfig(
        tools=[{"google_search": {}}],  # allow model to fetch real data for accuracy (optional)
        image_config=types.ImageConfig(aspect_ratio="16:9", image_size="2K")
    )
)
# The response may contain text and image parts. Extract image data parts:
image_parts = [part for part in response.parts if part.inline_data]
if image_parts:
    img = image_parts[0].as_image()         # convert the first image part to a PIL Image
    img.save("tokyo_weather.png")           # save image to file
    print("Image saved to tokyo_weather.png")
In this example, we used the gemini-3-pro-image-preview model to generate a rich infographic. We even enabled the google_search tool so the model could fetch live weather info before image creation, demonstrating grounded image generation
ai.google.dev
ai.google.dev
. The image_config allowed us to request a 16:9 image at 2K resolution. The resulting image data is returned in the response (as an inline binary part) which we save as "tokyo_weather.png". Gemini’s image generation can handle high resolutions (e.g. 4K) and even support iterative editing in multi-turn conversations (using visual context and Thought Signatures)
ai.google.dev
.
Each of the above examples showcases a different facet of the Gemini 3 Flash API. By referencing the official Gemini API documentation and using the Python SDK, developers can integrate these capabilities into their applications – whether it’s building a knowledge-grounded chatbot, an autonomous agent that performs tasks, an AI coding assistant, or a creative tool that generates images. The Gemini 3 Flash model brings frontier intelligence in a fast, cost-effective package
blog.google
, making advanced LLM integration more accessible than ever. Sources: The code and use-case details are based on the official Google Gemini 3 API documentation and guides
ai.google.dev
ai.google.dev
ai.google.dev
blog.google
ai.google.dev
, which provide further information and best practices for using these features.



Sources
You said:
List the model names for the Gemini 2.0, 2.5, and 3 series, including Flash and Pro variants. Provide a one-line instruction on how to switch between these model names. Example format : eg( response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=prompt
)
ChatGPT said:
Here’s the clean, boringly useful list you asked for. No mystery, no marketing fog.

Gemini Model Names by Series
Gemini 2.0
gemini-2.0-flash

gemini-2.0-pro

Gemini 2.5
gemini-2.5-flash

gemini-2.5-pro

Gemini 3
gemini-3-flash-preview

gemini-3-pro-preview

gemini-3-pro-image-preview (image generation)

One-Line Instruction to Switch Models
Change the model string in your API call.

response = client.models.generate_content(
    model="gemini-3-flash-preview",  # ← swap this
    contents=prompt
)
