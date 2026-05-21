import pg from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const { Pool } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const caPath = path.join(__dirname, '../certs/ca.pem')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: fs.readFileSync(caPath, 'utf8'),
  },
})

export default pool