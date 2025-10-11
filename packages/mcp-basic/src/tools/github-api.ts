import { z } from 'zod';
import axios from 'axios';
import { ZodTool } from '../types';

const GitHubApiSchema = z.object({
  endpoint: z.enum([
    'user',
    'repos',
    'repo',
    'issues',
    'pulls',
    'commits',
    'search/repositories',
    'search/users',
    'search/issues'
  ]),
  username: z.string().optional(),
  repo: z.string().optional(),
  query: z.string().optional(),
  perPage: z.number().min(1).max(100).default(10),
  page: z.number().min(1).default(1),
  token: z.string().optional().describe('GitHub personal access token (optional)'),
});

const GitHubApiOutputSchema = z.object({
  data: z.any(),
  status: z.number(),
  headers: z.record(z.any()),
  endpoint: z.string(),
  timestamp: z.string(),
  error: z.boolean().optional(),
});

export const githubApiTool: ZodTool = {
  name: 'github_api',
  description: 'Interact with GitHub API to get user info, repositories, issues, and more',
  inputSchema: GitHubApiSchema,
  outputSchema: GitHubApiOutputSchema,
  execute: async (args: z.infer<typeof GitHubApiSchema>) => {
    const { endpoint, username, repo, query, perPage, page, token } = GitHubApiSchema.parse(args);
    
    try {
      let url = `https://api.github.com/${endpoint}`;
      
      // Build URL based on endpoint
      if (endpoint === 'user' && username) {
        url = `https://api.github.com/users/${username}`;
      } else if (endpoint === 'repos' && username) {
        url = `https://api.github.com/users/${username}/repos`;
      } else if (endpoint === 'repo' && username && repo) {
        url = `https://api.github.com/repos/${username}/${repo}`;
      } else if (endpoint === 'issues' && username && repo) {
        url = `https://api.github.com/repos/${username}/${repo}/issues`;
      } else if (endpoint === 'pulls' && username && repo) {
        url = `https://api.github.com/repos/${username}/${repo}/pulls`;
      } else if (endpoint === 'commits' && username && repo) {
        url = `https://api.github.com/repos/${username}/${repo}/commits`;
      }
      
      // Add query parameters
      const params: any = {
        per_page: perPage,
        page: page,
      };
      
      if (query) {
        params.q = query;
      }
      
      const headers: any = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Clear-AI-Bot/1.0',
      };
      
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }
      
      const response = await axios.get(url, {
        params,
        headers,
        timeout: 10000,
      });
      
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        endpoint,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response) {
        return {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
          endpoint,
          timestamp: new Date().toISOString(),
          error: true,
        };
      }
      throw new Error(`GitHub API call failed: ${error.message}`);
    }
  },
};
