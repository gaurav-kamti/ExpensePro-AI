import { createClient } from './client'

export type Expense = {
    id: number
    user_id?: string
    amount: number
    type: 'expense' | 'income'
    category: string
    subcategory?: string
    currency: string
    date: string
    advice?: string
    created_at?: string
}

export async function syncExpenses(expenses: Expense[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Perform an upsert (update if exists, else insert)
    const { data, error } = await supabase
        .from('expenses')
        .upsert(
            expenses.map(e => ({
                ...e,
                user_id: user.id,
                // Ensure id is treatable by Postgres (if it's a numeric ID from Date.now())
            })),
            { onConflict: 'id' }
        )

    if (error) {
        console.error('Sync Error:', error)
        return { error }
    }

    return data
}

export async function fetchCloudExpenses() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

    if (error) {
        console.error('Fetch Error:', error)
        return []
    }

    return data as Expense[]
}
