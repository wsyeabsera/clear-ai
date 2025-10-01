import neo4j, { Driver, Session, Transaction } from 'neo4j-driver';
import { v4 as uuidv4 } from 'uuid';
import { EpisodicMemory, MemoryServiceConfig } from '../types/memory';

export class Neo4jMemoryService {
  private driver: Driver;
  private config: MemoryServiceConfig['neo4j'];

  constructor(config: MemoryServiceConfig['neo4j']) {
    this.config = config;
    this.driver = neo4j.driver(
      config.uri,
      neo4j.auth.basic(config.username, config.password)
    );
  }

  async initialize(): Promise<void> {
    try {
      await this.driver.verifyConnectivity();
      await this.createConstraints();
      console.log('Neo4j memory service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Neo4j memory service:', error);
      throw error;
    }
  }

  private async createConstraints(): Promise<void> {
    const session = this.driver.session({ database: this.config.database });
    try {
      // Create constraints for unique IDs
      await session.run(`
        CREATE CONSTRAINT episodic_memory_id IF NOT EXISTS
        FOR (m:EpisodicMemory) REQUIRE m.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT user_id IF NOT EXISTS
        FOR (u:User) REQUIRE u.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT session_id IF NOT EXISTS
        FOR (s:Session) REQUIRE s.id IS UNIQUE
      `);

      // Create indexes for better query performance
      await session.run(`
        CREATE INDEX episodic_memory_timestamp IF NOT EXISTS
        FOR (m:EpisodicMemory) ON (m.timestamp)
      `);

      await session.run(`
        CREATE INDEX episodic_memory_user IF NOT EXISTS
        FOR (m:EpisodicMemory) ON (m.userId)
      `);

      await session.run(`
        CREATE INDEX episodic_memory_session IF NOT EXISTS
        FOR (m:EpisodicMemory) ON (m.sessionId)
      `);
    } finally {
      await session.close();
    }
  }

  async storeEpisodicMemory(memory: Omit<EpisodicMemory, 'id'>): Promise<EpisodicMemory> {
    const id = uuidv4();
    const episodicMemory: EpisodicMemory = {
      ...memory,
      id,
    };

    const session = this.driver.session({ database: this.config.database });
    try {
      await session.executeWrite(async (tx) => {
        // Create or merge user
        await tx.run(`
          MERGE (u:User {id: $userId})
          SET u.lastActive = datetime()
        `, { userId: memory.userId });

        // Create or merge session
        await tx.run(`
          MERGE (s:Session {id: $sessionId})
          SET s.userId = $userId, s.lastActive = datetime()
        `, { sessionId: memory.sessionId, userId: memory.userId });

        // Create episodic memory node
        await tx.run(`
          CREATE (m:EpisodicMemory {
            id: $id,
            userId: $userId,
            sessionId: $sessionId,
            timestamp: datetime($timestamp),
            content: $content,
            context: $context,
            metadata: $metadata,
            relationships: $relationships
          })
        `, {
          id,
          userId: memory.userId,
          sessionId: memory.sessionId,
          timestamp: memory.timestamp.toISOString(),
          content: memory.content,
          context: JSON.stringify(memory.context),
          metadata: JSON.stringify(memory.metadata),
          relationships: JSON.stringify(memory.relationships)
        });

        // Create relationships
        await tx.run(`
          MATCH (m:EpisodicMemory {id: $id})
          MATCH (u:User {id: $userId})
          MATCH (s:Session {id: $sessionId})
          CREATE (u)-[:HAS_MEMORY]->(m)
          CREATE (s)-[:CONTAINS_MEMORY]->(m)
        `, { id, userId: memory.userId, sessionId: memory.sessionId });

        // Create sequence relationships if specified
        if (memory.relationships.previous) {
          await tx.run(`
            MATCH (m:EpisodicMemory {id: $id})
            MATCH (prev:EpisodicMemory {id: $previousId})
            CREATE (prev)-[:NEXT]->(m)
            CREATE (m)-[:PREVIOUS]->(prev)
          `, { id, previousId: memory.relationships.previous });
        }

        if (memory.relationships.next) {
          await tx.run(`
            MATCH (m:EpisodicMemory {id: $id})
            MATCH (next:EpisodicMemory {id: $nextId})
            CREATE (m)-[:NEXT]->(next)
            CREATE (next)-[:PREVIOUS]->(m)
          `, { id, nextId: memory.relationships.next });
        }

        // Create related memory relationships
        if (memory.relationships.related && memory.relationships.related.length > 0) {
          for (const relatedId of memory.relationships.related) {
            await tx.run(`
              MATCH (m:EpisodicMemory {id: $id})
              MATCH (related:EpisodicMemory {id: $relatedId})
              CREATE (m)-[:RELATED]->(related)
            `, { id, relatedId });
          }
        }
      });

      return episodicMemory;
    } finally {
      await session.close();
    }
  }

