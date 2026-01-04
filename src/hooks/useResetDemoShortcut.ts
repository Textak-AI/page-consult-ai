import { useEffect } from 'react';
import { toast } from 'sonner';

export const useResetDemoShortcut = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Option/Alt + R to reset demo
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        
        // Clear all demo state
        const keysToRemove = [
          'pageconsult_demo_state',
          'pageconsult_demo_content',
          'pageconsult_demo_conversation',
          'pageconsult_demo_extracted',
          'pageconsult_demo_timestamp',
          'pageconsult_personalized_content',
          'pageconsult_demo_completed_session',
          'pageconsult_page_loaded',
        ];
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          } catch {}
        });
        
        console.log('🔄 Demo state reset via Alt+R');
        
        toast.success('Demo reset! Starting fresh...');
        setTimeout(() => window.location.reload(), 500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
