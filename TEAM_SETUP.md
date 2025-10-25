# 🚀 Team Setup Guide

This guide helps your teammates quickly get the Zillow Image Scraper running on their machines.

## 📋 Prerequisites

- **Git** installed
- **Python 3.9+** installed
- **Internet connection**

## 🚀 Quick Setup (One Command)

```bash
# Download and run the setup script
curl -sSL https://raw.githubusercontent.com/G-Krishna-chandra/housingA/kc/setup.sh | bash
```

## 📝 Manual Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/G-Krishna-chandra/housingA.git
cd housingA
```

### Step 2: Switch to KC's Branch
```bash
git checkout kc
```

### Step 3: Install Dependencies
```bash
# Install Python packages
python3 -m pip install -r requirements.txt

# Or if you prefer pip
pip install -r requirements.txt
```

### Step 4: Configure Environment (Optional)
```bash
# Copy environment template
cp env.example .env

# Edit with your AWS credentials (optional)
# If you don't have AWS, the app will use local storage
```

## 🎯 Running the Application

### Option 1: Web Interface (Recommended)
```bash
python3 app.py
```
Then open: http://localhost:5000

### Option 2: Command Line Tool
```bash
# Basic usage - list image URLs
python3 zillow_image_scraper.py "https://www.zillow.com/homedetails/123-Main-St-City-ST-12345/123456_zpid/"

# Download images locally
python3 zillow_image_scraper.py "https://www.zillow.com/homedetails/123-Main-St-City-ST-12345/123456_zpid/" --download

# Upload to S3 (if you have AWS credentials)
python3 zillow_image_scraper.py "https://www.zillow.com/homedetails/123-Main-St-City-ST-12345/123456_zpid/" --s3
```

## 🐳 Docker Setup (Alternative)

If you prefer Docker:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t zillow-scraper .
docker run -p 5000:5000 zillow-scraper
```

## 🔧 Configuration Options

### Environment Variables
Create a `.env` file with:
```bash
# AWS Configuration (optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key
PORT=5000
```

### Storage Options
- **Local Storage**: Default, no configuration needed
- **S3 Storage**: Requires AWS credentials and bucket setup

## 🧪 Testing the Setup

### Test 1: Web Interface
1. Run `python3 app.py`
2. Open http://localhost:5000
3. Enter a Zillow URL
4. Click "Extract Images"

### Test 2: Command Line
```bash
python3 zillow_image_scraper.py "https://www.zillow.com/homedetails/2487-Rebecca-Lynn-Way-Santa-Clara-CA-95050/19600971_zpid/" --download
```

## 🆘 Troubleshooting

### Common Issues

**Port 5000 in use:**
```bash
# Use a different port
PORT=8080 python3 app.py
```

**Python not found:**
```bash
# Try python instead of python3
python app.py
```

**Permission denied:**
```bash
# Make setup script executable
chmod +x setup.sh
```

**Missing dependencies:**
```bash
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Getting Help

1. Check the main README.md for detailed documentation
2. Look at the terminal output for error messages
3. Ensure you're on the `kc` branch: `git branch`

## 📁 Project Structure

```
housingA/
├── app.py                    # Flask web application
├── zillow_image_scraper.py   # Core scraping logic
├── templates/               # Web interface templates
├── requirements.txt         # Python dependencies
├── Dockerfile              # Container configuration
├── docker-compose.yml      # Multi-container setup
├── setup.sh               # Automated setup script
└── README.md              # Full documentation
```

## 🎉 Success!

Once everything is running, you should see:
- ✅ Flask app running on http://localhost:5000
- ✅ Beautiful web interface for entering Zillow URLs
- ✅ Image gallery for viewing results
- ✅ Local storage in `zillow_images/` folder

Happy scraping! 🏠📸
