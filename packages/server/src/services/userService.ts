import { User } from '@clear-ai/shared'

// In-memory storage for demo purposes
// In a real application, you would use a database
let users: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
  {
    id: '3',
    email: 'bob.johnson@example.com',
    name: 'Bob Johnson',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
  },
  {
    id: '4',
    email: 'alice.brown@example.com',
    name: 'Alice Brown',
    createdAt: new Date('2023-01-04'),
    updatedAt: new Date('2023-01-04'),
  },
  {
    id: '5',
    email: 'charlie.wilson@example.com',
    name: 'Charlie Wilson',
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05'),
  },
]

export const userService = {
  async getAllUsers(): Promise<User[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...users]
  },

  async getUserById(id: string): Promise<User | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    const user = users.find(u => u.id === id)
    return user || null
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const now = new Date()
    const newUser: User = {
      ...userData,
      id: (users.length + 1).toString(),
      createdAt: now,
      updatedAt: now,
    }
    
    users.push(newUser)
    return newUser
  },

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const userIndex = users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return null
    }
    
    const existingUser = users[userIndex]!
    const updatedUser: User = {
      id: existingUser.id,
      email: userData.email || existingUser.email,
      name: userData.name || existingUser.name,
      createdAt: existingUser.createdAt,
      updatedAt: new Date(),
    }
    
    users[userIndex] = updatedUser
    return updatedUser
  },

  async deleteUser(id: string): Promise<boolean> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const userIndex = users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return false
    }
    
    users.splice(userIndex, 1)
    return true
  },

  async getUserByEmail(email: string): Promise<User | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    const user = users.find(u => u.email === email)
    return user || null
  },
}
