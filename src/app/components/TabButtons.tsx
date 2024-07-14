import React from 'react';

interface TabButtonsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabButtons: React.FC<TabButtonsProps> = ({ activeTab, setActiveTab }) => (
  <div className="flex mb-4">
    <button onClick={() => setActiveTab('Make')} className={`mr-2 px-4 py-2 ${activeTab === 'Make' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
      Make
    </button>
    <button onClick={() => setActiveTab('Take')} className={`px-4 py-2 ${activeTab === 'Take' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
      Take
    </button>
    <button onClick={() => setActiveTab('Close')} className={`px-4 py-2 ${activeTab === 'Close' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
      Close
    </button>
  </div>
);

export default TabButtons;
