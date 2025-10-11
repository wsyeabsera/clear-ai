import { z } from 'zod';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { ZodTool } from '../types';

const FileReaderSchema = z.object({
  path: z.string({ required_error: 'File path is required' }),
  encoding: z.enum(['utf8', 'ascii', 'base64']).default('utf8'),
  operation: z.enum(['read', 'list', 'info']).default('read'),
});

const FileReaderOutputSchema = z.union([
  // For 'read' operation
  z.object({
    path: z.string(),
    content: z.string(),
    encoding: z.string(),
    size: z.number(),
  }),
  // For 'list' operation
  z.object({
    path: z.string(),
    items: z.array(z.object({
      name: z.string(),
      path: z.string(),
      isDirectory: z.boolean(),
      isFile: z.boolean(),
      size: z.number(),
      modified: z.date(),
    })),
  }),
  // For 'info' operation
  z.object({
    path: z.string(),
    isDirectory: z.boolean(),
    isFile: z.boolean(),
    size: z.number(),
    created: z.date(),
    modified: z.date(),
    accessed: z.date(),
  }),
]);

export const fileReaderTool: ZodTool = {
  name: 'file_reader',
  description: 'Read files, list directories, or get file information',
  inputSchema: FileReaderSchema,
  outputSchema: FileReaderOutputSchema,
  execute: async (args: z.infer<typeof FileReaderSchema>) => {
    const { path, encoding, operation } = FileReaderSchema.parse(args);
    
    try {
      switch (operation) {
        case 'read': {
          const content = await readFile(path, encoding);
          return {
            path,
            content,
            encoding,
            size: (await stat(path)).size,
          };
        }
        
        case 'list': {
          const items = await readdir(path);
          const itemDetails = await Promise.all(
            items.map(async (item) => {
              const itemPath = join(path, item);
              const stats = await stat(itemPath);
              return {
                name: item,
                path: itemPath,
                isDirectory: stats.isDirectory(),
                isFile: stats.isFile(),
                size: stats.size,
                modified: stats.mtime,
              };
            })
          );
          return {
            path,
            items: itemDetails,
          };
        }
        
        case 'info': {
          const stats = await stat(path);
          return {
            path,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            accessed: stats.atime,
          };
        }
        
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`File or directory not found: ${path}`);
      }
      if (error.code === 'EACCES') {
        throw new Error(`Permission denied: ${path}`);
      }
      throw new Error(`File operation failed: ${error.message}`);
    }
  },
};
