/**
 * Test script to verify Ollama embeddings are working
 * Run with: node test-ollama-embeddings.js
 */

const testOllamaEmbeddings = async () => {
  try {
    console.log('🧪 Testing Ollama embeddings...');
    
    // Test the embedding endpoint
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: 'Hello, this is a test of the embedding system'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Ollama embeddings working!');
    console.log(`📊 Embedding dimension: ${data.embedding.length}`);
    console.log(`🔢 First 5 values: [${data.embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    
    // Test with different text
    const response2 = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: 'Machine learning and artificial intelligence'
      })
    });

    const data2 = await response2.json();
    
    // Calculate cosine similarity
    const dotProduct = data.embedding.reduce((sum, val, i) => sum + val * data2.embedding[i], 0);
    const magnitude1 = Math.sqrt(data.embedding.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(data2.embedding.reduce((sum, val) => sum + val * val, 0));
    const similarity = dotProduct / (magnitude1 * magnitude2);
    
    console.log(`🔗 Similarity between texts: ${similarity.toFixed(4)}`);
    
    if (similarity < 0.5) {
      console.log('✅ Good! Different texts have low similarity');
    } else {
      console.log('⚠️  Warning: Similarity seems high for different texts');
    }
    
  } catch (error) {
    console.error('❌ Error testing Ollama embeddings:', error.message);
    console.log('\n💡 Make sure Ollama is running with:');
    console.log('   ollama serve');
    console.log('   ollama pull nomic-embed-text');
  }
};

// Run the test
testOllamaEmbeddings();
