const axios = require('axios');

// Generate unique identifiers for this test session
const uniqueUserId = `debug-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const uniqueSessionId = `debug-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

console.log(`🔍 Starting Memory Debug Test`);
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
    
    // Check if we have working memory context
    if (result.data.workingMemoryContext) {
      console.log(`🧠 Working Memory Context: Yes`);
      console.log(`   📝 Current Topic: ${result.data.workingMemoryContext.currentTopic}`);
      console.log(`   🎯 Active Goals: ${result.data.workingMemoryContext.activeGoals?.length || 0}`);
      console.log(`   📚 Conversation History: ${result.data.workingMemoryContext.conversationHistory?.length || 0} turns`);
    } else {
      console.log(`🧠 Working Memory Context: No`);
    }
    
    // Check if we have managed context
    if (result.data.managedContext) {
      console.log(`🔧 Managed Context: Yes`);
      console.log(`   📊 Compression Ratio: ${result.data.managedContext.compressionRatio}`);
      console.log(`   🎯 Token Usage: ${result.data.managedContext.tokenUsage}`);
    } else {
      console.log(`🔧 Managed Context: No`);
    }
    
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

async function runMemoryDebugTest() {
  try {
    // Step 1: Initial weather query for Berlin
    console.log('\n🌍 STEP 1: Initial weather query');
    const step1 = await makeRequest("whats the weather like in berlin", 1);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: Follow-up with comparison request
    console.log('\n🌍 STEP 2: Comparison request');
    const step2 = await makeRequest("Get the weather in New York and compare it with Tokyo", 2);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Direct follow-up question
    console.log('\n🌍 STEP 3: Follow-up question');
    const step3 = await makeRequest("But which one is colder?", 3);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Test memory recall
    console.log('\n🌍 STEP 4: Memory recall test');
    const step4 = await makeRequest("What cities did we discuss the weather for?", 4);
    
    console.log('\n' + '=' * 80);
    console.log('📊 MEMORY DEBUG SUMMARY');
    console.log('=' * 80);
    console.log(`👤 User ID: ${uniqueUserId}`);
    console.log(`📱 Session ID: ${uniqueSessionId}`);
    
    // Analyze memory context across steps
    const steps = [step1, step2, step3, step4];
    const memoryContextCount = steps.filter(s => s?.memoryContext).length;
    const workingMemoryCount = steps.filter(s => s?.workingMemoryContext).length;
    const managedContextCount = steps.filter(s => s?.managedContext).length;
    
    console.log(`🧠 Memory Context Present: ${memoryContextCount}/4 steps`);
    console.log(`🧠 Working Memory Present: ${workingMemoryCount}/4 steps`);
    console.log(`🔧 Managed Context Present: ${managedContextCount}/4 steps`);
    
    // Check follow-up handling
    const followupHandled = step3?.response && !step3.response.includes("I'm not sure what you're referring to");
    console.log(`🔄 Follow-up Questions Handled: ${followupHandled ? 'Yes' : 'No'}`);
    
    if (!followupHandled) {
      console.log(`⚠️  ISSUE DETECTED: Follow-up questions not being handled properly`);
      console.log(`   Expected: Direct answer about which city is colder`);
      console.log(`   Actual: ${step3?.response || 'No response'}`);
      console.log(`   Intent: ${step3?.intent?.type} (confidence: ${step3?.intent?.confidence})`);
    }
    
    // Check memory recall
    const memoryRecallWorking = step4?.response && step4.response.includes('Berlin') && step4.response.includes('New York');
    console.log(`🧠 Memory Recall Working: ${memoryRecallWorking ? 'Yes' : 'No'}`);
    
    if (!memoryRecallWorking) {
      console.log(`⚠️  ISSUE DETECTED: Memory recall not working properly`);
      console.log(`   Expected: Response mentioning Berlin, New York, and Tokyo`);
      console.log(`   Actual: ${step4?.response || 'No response'}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
runMemoryDebugTest();


