const axios = require('axios');

// Generate unique identifiers for this test session
const uniqueUserId = `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const uniqueSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

console.log(`🧪 Starting Weather Follow-up Test`);
console.log(`👤 User ID: ${uniqueUserId}`);
console.log(`📱 Session ID: ${uniqueSessionId}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
console.log('=' * 80);

const BASE_URL = 'http://localhost:3001';

// Test configuration with all features enabled
const testOptions = {
  userId: uniqueUserId,
  sessionId: uniqueSessionId,
  includeMemoryContext: true,
  maxMemoryResults: 15,
  model: 'openai',
  temperature: 0.7,
  includeReasoning: true,
  responseDetailLevel: 'detailed',
  excludeVectors: false,
  enableContextCompression: true,
  maxTokens: 16000
};

async function makeRequest(query, step) {
  try {
    console.log(`\n🔍 Step ${step}: "${query}"`);
    console.log(`📊 Options:`, JSON.stringify(testOptions, null, 2));
    
    const response = await axios.post(`${BASE_URL}/api/agent/enhanced-execute`, {
      query,
      options: testOptions
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const result = response.data;
    
    console.log(`✅ Success: ${result.success}`);
    console.log(`🎯 Intent: ${result.data.intent?.type} (confidence: ${result.data.intent?.confidence})`);
    console.log(`🧠 Memory Context: ${result.data.memoryContext ? 'Yes' : 'No'}`);
    console.log(`🔧 Tools Used: ${result.data.toolResults?.length || 0}`);
    console.log(`📝 Response Length: ${result.data.response?.length || 0} characters`);
    
    if (result.data.reasoning) {
      console.log(`🤔 Reasoning: ${result.data.reasoning.substring(0, 200)}...`);
    }
    
    if (result.data.toolResults && result.data.toolResults.length > 0) {
      console.log(`🛠️  Tool Results:`);
      result.data.toolResults.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.toolName}: ${tool.success ? 'Success' : 'Failed'}`);
        if (tool.result) {
          console.log(`      Result: ${JSON.stringify(tool.result).substring(0, 100)}...`);
        }
      });
    }
    
    console.log(`💬 Response: ${result.data.response}`);
    
    return result.data;
  } catch (error) {
    console.error(`❌ Error in step ${step}:`, error.response?.data || error.message);
    return null;
  }
}

async function runWeatherFollowupTest() {
  try {
    // Step 1: Initial weather query for Berlin
    const step1 = await makeRequest("whats the weather like in berlin", 1);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Follow-up with comparison request
    const step2 = await makeRequest("Get the weather in New York and compare it with Tokyo", 2);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Direct follow-up question
    const step3 = await makeRequest("But which one is colder?", 3);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Test memory recall
    const step4 = await makeRequest("What cities did we discuss the weather for?", 4);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 5: Test context understanding
    const step5 = await makeRequest("Can you summarize our weather conversation?", 5);
    
    console.log('\n' + '=' * 80);
    console.log('📊 TEST SUMMARY');
    console.log('=' * 80);
    console.log(`👤 User ID: ${uniqueUserId}`);
    console.log(`📱 Session ID: ${uniqueSessionId}`);
    console.log(`✅ Steps completed: 5`);
    console.log(`🎯 Intent classification working: ${step1?.intent?.type ? 'Yes' : 'No'}`);
    console.log(`🧠 Memory context maintained: ${step4?.memoryContext ? 'Yes' : 'No'}`);
    console.log(`🔧 Tool execution working: ${step2?.toolResults?.length > 0 ? 'Yes' : 'No'}`);
    
    // Check if follow-up questions are being handled properly
    const followupHandled = step3?.response && !step3.response.includes("I'm not sure what you're referring to");
    console.log(`🔄 Follow-up questions handled: ${followupHandled ? 'Yes' : 'No'}`);
    
    if (!followupHandled) {
      console.log(`⚠️  ISSUE DETECTED: Follow-up questions not being handled properly`);
      console.log(`   Expected: Direct answer about which city is colder`);
      console.log(`   Actual: ${step3?.response || 'No response'}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
runWeatherFollowupTest();
