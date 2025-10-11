import * as fs from "fs"
import * as path from "path"

// Simple color functions without external dependencies
const colors = {
  blue: (msg: string) => `\x1b[34m${msg}\x1b[0m`,
  yellow: (msg: string) => `\x1b[33m${msg}\x1b[0m`,
  red: (msg: string) => `\x1b[31m${msg}\x1b[0m`,
  green: (msg: string) => `\x1b[32m${msg}\x1b[0m`,
  gray: (msg: string) => `\x1b[90m${msg}\x1b[0m`,
}

const LOG_DIR = path.resolve(process.cwd(), "logs")
const LOG_FILE = path.join(LOG_DIR, "app.log")

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR)
}

function getTimestamp() {
  return new Date().toISOString()
}

function writeToFile(level: string, message: string) {
  // Skip writing logs to file if running on Vercel or in production
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return
  }
  const logLine = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}\n`
  try {
    fs.appendFileSync(LOG_FILE, logLine)
  } catch (err) {
    // Silently ignore file system errors (e.g., no write permission)
  }
}

export const logger = {
  info: (msg: string, ...args: any[]) => {
    const message = args.length ? `${msg} ${JSON.stringify(args)}` : msg
    console.log(colors.blue(`[INFO]`), colors.gray(getTimestamp()), message)
    writeToFile("info", message)
  },
  warn: (msg: string, ...args: any[]) => {
    const message = args.length ? `${msg} ${JSON.stringify(args)}` : msg
    console.warn(colors.yellow(`[WARN]`), colors.gray(getTimestamp()), message)
    writeToFile("warn", message)
  },
  error: (msg: string, ...args: any[]) => {
    const message = args.length ? `${msg} ${JSON.stringify(args)}` : msg
    console.error(colors.red(`[ERROR]`), colors.gray(getTimestamp()), message)
    writeToFile("error", message)
  },
  debug: (msg: string, ...args: any[]) => {
    const message = args.length ? `${msg} ${JSON.stringify(args)}` : msg
    console.debug(colors.green(`[DEBUG]`), colors.gray(getTimestamp()), message)
    writeToFile("debug", message)
  },
}
