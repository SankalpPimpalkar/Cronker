import { NextResponse } from 'next/server'
import { createClient } from '@/configs/supabase.server'

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.redirect(new URL('/', request.url))
}
