// lib/prompts.ts
/**
 * Centralized utility for managing AI prompts from Supabase
 * All AI prompts are stored in the database with version control
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Error thrown when a prompt cannot be retrieved
 */
export class PromptNotFoundError extends Error {
  constructor(promptName: string) {
    super(`AI tool is currently unavailable. Prompt '${promptName}' not found in database.`);
    this.name = 'PromptNotFoundError';
  }
}

/**
 * Error thrown when database connection fails
 */
export class PromptDatabaseError extends Error {
  constructor(message: string) {
    super(`AI tool is currently unavailable. Database error: ${message}`);
    this.name = 'PromptDatabaseError';
  }
}

/**
 * Interface for prompt data from database
 */
interface PromptData {
  id: string;
  name: string;
  description: string;
  prompt_text: string;
  variables: string[] | null;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

/**
 * Cache to store frequently used prompts (optional optimization)
 */
const promptCache = new Map<string, { data: PromptData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches a prompt from the database by name
 * 
 * @param promptName - The unique name of the prompt (e.g., 'cv_analysis_combined')
 * @param useCache - Whether to use cached version (default: true)
 * @returns The prompt template text with ${variable} placeholders
 * @throws PromptNotFoundError if prompt doesn't exist or is inactive
 * @throws PromptDatabaseError if database query fails
 */
export async function getPrompt(
  promptName: string, 
  useCache: boolean = true
): Promise<string> {
  try {
    // Check cache first
    if (useCache) {
      const cached = promptCache.get(promptName);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Prompts] Using cached prompt: ${promptName}`);
        return cached.data.prompt_text;
      }
    }

    console.log(`[Prompts] Fetching prompt from database: ${promptName}`);

    // Fetch from database
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', promptName)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`[Prompts] Database error for '${promptName}':`, error);
      throw new PromptDatabaseError(error.message);
    }

    if (!data) {
      console.error(`[Prompts] Prompt not found: ${promptName}`);
      throw new PromptNotFoundError(promptName);
    }

    // Cache the result
    promptCache.set(promptName, {
      data: data as PromptData,
      timestamp: Date.now()
    });

    console.log(`[Prompts] Successfully loaded prompt: ${promptName} (v${data.version})`);
    return data.prompt_text;

  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error(`[Prompts] Unexpected error fetching prompt '${promptName}':`, error);
    throw new PromptDatabaseError('Unexpected error occurred');
  }
}

/**
 * Fetches multiple prompts at once for better performance
 * 
 * @param promptNames - Array of prompt names to fetch
 * @returns Object mapping prompt names to their template text
 * @throws PromptDatabaseError if any prompt fails to load
 */
export async function getPrompts(promptNames: string[]): Promise<Record<string, string>> {
  try {
    console.log(`[Prompts] Fetching ${promptNames.length} prompts:`, promptNames);

    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .in('name', promptNames)
      .eq('is_active', true);

    if (error) {
      console.error('[Prompts] Database error fetching multiple prompts:', error);
      throw new PromptDatabaseError(error.message);
    }

    if (!data || data.length === 0) {
      throw new PromptDatabaseError('No prompts found');
    }

    // Check if all requested prompts were found
    const foundNames = new Set(data.map(p => p.name));
    const missingPrompts = promptNames.filter(name => !foundNames.has(name));
    
    if (missingPrompts.length > 0) {
      throw new PromptNotFoundError(missingPrompts.join(', '));
    }

    // Create result object and cache
    const result: Record<string, string> = {};
    data.forEach((prompt: PromptData) => {
      result[prompt.name] = prompt.prompt_text;
      
      // Cache individual prompts
      promptCache.set(prompt.name, {
        data: prompt,
        timestamp: Date.now()
      });
    });

    console.log(`[Prompts] Successfully loaded ${data.length} prompts`);
    return result;

  } catch (error) {
    if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
      throw error;
    }
    
    console.error('[Prompts] Unexpected error fetching multiple prompts:', error);
    throw new PromptDatabaseError('Unexpected error occurred');
  }
}

/**
 * Replaces ${variable} or {{variable}} placeholders in a prompt template with actual values
 *
 * @param template - The prompt template with ${variable} and/or {{variable}} placeholders
 * @param variables - Object containing variable values
 * @returns Prompt with all variables replaced
 *
 * @example
 * const prompt = await getPrompt('cv_analysis_combined');
 * const filled = fillPromptVariables(prompt, {
 *   cvText: "John Doe's CV...",
 *   jobDescription: "Senior Developer position..."
 * });
 */
export function fillPromptVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;

  // Replace each ${variable} and {{variable}} with its value.
  // Prompts stored in the database are not consistent about which
  // placeholder style they use, so both are supported.
  Object.entries(variables).forEach(([key, value]) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const dollarPattern = new RegExp(`\\$\\{${escapedKey}\\}`, 'g');
    const curlyPattern = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g');
    const stringValue = String(value);
    result = result.replace(dollarPattern, stringValue).replace(curlyPattern, stringValue);
  });

  return result;
}

/**
 * Clears the prompt cache (useful for testing or forcing refresh)
 */
export function clearPromptCache(): void {
  promptCache.clear();
  console.log('[Prompts] Cache cleared');
}

/**
 * Gets prompt metadata without caching (useful for admin purposes)
 * 
 * @param promptName - The unique name of the prompt
 * @returns Full prompt metadata including version, dates, etc.
 */
export async function getPromptMetadata(promptName: string): Promise<PromptData | null> {
  try {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', promptName)
      .single();

    if (error || !data) {
      return null;
    }

    return data as PromptData;
  } catch (error) {
    console.error(`[Prompts] Error fetching metadata for '${promptName}':`, error);
    return null;
  }
}

/**
 * Lists all available active prompts
 * 
 * @returns Array of prompt names and descriptions
 */
export async function listPrompts(): Promise<Array<{ name: string; description: string; version: number }>> {
  try {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('name, description, version')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new PromptDatabaseError(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('[Prompts] Error listing prompts:', error);
    return [];
  }
}