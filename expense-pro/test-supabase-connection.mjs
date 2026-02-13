import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Function to load env from .env.local manually for this script
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) {
        console.error('.env.local not found')
        return {}
    }
    const content = fs.readFileSync(envPath, 'utf8')
    const config = {}
    content.split('\n').forEach(line => {
        const parts = line.split('=')
        if (parts.length >= 2) {
            const key = parts[0].trim()
            const value = parts.slice(1).join('=').trim()
            if (key) config[key] = value
        }
    })
    return config
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

console.log(`Connecting to: ${supabaseUrl}`)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    try {
        // Try to fetch something simple - like the auth config
        // or just a fetch to the REST endpoint
        const { data, error } = await supabase.from('_metadata').select('*').limit(1)
        
        // Even if the table doesn't exist, a 401/404 from Supabase is better than "Failed to fetch" (DNS error)
        console.log('Testing network connection...')
        
        const response = await fetch(`${supabaseUrl}/auth/v1/health`)
        if (response.ok) {
            console.log('✅ Success: Supabase Auth server is reachable!')
        } else {
            console.log(`❌ Auth Health Check Status: ${response.status}`)
        }

        const settingsResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseAnonKey
            }
        })
        
        if (settingsResponse.ok) {
            console.log('✅ Success: Supabase REST server is reachable!')
        } else {
            console.log(`❌ REST Check Status: ${settingsResponse.status}`)
        }

    } catch (err) {
        console.error('❌ Connection Failed:', err.message)
        if (err.message.includes('ENOTFOUND') || err.message.includes('EAI_AGAIN')) {
            console.error('Check if the URL is correct and you have internet connection.')
        }
    }
}

testConnection()
