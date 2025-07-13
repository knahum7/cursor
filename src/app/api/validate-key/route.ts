import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(req: NextRequest) {
  const { apiKey } = await req.json();

  if (!apiKey) {
    return NextResponse.json({ valid: false, error: 'API key required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('id')
    .eq('value', apiKey)
    .single();
    
  if (error || !data) {
    return NextResponse.json({ valid: false }, { status: 200 });
  }
  
  return NextResponse.json({ valid: true }, { status: 200 });
} 