import React from 'react';
import { DashboardView } from '../dashboard/DashboardView';
import { PageId } from '../layout/Navbar';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  return (
    <DashboardView
      onNavigate={(tab) => onNavigate(tab as PageId)}
      onOpenVoice={() => onNavigate('voice')}
    />
  );
};

export default DashboardPage;
