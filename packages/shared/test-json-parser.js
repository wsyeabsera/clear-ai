// Quick test script for the robust JSON parser
const { parseLLMJsonResponse } = require('./dist/utils');

// Test cases simulating different LLM response formats
const testCases = [
  {
    name: 'Clean JSON',
    input: '{"toolName": "api_call", "args": {"url": "https://example.com"}, "reasoning": "test", "complete": true}'
  },
  {
    name: 'JSON in markdown code block',
    input: 'Here is the response:\n```json\n{"toolName": "api_call", "args": {"url": "https://example.com"}, "reasoning": "test", "complete": true}\n```'
  },
  {
    name: 'JSON with extra text',
    input: 'Based on the query, I think the best tool is:\n{"toolName": "api_call", "args": {"url": "https://example.com"}, "reasoning": "test", "complete": true}\nLet me know if you need anything else.'
  },
  {
    name: 'Ollama-style response (from logs)',
    input: '```json\n{\n  "toolName": "api_call",\n  "args": {\n    "url": "https://api.github.com/users/octocat",\n    "method": "GET"\n  },\n  "reasoning": "The user query requires making an API call to a specific URL",\n  "complete": true\n}\n```'
  },
  {
    name: 'Malformed JSON with trailing comma',
    input: '{"toolName": "api_call", "args": {"url": "https://example.com",}, "reasoning": "test", "complete": true}'
  },
  {
    name: 'JSON with unquoted keys',
    input: '{toolName: "api_call", args: {url: "https://example.com"}, reasoning: "test", complete: true}'
  }
];

console.log('Testing robust JSON parser with different LLM response formats...\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input: ${testCase.input.substring(0, 100)}${testCase.input.length > 100 ? '...' : ''}`);

  const result = parseLLMJsonResponse(testCase.input);

  if (result.success) {
    console.log(`✅ Success: ${JSON.stringify(result.data, null, 2)}`);
  } else {
    console.log(`❌ Failed: ${result.error}`);
    console.log(`Attempts: ${result.attempts.join(', ')}`);
  }
  console.log('---\n');
});
