// Common utility functions
import { jsonrepair } from 'jsonrepair';

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Robust JSON parser that can handle various formats from different LLM providers
 * Supports JSON in markdown code blocks, partial responses, and malformed JSON
 */
export const parseLLMJsonResponse = <T = any>(content: string): { success: true; data: T } | { success: false; error: string; attempts: string[] } => {
  const attempts: string[] = [];

  // Strategy 1: Try direct parsing first
  try {
    const parsed = JSON.parse(content.trim());
    attempts.push('Direct JSON.parse succeeded');
    return { success: true, data: parsed };
  } catch {
    attempts.push('Direct JSON.parse failed');
  }

  // Strategy 2: Extract JSON from markdown code blocks
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g;
  const codeBlockMatches = [...content.matchAll(codeBlockRegex)];

  for (const match of codeBlockMatches) {
    try {
      const jsonContent = match[1].trim();
      const parsed = JSON.parse(jsonContent);
      attempts.push(`JSON code block parsing succeeded: ${match[0].substring(0, 50)}...`);
      return { success: true, data: parsed };
    } catch {
      attempts.push(`JSON code block parsing failed: ${match[0].substring(0, 50)}...`);
    }
  }

  // Strategy 3: Find JSON-like content using improved regex
  const jsonRegex = /\{(?:[^{}]|{[^{}]*})*\}/gs;
  const jsonMatches = [...content.matchAll(jsonRegex)];

  for (const match of jsonMatches) {
    try {
      const jsonContent = match[0].trim();
      const parsed = JSON.parse(jsonContent);
      attempts.push(`Regex JSON extraction succeeded: ${jsonContent.substring(0, 50)}...`);
      return { success: true, data: parsed };
    } catch {
      attempts.push(`Regex JSON extraction failed: ${match[0].substring(0, 50)}...`);
    }
  }

  // Strategy 4: Use jsonrepair for malformed JSON
  try {
    const repaired = jsonrepair(content);
    const parsed = JSON.parse(repaired);
    attempts.push('jsonrepair succeeded');
    return { success: true, data: parsed };
  } catch {
    attempts.push('jsonrepair failed');
  }

  // Strategy 5: Clean up common issues and try again
  let cleanedContent = content
    // Remove common prefixes
    .replace(/^(Response|Answer|JSON|Output|Result):\s*/i, '')
    // Remove trailing commas before closing braces/brackets
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix unquoted keys (basic heuristic)
    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
    // Remove extra whitespace
    .trim();

  try {
    const parsed = JSON.parse(cleanedContent);
    attempts.push('Cleaned content parsing succeeded');
    return { success: true, data: parsed };
  } catch {
    attempts.push('Cleaned content parsing failed');
  }

  // Strategy 6: Try jsonrepair on cleaned content
  try {
    const repaired = jsonrepair(cleanedContent);
    const parsed = JSON.parse(repaired);
    attempts.push('jsonrepair on cleaned content succeeded');
    return { success: true, data: parsed };
  } catch {
    attempts.push('jsonrepair on cleaned content failed');
  }

  return {
    success: false,
    error: 'Failed to parse JSON from LLM response after trying multiple strategies',
    attempts
  };
};
