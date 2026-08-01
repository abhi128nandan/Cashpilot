import { requireAuth } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import ChatClient from './chat-client';

export default async function ChatPage() {
  await requireAuth();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';

  return <ChatClient userName={userName} />;
}
