// Import themes from their individual folders
import { defaultTheme } from './default';
import { neowaveTheme } from './neowave';
import { technoTheme } from './techno';
import { oldschoolTheme } from './oldschool';
import { alienTheme } from './alien';

// Export themes registry
export const themes: Record<string, typeof defaultTheme> = {
  default: defaultTheme,
  neowave: neowaveTheme,
  techno: technoTheme,
  oldschool: oldschoolTheme,
  alien: alienTheme,
};
