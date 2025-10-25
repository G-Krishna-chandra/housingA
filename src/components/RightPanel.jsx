import { useState } from 'react';

const RightPanel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);

  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setHoveredAnnotation(null);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setHoveredAnnotation(null);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
    setHoveredAnnotation(null);
  };

  const getAnnotationBorderColor = (color) => {
    const colorMap = {
      red: 'border-red-500',
      green: 'border-green-500',
      orange: 'border-orange-500',
      yellow: 'border-yellow-500',
      blue: 'border-blue-500',
    };
    return colorMap[color] || 'border-gray-500';
  };

  const getAnnotationBgColor = (color) => {
    const colorMap = {
      red: 'bg-red-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Visual Analysis</h2>
        <p className="text-sm text-gray-600">
          Hover over highlighted areas to see detected features
        </p>
      </div>

      {/* Main Image Display with Annotations */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 aspect-[4/3]">
        <img
          src={currentImage.url}
          alt={`Property view ${currentImageIndex + 1}`}
          className="w-full h-full object-contain"
        />

        {/* Annotation Overlays */}
        {currentImage.annotations.map((annotation, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredAnnotation(index)}
            onMouseLeave={() => setHoveredAnnotation(null)}
            className={`absolute border-4 ${getAnnotationBorderColor(annotation.color)} cursor-pointer transition-all ${
              hoveredAnnotation === index ? 'border-opacity-100 z-10' : 'border-opacity-70'
            }`}
            style={{
              top: annotation.box.top,
              left: annotation.box.left,
              width: annotation.box.width,
              height: annotation.box.height,
            }}
          >
            {/* Label that appears on hover */}
            {hoveredAnnotation === index && (
              <div className={`absolute -top-8 left-0 ${getAnnotationBgColor(annotation.color)} text-white text-xs font-semibold px-3 py-1 rounded shadow-lg whitespace-nowrap z-20`}>
                {annotation.label}
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all transform hover:scale-110"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all transform hover:scale-110"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Annotation Legend */}
      {currentImage.annotations.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Detected in this image:</h3>
          <div className="flex flex-wrap gap-2">
            {currentImage.annotations.map((annotation, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredAnnotation(index)}
                onMouseLeave={() => setHoveredAnnotation(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 cursor-pointer transition-all ${
                  hoveredAnnotation === index ? 'transform scale-105 shadow-md' : ''
                } ${getAnnotationBorderColor(annotation.color)}`}
              >
                <div className={`w-3 h-3 rounded-full ${getAnnotationBgColor(annotation.color)}`}></div>
                <span className="text-sm font-medium text-gray-700">{annotation.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">All Images</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all transform hover:scale-105 ${
                  currentImageIndex === index
                    ? 'border-blue-500 ring-2 ring-blue-300'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {currentImageIndex === index && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">How to use this view</h4>
            <p className="text-xs text-blue-800">
              Navigate through images using the arrows or thumbnails. Hover over colored boxes or tags to highlight specific accessibility features detected by our AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;

