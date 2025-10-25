import { useState } from 'react';
import LeftPanel from './components/LeftPanel.jsx';
import RightPanel from './components/RightPanel.jsx';
import './App.css';

// Mock data
const mockAnalysisResult = {
  overallScore: 78,
  summary: "This property offers good potential with wide hallways and a modern kitchen but has significant barriers at the main entrance and in the primary bathroom that require attention.",
  flags: {
    greenFlags: ["No interior steps on main floor", "Countertops at standard height", "Wide hallways"],
    redFlags: ["Steps at main entrance", "Narrow bathroom doorway", "High-pile carpet in living room"]
  },
  details: {
    entrances: [
      { id: 1, name: "Step-Free Entry", status: "fail", description: "3 steps detected at the front door." },
      { id: 2, name: "Doorway Width", status: "pass", description: "Front door estimated at 36 inches." }
    ],
    interior: [
      { id: 3, name: "Hallway Width", status: "pass", description: "Hallways appear to be over 40 inches wide." },
      { id: 4, name: "Interior Door Width", status: "warn", description: "Most doors seem adequate, but bathroom door may be under 32 inches." }
    ],
    kitchen: [
      { id: 5, name: "Countertop Height", status: "pass", description: "Counters are at a standard 34-inch height." },
      { id: 6, name: "Appliance Accessibility", status: "pass", description: "Front-facing controls on oven and microwave." }
    ],
    bathroom: [
      { id: 7, name: "Roll-in Shower", status: "fail", description: "Standard tub/shower combo detected." },
      { id: 8, name: "Grab Bar Potential", status: "warn", description: "No grab bars present, but wall structure appears suitable for installation." }
    ]
  },
  images: [
    {
      url: "https://via.placeholder.com/800x600/cccccc/000000?text=Front+of+House",
      annotations: [
        { label: "Stairs", box: { top: '70%', left: '40%', width: '20%', height: '15%' }, color: 'red' }
      ]
    },
    {
      url: "https://via.placeholder.com/800x600/cccccc/000000?text=Kitchen",
      annotations: [
        { label: "Standard Countertop", box: { top: '60%', left: '10%', width: '80%', height: '10%' }, color: 'green' }
      ]
    },
    {
      url: "https://via.placeholder.com/800x600/cccccc/000000?text=Bathroom",
      annotations: [
        { label: "Narrow Doorway", box: { top: '15%', left: '20%', width: '15%', height: '70%' }, color: 'orange' },
        { label: "Tub/Shower", box: { top: '50%', left: '50%', width: '45%', height: '40%' }, color: 'red' }
      ]
    }
  ]
};

function App() {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyze = () => {
    if (!urlInput.trim()) {
      alert('Please enter a valid URL');
      return;
    }
    
    setIsLoading(true);
    setAnalysisResult(null);
    
    // Simulate API call
    setTimeout(() => {
      setAnalysisResult(mockAnalysisResult);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AccessiHome
          </h1>
          <p className="text-center text-gray-600 mt-2">Your AI-Powered Home Accessibility Analyzer</p>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste a Zillow or Redfin URL here..."
              className="flex-grow p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center mt-12">
            <div className="inline-block">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-600 mt-4 font-medium">Analyzing property accessibility...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment while we process the images</p>
            </div>
          </div>
        )}

        {analysisResult && !isLoading && (
          <div className="mt-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                <LeftPanel analysis={analysisResult} />
              </div>
              <div className="lg:col-span-3">
                <RightPanel images={analysisResult.images} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 py-6 bg-white border-t border-gray-200">
        <p className="text-center text-gray-500 text-sm">
          © 2025 AccessiHome - Making homes accessible for everyone
        </p>
      </footer>
    </div>
  );
}

export default App;

