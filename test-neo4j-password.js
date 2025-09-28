const neo4j = require('neo4j-driver');

async function testPasswords() {
  const passwords = ['password', 'samplepassword', 'neo4j', 'admin', '123456'];
  const uri = 'bolt://localhost:7687';
  const username = 'neo4j';

  for (const pwd of passwords) {
    try {
      console.log(`Testing password: ${pwd}`);
      const driver = neo4j.driver(uri, neo4j.auth.basic(username, pwd));
      await driver.verifyConnectivity();
      console.log('✅ Working password:', pwd);
      await driver.close();
      return pwd;
    } catch (e) {
      console.log('❌ Failed with password:', pwd);
    }
  }
  
  console.log('❌ No working password found');
  return null;
}

testPasswords().catch(console.error);
