#!/usr/bin/env python3
"""
Zillow Image Scraper Web Application

A Flask web application that provides a frontend for the Zillow image scraper.
Users can enter Zillow URLs and get back organized image collections.

Author: AI Assistant
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
import json
import base64
import io
from datetime import datetime
import requests
from PIL import Image
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from zillow_image_scraper import (
    fetch_page_content, 
    extract_json_from_page, 
    extract_image_urls, 
    extract_images_from_html,
    filter_unique_images,
    download_and_upload_to_s3,
    generate_listing_id
)

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Global variables to store results
processing_results = {}

# Bedrock configuration
BEDROCK_REGION = os.environ.get('AWS_REGION', 'us-east-1')
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')

def get_bedrock_client():
    """Initialize and return Bedrock client"""
    try:
        return boto3.client('bedrock-runtime', region_name=BEDROCK_REGION)
    except (NoCredentialsError, ClientError) as e:
        print(f"Bedrock client error: {e}")
        return None

def download_image_as_base64(image_url):
    """Download image and convert to base64 for Bedrock"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(image_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Convert to PIL Image to validate and potentially resize
        image = Image.open(io.BytesIO(response.content))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Resize if too large (Bedrock has size limits)
        max_size = 1024
        if max(image.size) > max_size:
            image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        # Convert to base64
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return img_base64
    except Exception as e:
        print(f"Error downloading image {image_url}: {e}")
        return None

def analyze_accessibility_with_bedrock(image_urls, listing_info):
    """Analyze images for ADA accessibility compliance using Bedrock"""
    bedrock_client = get_bedrock_client()
    if not bedrock_client:
        return {
            "error": "Bedrock client not available. Please check AWS credentials.",
            "overall_score": 0,
            "positive_features": [],
            "areas_for_improvement": [],
            "recommendations": []
        }
    
    # Download and prepare images (limit to first 10 for analysis)
    image_data = []
    for i, url in enumerate(image_urls[:10]):
        print(f"Downloading image {i+1}/{min(10, len(image_urls))} for analysis...")
        img_base64 = download_image_as_base64(url)
        if img_base64:
            image_data.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": img_base64
                }
            })
    
    if not image_data:
        return {
            "error": "No images could be downloaded for analysis.",
            "overall_score": 0,
            "positive_features": [],
            "areas_for_improvement": [],
            "recommendations": []
        }
    
    # System prompt for ADA accessibility analysis
    system_prompt = """You are an expert ADA (Americans with Disabilities Act) accessibility consultant specializing in residential property evaluation. 

Your task is to analyze the provided images of a residential property and evaluate its ADA accessibility compliance. Focus on:

1. **POSITIVE FEATURES** - Identify accessibility features that are compliant or exceed ADA standards
2. **AREAS FOR IMPROVEMENT** - Identify accessibility barriers and non-compliant features  
3. **RECOMMENDATIONS** - Provide specific, actionable recommendations to improve accessibility

Key areas to evaluate:
- Entryways and doorways (width, thresholds, handles)
- Interior pathways and circulation (width, obstacles)
- Bathroom accessibility (grab bars, toilet height, sink clearance)
- Kitchen accessibility (counter height, cabinet access, appliance controls)
- Lighting and visibility
- Flooring and surface conditions
- Stairways and ramps
- Emergency egress
- Overall maneuverability

Respond in JSON format with this exact structure:
{
    "overall_score": [number 0-100],
    "positive_features": [array of specific features found],
    "areas_for_improvement": [array of specific issues found],
    "recommendations": [array of specific recommendations]
}

Be specific and practical in your analysis. Consider both current ADA standards and universal design principles."""

    # Prepare the message for Bedrock
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"Please analyze these {len(image_data)} images of a residential property for ADA accessibility compliance. Property details: {listing_info}"
                }
            ] + image_data
        }
    ]
    
    try:
        # Call Bedrock Claude model
        response = bedrock_client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4000,
                "system": system_prompt,
                "messages": messages
            }),
            contentType="application/json"
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        analysis_text = response_body['content'][0]['text']
        
        # Try to parse JSON from response
        try:
            analysis_data = json.loads(analysis_text)
            return analysis_data
        except json.JSONDecodeError:
            # If not valid JSON, return structured response
            return {
                "overall_score": 50,  # Default score
                "positive_features": ["Analysis completed but format needs review"],
                "areas_for_improvement": ["Unable to parse detailed analysis"],
                "recommendations": ["Review analysis manually"],
                "raw_analysis": analysis_text
            }
            
    except Exception as e:
        print(f"Bedrock analysis error: {e}")
        return {
            "error": f"Analysis failed: {str(e)}",
            "overall_score": 0,
            "positive_features": [],
            "areas_for_improvement": [],
            "recommendations": []
        }

