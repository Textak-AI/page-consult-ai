import { ReactNode, useState } from 'react';
import { useAIActions, AIActionType } from '@/hooks/useAIActions';
import { ActionConfirmModal, ZeroBalanceModal } from '@/components/usage';

interface CreditGateProps {
  children: ReactNode;
  requiredCredits: number;
  actionType: AIActionType;
  actionDescription?: string;
  pageId?: string;
  sectionType?: string;
  onInsufficientCredits?: () => void;
  onAction?: () => Promise<void> | void;
  userId: string | null;
  disabled?: boolean;
}

export function CreditGate({
  children,
  requiredCredits,
  actionType,
  actionDescription,
  pageId,
  sectionType,
  onInsufficientCredits,
  onAction,
  userId,
  disabled = false,
}: CreditGateProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showZeroBalanceModal, setShowZeroBalanceModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    available,
    isUnlimited,
    trackAction,
    requestGraceActions,
    dontShowConfirm,
    setDontShowConfirm,
    usage,
  } = useAIActions(userId);

  const canAfford = isUnlimited || available >= requiredCredits;

  const handleClick = async () => {
    if (disabled || isProcessing) return;

    // Unlimited users bypass all checks
    if (isUnlimited) {
      await trackAction(actionType, pageId, sectionType);
      onAction?.();
      return;
    }

    // Check if user can afford the action
    if (!canAfford) {
      setShowZeroBalanceModal(true);
      onInsufficientCredits?.();
      return;
    }

    // If user has opted to skip confirmation
    if (dontShowConfirm) {
      setIsProcessing(true);
      const result = await trackAction(actionType, pageId, sectionType);
      if (result.allowed) {
        await onAction?.();
      }
      setIsProcessing(false);
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    setShowConfirmModal(false);
    
    const result = await trackAction(actionType, pageId, sectionType);
    if (result.allowed) {
      await onAction?.();
    } else {
      setShowZeroBalanceModal(true);
    }
    
    setIsProcessing(false);
  };

  // Clone children and attach onClick handler
  const childrenWithProps = (
    <div onClick={handleClick} className={disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}>
      {children}
    </div>
  );

  return (
    <>
      {childrenWithProps}
      
      <ActionConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        actionType={actionType}
        actionCost={requiredCredits}
        remaining={available}
        onConfirm={handleConfirm}
        dontShowAgain={dontShowConfirm}
        onDontShowAgainChange={setDontShowConfirm}
      />
      
      <ZeroBalanceModal
        isOpen={showZeroBalanceModal}
        onClose={() => setShowZeroBalanceModal(false)}
        graceAlreadyUsed={usage?.grace_actions_given ?? false}
        onRequestGrace={requestGraceActions}
      />
    </>
  );
}

export default CreditGate;
