"use client";

export default function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">환경 변수 테스트</h1>
      
      <div className="space-y-4">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          <p className="text-sm text-gray-600 break-all">
            {process.env.NEXT_PUBLIC_SUPABASE_URL || '설정되지 않음'}
          </p>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
          <p className="text-sm text-gray-600 break-all">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
              `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50)}...` : 
              '설정되지 않음'}
          </p>
        </div>
        
        <div>
          <strong>SUPABASE_SERVICE_ROLE_KEY:</strong>
          <p className="text-sm text-gray-600 break-all">
            {process.env.SUPABASE_SERVICE_ROLE_KEY ? 
              `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 50)}...` : 
              '설정되지 않음'}
          </p>
        </div>
      </div>
    </div>
  );
} 