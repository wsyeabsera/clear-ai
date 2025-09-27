import fs from "fs"
import path from "path"
import chalkImport from "chalk"

const chalk = chalkImport ?? {
  blue: (msg: string) => msg,
  yellow: (msg: string) => msg,
  red: (msg: string) => msg,
  green: (msg: string) => msg,
  gray: (msg: string) => msg,
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
    console.log(chalk.blue(`[INFO]`), chalk.gray(getTimestamp()), message)
    writeToFile("info", message)
  },
  warn: (msg: string, ...args: any[]) => {
    const message = args.length ? `${msg} ${JSON.stringify(args)}` : msg
    console.warn(chalk.yellow(`[WARN]`), chalk.gray(getTimestamp()), message)
    writeToFile("warn", message)
  },
  error: (msg: string, ...args: any[]) => {
    const message = args.length ? `${msg} ${JSON.stringify(args)}` : msg
    console.error(chalk.red(`[ERROR]`), chalk.gray(getTimestamp()), message)
    writeToFile("error", message)
  },
  debug: (msg: string, ...args: any[]) => {
    const message = args.length ? `${msg} ${JSON.stringify(args)}` : msg
    console.debug(chalk.green(`[DEBUG]`), chalk.gray(getTimestamp()), message)
    writeToFile("debug", message)
  },
}
