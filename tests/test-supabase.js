import dotenv from 'dotenv';
import crypto from 'node:crypto';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

async function testInsert() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL 또는 Key가 설정되지 않았습니다.');
    return;
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/sentiment_logs`;
  const inputHash = crypto.createHash('sha256').update('테스트 문장입니다.', 'utf8').digest('hex');

  const payload = {
    input_text: '테스트 문장입니다.',
    sentiment: 'positive',
    confidence: 90,
    reason: '테스트 이유입니다.',
    input_hash: inputHash
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    const status = res.status;
    const text = await res.text();
    console.log('HTTP Status:', status);
    console.log('Response body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testInsert();

