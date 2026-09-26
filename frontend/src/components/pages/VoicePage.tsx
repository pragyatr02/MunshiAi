import React from 'react';
import { VoiceTransactionView } from '../voice/VoiceTransactionView';
import { PageId } from '../layout/Navbar';

interface VoicePageProps {
  onNavigate: (page: PageId) => void;
  preloadedCustomerName?: string;
}

export const VoicePage: React.FC<VoicePageProps> = ({ onNavigate }) => {
  return (
    <VoiceTransactionView
      onNavigateToLedger={() => onNavigate('transactions')}
    />
  );
};

export default VoicePage;
