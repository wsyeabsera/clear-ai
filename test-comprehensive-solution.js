const axios = require('axios');

// Generate unique identifiers for this test session
const uniqueUserId = `solution-test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const uniqueSessionId = `solution-test-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

console.log(`🔧 Starting Comprehensive Solution Test`);
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
      timeout: 45000 // Increased timeout
    });

    const result = response.data;
    
    console.log(`✅ Success: ${result.success}`);
    console.log(`🎯 Intent: ${result.data.intent?.type} (confidence: ${result.data.intent?.confidence})`);
    console.log(`🧠 Memory Context: ${result.data.memoryContext ? 'Yes' : 'No'}`);
    console.log(`🔧 Tools Used: ${result.data.toolResults?.length || 0}`);
    
    // Check memory context details
    if (result.data.memoryContext) {
      console.log(`🧠 Memory Context Details:`);
      console.log(`   📝 Episodic Memories: ${result.data.memoryContext.episodicMemories?.length || 0}`);
      console.log(`   🧠 Semantic Memories: ${result.data.memoryContext.semanticMemories?.length || 0}`);
      console.log(`   📊 Relevance Score: ${result.data.memoryContext.contextWindow?.relevanceScore || 0}`);
      
      // Show first few memories
      if (result.data.memoryContext.episodicMemories?.length > 0) {
        console.log(`   📝 First Memory: ${result.data.memoryContext.episodicMemories[0].content?.substring(0, 100)}...`);
      }
    }
    
    // Check if we have working memory context
    if (result.data.workingMemoryContext) {
      console.log(`🧠 Working Memory Context: Yes`);
      console.log(`   📝 Current Topic: ${result.data.workingMemoryContext.currentTopic}`);
      console.log(`   🎯 Active Goals: ${result.data.workingMemoryContext.activeGoals?.length || 0}`);
      console.log(`   📚 Conversation History: ${result.data.workingMemoryContext.conversationHistory?.length || 0} turns`);
    } else {
      console.log(`🧠 Working Memory Context: No`);
    }
    
    if (result.data.reasoning) {
      console.log(`🤔 Reasoning: ${result.data.reasoning.substring(0, 200)}...`);
    }
    
    console.log(`💬 Response: ${result.data.response}`);
    
    return result.data;
  } catch (error) {
    console.error(`❌ Error in step ${step}:`, error.response?.data || error.message);
    return null;
  }
}

async function testComprehensiveSolution() {
  try {
    // Step 1: Initial weather query for Berlin
    console.log('\n🌍 STEP 1: Initial weather query');
    const step1 = await makeRequest("whats the weather like in berlin", 1);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: Check if memory was stored by asking about it
    console.log('\n🌍 STEP 2: Memory recall test');
    const step2 = await makeRequest("What did I ask about earlier?", 2);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Another weather query
    console.log('\n🌍 STEP 3: Another weather query');
    const step3 = await makeRequest("Get the weather in New York", 3);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Follow-up question
    console.log('\n🌍 STEP 4: Follow-up question');
    const step4 = await makeRequest("Which city is colder?", 4);
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 5: Final memory test
    console.log('\n🌍 STEP 5: Final memory test');
    const step5 = await makeRequest("What cities did we discuss?", 5);
    
    console.log('\n' + '=' * 80);
    console.log('📊 COMPREHENSIVE SOLUTION SUMMARY');
    console.log('=' * 80);
    console.log(`👤 User ID: ${uniqueUserId}`);
    console.log(`📱 Session ID: ${uniqueSessionId}`);
    
    // Analyze memory context across steps
    const steps = [step1, step2, step3, step4, step5];
    const memoryContextCount = steps.filter(s => s?.memoryContext).length;
    const workingMemoryCount = steps.filter(s => s?.workingMemoryContext).length;
    const totalMemories = steps.reduce((sum, s) => sum + (s?.memoryContext?.episodicMemories?.length || 0), 0);
    
    console.log(`🧠 Memory Context Present: ${memoryContextCount}/5 steps`);
    console.log(`🧠 Working Memory Present: ${workingMemoryCount}/5 steps`);
    console.log(`📝 Total Memories Stored: ${totalMemories}`);
    
    // Check specific functionality
    const memoryRecallWorking = step2?.response && step2.response.includes('Berlin');
    const followupHandled = step4?.response && !step4.response.includes("I'm not sure what you're referring to");
    const finalMemoryWorking = step5?.response && (step5.response.includes('Berlin') || step5.response.includes('New York'));
    
    console.log(`🧠 Memory Recall Working: ${memoryRecallWorking ? 'Yes' : 'No'}`);
    console.log(`🔄 Follow-up Questions Handled: ${followupHandled ? 'Yes' : 'No'}`);
    console.log(`🧠 Final Memory Working: ${finalMemoryWorking ? 'Yes' : 'No'}`);
    
    // Overall assessment
    const overallScore = (memoryContextCount > 0 ? 1 : 0) + (memoryRecallWorking ? 1 : 0) + (followupHandled ? 1 : 0) + (finalMemoryWorking ? 1 : 0);
    console.log(`\n🎯 Overall Score: ${overallScore}/4`);
    
    if (overallScore >= 3) {
      console.log(`✅ SOLUTION SUCCESSFUL: Follow-up questions are now working properly!`);
    } else if (overallScore >= 2) {
      console.log(`⚠️  PARTIAL SUCCESS: Some improvements made, but issues remain`);
    } else {
      console.log(`❌ SOLUTION NEEDS WORK: Major issues still present`);
    }
    
    // Detailed analysis
    if (!memoryRecallWorking) {
      console.log(`\n⚠️  MEMORY RECALL ISSUE:`);
      console.log(`   Expected: Response mentioning Berlin`);
      console.log(`   Actual: ${step2?.response || 'No response'}`);
      console.log(`   Memory Context: ${step2?.memoryContext ? 'Present' : 'Missing'}`);
      console.log(`   Episodic Memories: ${step2?.memoryContext?.episodicMemories?.length || 0}`);
    }
    
    if (!followupHandled) {
      console.log(`\n⚠️  FOLLOW-UP ISSUE:`);
      console.log(`   Expected: Direct answer about which city is colder`);
      console.log(`   Actual: ${step4?.response || 'No response'}`);
      console.log(`   Memory Context: ${step4?.memoryContext ? 'Present' : 'Missing'}`);
      console.log(`   Episodic Memories: ${step4?.memoryContext?.episodicMemories?.length || 0}`);
    }
    
    if (!finalMemoryWorking) {
      console.log(`\n⚠️  FINAL MEMORY ISSUE:`);
      console.log(`   Expected: Response mentioning Berlin and New York`);
      console.log(`   Actual: ${step5?.response || 'No response'}`);
      console.log(`   Memory Context: ${step5?.memoryContext ? 'Present' : 'Missing'}`);
      console.log(`   Episodic Memories: ${step5?.memoryContext?.episodicMemories?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testComprehensiveSolution();


