import { useState } from 'react';

const LeftPanel = ({ analysis }) => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'bg-green-500';
      case 'fail':
        return 'bg-red-500';
      case 'warn':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return '✓';
      case 'fail':
        return '✗';
      case 'warn':
        return '!';
      default:
        return '?';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Overall Score Section */}
      <div className="mb-6 text-center">
        <div className="relative inline-block">
          <svg className="w-32 h-32" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={analysis.overallScore >= 80 ? '#10b981' : analysis.overallScore >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="3"
              strokeDasharray={`${analysis.overallScore}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{analysis.overallScore}</span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mt-4">Accessibility Score</h2>
      </div>

      {/* Summary Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2 uppercase tracking-wide">Summary</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Flags Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Key Findings</h3>
        
        {/* Green Flags */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 text-xl">✓</span>
            <h4 className="font-semibold text-green-800">Positive Features</h4>
          </div>
          <ul className="space-y-2">
            {analysis.flags.greenFlags.map((flag, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Red Flags */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 text-xl">✗</span>
            <h4 className="font-semibold text-red-800">Accessibility Barriers</h4>
          </div>
          <ul className="space-y-2">
            {analysis.flags.redFlags.map((flag, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Analysis Accordion */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Analysis</h3>
        
        {/* Entrances & Exterior */}
        <AccordionSection
          title="Entrances & Exterior Pathways"
          isOpen={openSection === 'entrances'}
          onToggle={() => toggleSection('entrances')}
        >
          {analysis.details.entrances.map((item) => (
            <DetailItem
              key={item.id}
              item={item}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </AccordionSection>

        {/* Interior Doors & Hallways */}
        <AccordionSection
          title="Interior Doors & Hallways"
          isOpen={openSection === 'interior'}
          onToggle={() => toggleSection('interior')}
        >
          {analysis.details.interior.map((item) => (
            <DetailItem
              key={item.id}
              item={item}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </AccordionSection>

        {/* Kitchen */}
        <AccordionSection
          title="Kitchen"
          isOpen={openSection === 'kitchen'}
          onToggle={() => toggleSection('kitchen')}
        >
          {analysis.details.kitchen.map((item) => (
            <DetailItem
              key={item.id}
              item={item}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </AccordionSection>

        {/* Bathroom */}
        <AccordionSection
          title="Bathroom"
          isOpen={openSection === 'bathroom'}
          onToggle={() => toggleSection('bathroom')}
        >
          {analysis.details.bathroom.map((item) => (
            <DetailItem
              key={item.id}
              item={item}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </AccordionSection>
      </div>
    </div>
  );
};

// Accordion Section Component
const AccordionSection = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-800">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-white space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

// Detail Item Component with Tooltip
const DetailItem = ({ item, getStatusColor, getStatusIcon }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${getStatusColor(item.status)} flex items-center justify-center text-white text-xs font-bold`}>
        {getStatusIcon(item.status)}
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800 text-sm">{item.name}</span>
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {showTooltip && (
          <div className="mt-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
            {item.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;

