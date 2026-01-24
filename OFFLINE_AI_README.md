# Offline AI Feature Documentation

## Overview

The "Ask the AI" feature is now fully **offline** and requires **NO external AI APIs**. It uses rule-based logic and scientific templates to provide intelligent explanations.

## Key Features

### 1. Zero External Dependencies
- No Anthropic API calls
- No OpenAI or other LLM services
- Works completely offline
- No API keys needed

### 2. Intelligent Intent Detection
The system automatically detects what the user is asking about:
- Temperature questions
- Activation method questions
- Duration and timing
- Performance metrics
- Risk assessment
- Cost analysis
- Scientific definitions

### 3. Profile-Based Responses
Answers adapt to the user type:

**Student Mode:**
- Simple language
- Analogies and examples
- Educational tone
- Clear explanations

**Researcher Mode:**
- Technical terminology
- Scientific principles
- Detailed mechanisms
- Research-level depth

**Industrial Mode:**
- Cost implications
- Production scalability
- Risk mitigation
- Practical implementation

### 4. Guided Questions
When users open the "Ask the AI" panel, they see suggested questions grouped by category:

**About Process:**
- Why this temperature?
- Why this activation method?
- Why this duration?
- How is this material made?

**About Performance:**
- Is this CO2 score high?
- How good is this result?
- Can this be improved?

**About Risk & Safety:**
- What is the most sensitive step?
- Is this safe for scaling?
- What are the chemical hazards?

**Learning Mode (Student only):**
- What is pyrolysis?
- What is activation?
- What is adsorption?
- What is biochar?

**Cost & Scaling (Industrial only):**
- What are the production costs?
- How does this scale up?
- What is the profit potential?

### 5. Data-Only Responses
The system ONLY uses data from the experiment:
- Never invents new values
- Never suggests modifications
- Only explains what exists in the JSON
- Strictly based on input_json and result_json

## Implementation

### Core Files

**`src/utils/offlineAI.ts`**
- Intent detection engine
- Scientific template library
- Rule-based response generation
- Profile-specific formatting

**`src/components/AskAIPanel.tsx`**
- Chat interface with guided questions
- Real-time response generation
- Category-based question suggestions
- User-friendly UI

## How It Works

1. **User asks a question** (or clicks a suggested question)

2. **Intent detection** analyzes the question:
   - Extracts keywords
   - Identifies the category (temperature, activation, etc.)
   - Determines context from user profile

3. **Template matching** selects the appropriate response template:
   - Temperature explanations reference actual pyrolysis conditions
   - Activation explanations use actual activation parameters
   - Performance analysis uses real CO2 scores and confidence levels

4. **Profile adaptation** formats the response:
   - Simple for students
   - Technical for researchers
   - Practical for industrial users

5. **Response delivery** in natural language with scientific accuracy

## Example Interactions

### Student asks: "Why this temperature?"
Response includes:
- Simple analogy (like cooking)
- Explanation of temperature effects
- Connection to material and goal

### Researcher asks: "Why this activation method?"
Response includes:
- Chemical mechanisms
- Pore formation theory
- Expected surface area ranges
- Scientific literature context

### Industrial user asks: "What are the production costs?"
Response includes:
- Energy cost calculations
- Chemical costs per kg
- Labor and overhead estimates
- Profit margin analysis

## Benefits

1. **Always Available**: No internet or API dependencies
2. **Instant Responses**: No API latency
3. **Zero Cost**: No per-request charges
4. **Privacy**: No data sent to external services
5. **Predictable**: Consistent, reproducible answers
6. **Educational**: Teaches scientific concepts effectively

## Technical Details

- Written in TypeScript
- Pure client-side logic
- Uses conditional reasoning and templates
- Extracts values from experiment JSON
- Formats based on user profile
- Provides contextual explanations

## No External APIs

The old edge function (`supabase/functions/ask-ai/index.ts`) that called Anthropic API is **not used anymore**. The system is completely self-contained.

If you want to completely remove it, you can delete:
- `supabase/functions/ask-ai/`

But it's not necessary - it simply won't be called.
