import { cn } from '@/lib/utils';
import { CompanionMessage as CompanionMessageType } from '@/contexts/CompanionContext';
import { format } from 'date-fns';

interface CompanionMessageProps {
  message: CompanionMessageType;
}

export function CompanionMessage({ message }: CompanionMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex w-full mb-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm",
        isUser 
          ? "bg-cyan-600 text-white rounded-br-md" 
          : "bg-slate-700 text-slate-100 rounded-bl-md"
      )}>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span className={cn(
          "text-[10px] mt-1 block",
          isUser ? "text-cyan-200" : "text-slate-400"
        )}>
          {format(message.timestamp, 'h:mm a')}
        </span>
      </div>
    </div>
  );
}