  async getEpisodicMemory(id: string): Promise<EpisodicMemory | null> {
    const session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.run(`
        MATCH (m:EpisodicMemory {id: $id})
        RETURN m
      `, { id });

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const memory = record.get('m').properties;

      return {
        id: memory.id,
        userId: memory.userId,
        sessionId: memory.sessionId,
        timestamp: new Date(memory.timestamp),
        content: memory.content,
        context: JSON.parse(memory.context),
        metadata: JSON.parse(memory.metadata),
        relationships: JSON.parse(memory.relationships)
      };
    } finally {
      await session.close();
    }
  }

  async searchEpisodicMemories(query: {
    userId: string;
    sessionId?: string;
    timeRange?: { start: Date; end: Date };
    tags?: string[];
    importance?: { min: number; max: number };
    limit?: number;
  }): Promise<EpisodicMemory[]> {
    const session = this.driver.session({ database: this.config.database });
    try {
      let cypher = `
        MATCH (m:EpisodicMemory {userId: $userId})
        WHERE 1=1
      `;
      const params: any = { userId: query.userId };

      if (query.sessionId) {
        cypher += ` AND m.sessionId = $sessionId`;
        params.sessionId = query.sessionId;
      }

      if (query.timeRange) {
        cypher += ` AND m.timestamp >= datetime($startTime) AND m.timestamp <= datetime($endTime)`;
        params.startTime = query.timeRange.start.toISOString();
        params.endTime = query.timeRange.end.toISOString();
      }

      if (query.tags && query.tags.length > 0) {
        cypher += ` AND ANY(tag IN $tags WHERE tag IN m.metadata.tags)`;
        params.tags = query.tags;
      }

      if (query.importance) {
        cypher += ` AND m.metadata.importance >= $minImportance AND m.metadata.importance <= $maxImportance`;
        params.minImportance = query.importance.min;
        params.maxImportance = query.importance.max;
      }

      cypher += ` ORDER BY m.timestamp DESC`;

      if (query.limit) {
        cypher += ` LIMIT ${parseInt(query.limit.toString(), 10)}`;
      }

      cypher += ` RETURN m`;

      const result = await session.run(cypher, params);

      return result.records.map(record => {
        const memory = record.get('m').properties;
        return {
          id: memory.id,
          userId: memory.userId,
          sessionId: memory.sessionId,
          timestamp: new Date(memory.timestamp),
          content: memory.content,
          context: JSON.parse(memory.context),
          metadata: JSON.parse(memory.metadata),
          relationships: JSON.parse(memory.relationships)
        };
      });
    } finally {
      await session.close();
    }
  }

  async updateEpisodicMemory(id: string, updates: Partial<EpisodicMemory>): Promise<EpisodicMemory> {
    const session = this.driver.session({ database: this.config.database });
    try {
      const setClauses: string[] = [];
      const params: any = { id };

      if (updates.content !== undefined) {
        setClauses.push('m.content = $content');
        params.content = updates.content;
      }

      if (updates.context !== undefined) {
        setClauses.push('m.context = $context');
        params.context = JSON.stringify(updates.context);
      }

      if (updates.metadata !== undefined) {
        setClauses.push('m.metadata = $metadata');
        params.metadata = JSON.stringify(updates.metadata);
      }

      if (updates.relationships !== undefined) {
        setClauses.push('m.relationships = $relationships');
        params.relationships = JSON.stringify(updates.relationships);
      }

      if (setClauses.length === 0) {
        throw new Error('No updates provided');
      }

      await session.run(`
        MATCH (m:EpisodicMemory {id: $id})
        SET ${setClauses.join(', ')}
        RETURN m
      `, params);

      const updated = await this.getEpisodicMemory(id);
      if (!updated) {
        throw new Error('Memory not found after update');
      }

      return updated;
    } finally {
      await session.close();
    }
  }

  async deleteEpisodicMemory(id: string): Promise<boolean> {
    const session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.run(`
        MATCH (m:EpisodicMemory {id: $id})
        DETACH DELETE m
        RETURN count(m) as deleted
      `, { id });

      return result.records[0].get('deleted').toNumber() > 0;
    } finally {
      await session.close();
    }
  }

  async getRelatedMemories(memoryId: string, relationshipType?: string): Promise<EpisodicMemory[]> {
    const session = this.driver.session({ database: this.config.database });
    try {
      let cypher = `
        MATCH (m:EpisodicMemory {id: $memoryId})-[r:RELATED|NEXT|PREVIOUS]->(related:EpisodicMemory)
      `;

      if (relationshipType) {
        cypher += ` WHERE type(r) = $relationshipType`;
      }

      cypher += ` RETURN related`;

      const result = await session.run(cypher, {
        memoryId,
        relationshipType: relationshipType || null
      });

      return result.records.map(record => {
        const memory = record.get('related').properties;
        return {
          id: memory.id,
          userId: memory.userId,
          sessionId: memory.sessionId,
          timestamp: new Date(memory.timestamp),
          content: memory.content,
          context: JSON.parse(memory.context),
          metadata: JSON.parse(memory.metadata),
          relationships: JSON.parse(memory.relationships)
        };
      });
    } finally {
      await session.close();
    }
  }

  async clearUserMemories(userId: string): Promise<boolean> {
    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(`
        MATCH (u:User {id: $userId})-[r:HAS_MEMORY]->(m:EpisodicMemory)
        DETACH DELETE m
      `, { userId });

      return true;
    } finally {
      await session.close();
    }
  }

  async clearSessionMemories(userId: string, sessionId: string): Promise<boolean> {
    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(`
        MATCH (m:EpisodicMemory {userId: $userId, sessionId: $sessionId})
        DETACH DELETE m
      `, { userId, sessionId });

      return true;
    } finally {
      await session.close();
    }
  }

  async getMemoryStats(userId: string): Promise<{
    count: number;
    oldest: Date | null;
    newest: Date | null;
  }> {
    const session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.run(`
        MATCH (m:EpisodicMemory {userId: $userId})
        RETURN
          count(m) as count,
          min(m.timestamp) as oldest,
          max(m.timestamp) as newest
      `, { userId });

      const record = result.records[0];
      return {
        count: record.get('count').toNumber(),
        oldest: record.get('oldest') ? new Date(record.get('oldest')) : null,
        newest: record.get('newest') ? new Date(record.get('newest')) : null
      };
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}
