#!/bin/bash

echo "🏠 Zillow Image Scraper Setup"
echo "=============================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Git and Python 3 are installed"

# Clone the repository if not already cloned
if [ ! -d "housingA" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/G-Krishna-chandra/housingA.git
    cd housingA
else
    echo "📁 Repository already exists, updating..."
    cd housingA
    git pull origin kc
fi

# Switch to the kc branch
echo "🔄 Switching to kc branch..."
git checkout kc

# Install dependencies
echo "📦 Installing dependencies..."
python3 -m pip install -r requirements.txt

# Create environment file
echo "⚙️  Setting up environment..."
cp env.example .env

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To run the web application:"
echo "   python3 app.py"
echo "   Then open: http://localhost:5000"
echo ""
echo "🚀 To run the command line tool:"
echo "   python3 zillow_image_scraper.py \"<zillow-url>\" --download"
echo ""
echo "📝 Note: If you want to use S3, edit the .env file with your AWS credentials"
echo "📝 Otherwise, the app will use local storage automatically"
