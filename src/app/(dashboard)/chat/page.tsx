import { requireAuth } from '@/lib/auth/guard';
import { AICopilotContainer } from '@/components/features/dashboard/ai-copilot-container';
import styles from './page.module.css';
import { createClient } from '@/lib/supabase/server';

export default async function ChatPage() {
  await requireAuth();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';

  return (
    <div className={styles.page}>
      <div className={styles.copilotWrapper}>
        <AICopilotContainer 
          context={{ page: 'chat' }} 
          userName={userName}
        />
      </div>
    </div>
  );
}
