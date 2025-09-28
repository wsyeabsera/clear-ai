/**
 * Test Neo4j connection
 * Run with: node test-neo4j-connection.js
 */

const testNeo4jConnection = async () => {
  console.log('🔍 Testing Neo4j connection...');
  
  // Try different common Neo4j ports
  const ports = [7687, 7688, 7689];
  const uris = [
    'bolt://localhost:7687',
    'bolt://localhost:7688', 
    'bolt://localhost:7689',
    'bolt://127.0.0.1:7687',
    'bolt://127.0.0.1:7688',
    'bolt://127.0.0.1:7689'
  ];
  
  for (const uri of uris) {
    try {
      console.log(`Trying ${uri}...`);
      
      // Try to connect using neo4j-driver
      const neo4j = require('neo4j-driver');
      const driver = neo4j.driver(uri, neo4j.auth.basic('neo4j', 'samplepassword'));
      
      // Test connection
      await driver.verifyConnectivity();
      console.log(`✅ Connected to Neo4j at ${uri}`);
      
      // Test a simple query
      const session = driver.session();
      const result = await session.run('RETURN 1 as test');
      console.log(`✅ Query test successful: ${result.records[0].get('test')}`);
      
      await session.close();
      await driver.close();
      
      console.log('\n🎉 Neo4j is working! Use these settings in your .env file:');
      console.log(`NEO4J_URI=${uri}`);
      console.log('NEO4J_USERNAME=neo4j');
      console.log('NEO4J_PASSWORD=samplepassword');
      console.log('NEO4J_DATABASE=local-clear-db');
      
      return true;
    } catch (error) {
      console.log(`❌ Failed to connect to ${uri}: ${error.message}`);
    }
  }
  
  console.log('\n❌ Could not connect to Neo4j on any port');
  console.log('\n💡 Make sure Neo4j Desktop is running:');
  console.log('1. Open Neo4j Desktop');
  console.log('2. Create a new project');
  console.log('3. Add a new database');
  console.log('4. Set password to "password" (or update the script)');
  console.log('5. Click Start');
  
  return false;
};

// Run the test
testNeo4jConnection().catch(console.error);
