const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('⚠️ [Supabase] SUPABASE_URL chưa được cấu hình trong .env');
}

// Client quản trị tối cao (Service Role) - Dùng an toàn trên Backend Server (Bypass RLS, Storage Admin)
const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || supabaseAnonKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Client tiêu chuẩn (sử dụng Anon Key nếu cần hoặc fallback sang Service Key)
const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || supabaseServiceKey || ''
);

module.exports = {
  supabase,
  supabaseAdmin,
};