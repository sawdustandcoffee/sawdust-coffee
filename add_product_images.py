#!/usr/bin/env python3
"""
Add product images by downloading from sawdustandcoffee.com
"""

import requests
import os
import time

BASE_URL = "https://capecodwoodworking.com"
API_URL = f"{BASE_URL}/api"

# Product image URLs - mapped to actual products on sawdustandcoffee.com
PRODUCT_IMAGES = {
    # American Flag Cornhole Set - exact match
    "american-flag-cornhole-set": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2024/01/PXL_20240119_221359153-scaled.jpg",

    # Wavy 3D American Flag
    "wavy-flag": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2023/07/american-flag-standard.jpg",

    # Wavy Flag Clock
    "wavy-flag-clock": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2023/07/PXL_20230908_210648261-1-scaled.jpg",

    # Wavy Flag First Responder
    "wavy-flag-first-responder": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2023/07/received_1292529398018725.jpeg",

    # Custom Live Edge Tables
    "custom-live-edge-tables": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2023/07/PXL_20230325_210230630-scaled.jpg",
}

session = requests.Session()

def login():
    """Login to admin account"""
    print("Logging in...")

    # Get CSRF cookie
    csrf_response = session.get(f"{BASE_URL}/sanctum/csrf-cookie")
    if csrf_response.status_code != 204:
        raise Exception(f"Failed to get CSRF cookie: {csrf_response.status_code}")

    # Login
    login_data = {
        "email": "admin@sawdustandcoffee.com",
        "password": "password"
    }

    response = session.post(f"{API_URL}/login", json=login_data)
    if response.status_code == 200:
        print("✓ Logged in successfully")
        return True
    else:
        raise Exception(f"Login failed: {response.status_code} - {response.text}")

def get_products():
    """Get all products from API"""
    print("\nFetching products...")
    response = session.get(f"{API_URL}/public/products")

    if response.status_code == 200:
        data = response.json()
        products = data.get('data', [])
        print(f"✓ Found {len(products)} products")
        return products
    else:
        raise Exception(f"Failed to get products: {response.status_code}")

def download_image(url, path):
    """Download image from URL"""
    try:
        print(f"  Downloading from {url}")
        response = requests.get(url, timeout=15, stream=True)
        if response.status_code == 200:
            with open(path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"  ✓ Downloaded to {path}")
            return True
        else:
            print(f"  ✗ Failed to download: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ✗ Error downloading: {str(e)}")
        return False

def upload_product_image(product_id, image_path):
    """Upload image to product"""
    print(f"  Uploading image to product {product_id}...")

    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            # Add is_primary field to make this the primary image
            data = {'is_primary': 'true'}
            response = session.post(
                f"{API_URL}/admin/products/{product_id}/images",
                files=files,
                data=data
            )

        if response.status_code in [200, 201]:
            print(f"  ✓ Image uploaded successfully")
            return True
        else:
            print(f"  ✗ Failed to upload: {response.status_code}")
            print(f"  Response: {response.text[:500]}")  # Limit response output
            return False

    except Exception as e:
        print(f"  ✗ Error uploading: {str(e)}")
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("ADDING PRODUCT IMAGES")
    print("=" * 60)

    # Login
    login()

    # Get products
    products = get_products()

    # Create temp directory for images
    temp_dir = "/tmp/product_images"
    os.makedirs(temp_dir, exist_ok=True)

    success_count = 0
    fail_count = 0
    skipped_count = 0

    # Process each product
    for product in products:
        product_id = product['id']
        product_slug = product['slug']
        product_name = product['name']

        print(f"\n{'='*60}")
        print(f"Processing: {product_name}")
        print(f"Slug: {product_slug}")
        print(f"ID: {product_id}")

        # Check if we have an image URL for this product
        if product_slug not in PRODUCT_IMAGES:
            print(f"  ⚠ No matching image found on source site, skipping...")
            skipped_count += 1
            continue

        image_url = PRODUCT_IMAGES[product_slug]

        # Download image
        image_ext = os.path.splitext(image_url.split('?')[0])[1] or '.jpg'
        image_path = os.path.join(temp_dir, f"{product_slug}{image_ext}")

        if not download_image(image_url, image_path):
            fail_count += 1
            continue

        # Upload to product
        if upload_product_image(product_id, image_path):
            success_count += 1
        else:
            fail_count += 1

        # Clean up
        try:
            os.remove(image_path)
        except:
            pass

        # Rate limiting
        time.sleep(1)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"✓ Successfully added images: {success_count}")
    print(f"✗ Failed: {fail_count}")
    print(f"⚠ Skipped (no source image): {skipped_count}")
    print(f"Total products processed: {len(products)}")
    print("\nNote: Some products don't have matching images on sawdustandcoffee.com")
    print("You can add images manually via the admin panel at /admin/products")

if __name__ == "__main__":
    main()