@app.route('/')
def index():
    """Main page with URL input form."""
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process_url():
    """Process a Zillow URL and extract images."""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        if not url.startswith('https://www.zillow.com/'):
            return jsonify({'error': 'Please provide a valid Zillow listing URL'}), 400
        
        # Generate unique job ID
        job_id = generate_listing_id(url)
        
        # Store initial status
        processing_results[job_id] = {
            'status': 'processing',
            'url': url,
            'started_at': datetime.now().isoformat(),
            'images': [],
            'error': None
        }
        
        # Process the URL
        result = process_zillow_url(url, job_id)
        
        # Update results
        processing_results[job_id].update(result)
        
        return jsonify({
            'job_id': job_id,
            'status': result['status'],
            'message': result.get('message', 'Processing completed'),
            'image_count': len(result.get('images', [])),
            's3_urls': result.get('s3_urls', [])
        })
        
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/status/<job_id>')
def get_status(job_id):
    """Get the status of a processing job."""
    if job_id not in processing_results:
        return jsonify({'error': 'Job not found'}), 404
    
    result = processing_results[job_id]
    return jsonify({
        'job_id': job_id,
        'status': result['status'],
        'url': result['url'],
        'started_at': result['started_at'],
        'image_count': len(result.get('images', [])),
        's3_urls': result.get('s3_urls', []),
        'error': result.get('error')
    })

@app.route('/results/<job_id>')
def get_results(job_id):
    """Get detailed results for a completed job."""
    if job_id not in processing_results:
        return jsonify({'error': 'Job not found'}), 404
    
    result = processing_results[job_id]
    return jsonify(result)

@app.route('/gallery/<job_id>')
def view_gallery(job_id):
    """View the image gallery for a completed job."""
    if job_id not in processing_results:
        return render_template('error.html', message='Job not found'), 404
    
    result = processing_results[job_id]
    if result['status'] != 'completed':
        return render_template('error.html', message='Job not completed yet'), 400
    
    return render_template('gallery.html', 
                         job_id=job_id, 
                         images=result.get('s3_urls', []),
                         url=result['url'],
                         result=result)

def process_zillow_url(url, job_id):
    """
    Process a Zillow URL and extract images, then analyze for ADA accessibility.
    
    Args:
        url (str): Zillow listing URL
        job_id (str): Unique job identifier
        
    Returns:
        dict: Processing results including accessibility analysis
    """
    try:
        # Fetch page content
        html_content = fetch_page_content(url)
        if not html_content:
            return {
                'status': 'error',
                'error': 'Failed to fetch the page. Please check the URL and try again.',
                'images': []
            }
        
        # Extract JSON data
        json_data = extract_json_from_page(html_content)
        
        image_urls = []
        json_images = []
        
        if json_data:
            # Extract image URLs from JSON
            json_images = extract_image_urls(json_data)
            if json_images:
                json_images = filter_unique_images(json_images)
        
        # Always try HTML extraction for comprehensive results
        html_images = extract_images_from_html(html_content)
        
        # Combine both sources and remove duplicates
        all_images = json_images + html_images
        image_urls = filter_unique_images(all_images)
        
        if not image_urls:
            return {
                'status': 'completed',
                'message': 'No images found on this listing.',
                'images': [],
                's3_urls': [],
                'accessibility_analysis': None
            }
        
        # Upload to S3
        s3_result = download_and_upload_to_s3(image_urls, job_id)
        
        # Perform accessibility analysis with Bedrock
        print(f"Starting accessibility analysis for {len(image_urls)} images...")
        listing_info = f"Zillow listing: {url}"
        accessibility_analysis = analyze_accessibility_with_bedrock(image_urls, listing_info)
        
        return {
            'status': 'completed',
            'message': f'Successfully processed {len(image_urls)} images and completed accessibility analysis',
            'images': image_urls,
            's3_urls': s3_result.get('s3_urls', []),
            'upload_success': s3_result.get('success', 0),
            'upload_total': s3_result.get('total', 0),
            'accessibility_analysis': accessibility_analysis
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': f'Processing failed: {str(e)}',
            'images': []
        }

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return render_template('error.html', message='Page not found'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return render_template('error.html', message='Internal server error'), 500

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    # Run the application
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(host='0.0.0.0', port=port, debug=debug)
