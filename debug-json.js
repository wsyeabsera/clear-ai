// Debug the JSON parsing issue
const { parseLLMJsonResponse } = require('./packages/shared/dist/utils');

// Test the problematic response from the logs
const problematicResponse = ' {\n  \"toolName\": \"api_call\",\n  \"args\": {\n    \"url\": \"https://api.github.com/users/octocat\",\n    \"method\": \"GET\",\n    \"timeout\": 10000\n  },\n  \"reasoning\": \"This query matches the \'api_call\' tool, as it requires making an HTTP GET request to a specified URL.\"\n}';

const workingResponse = '{\n  \"toolName\": \"api_call\",\n  \"args\": {\n    \"url\": \"https://api.github.com/users/octocat\",\n    \"method\": \"GET\"\n  },\n  \"reasoning\": \"The query involves making an API call to a specific URL.\",\n  \"complete\": true\n}';

console.log('=== PROBLEMATIC RESPONSE ===');
console.log('Input:', JSON.stringify(problematicResponse));
const result1 = parseLLMJsonResponse(problematicResponse);
console.log('Result:', result1);

console.log('\n=== WORKING RESPONSE ===');
console.log('Input:', JSON.stringify(workingResponse));
const result2 = parseLLMJsonResponse(workingResponse);
console.log('Result:', result2);
