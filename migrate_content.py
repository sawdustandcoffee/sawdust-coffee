#!/usr/bin/env python3
"""
Migrate products and gallery images from sawdustandcoffee.com to capecodwoodworking.com
"""

import requests
import json
import os
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse
import re

# Configuration
OLD_SITE = "https://sawdustandcoffee.com"
NEW_SITE_API = "https://capecodwoodworking.com/api"
ADMIN_EMAIL = "admin@sawdustandcoffee.com"
ADMIN_PASSWORD = "password"

# Create directories for downloaded images
IMAGES_DIR = Path("migrated_images")
PRODUCTS_DIR = IMAGES_DIR / "products"
GALLERY_DIR = IMAGES_DIR / "gallery"

for dir in [IMAGES_DIR, PRODUCTS_DIR, GALLERY_DIR]:
    dir.mkdir(exist_ok=True)

class ContentMigrator:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.categories_map = {}

    def login(self):
        """Login to new site admin"""
        print("Logging in to admin...")
        try:
            # Get CSRF cookie
            csrf_url = NEW_SITE_API.replace('/api', '/sanctum/csrf-cookie')
            self.session.get(csrf_url)

            # Login
            response = self.session.post(
                f"{NEW_SITE_API}/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                headers={"Accept": "application/json"}
            )

            if response.status_code == 200:
                print("✓ Logged in successfully")
                return True
            else:
                print(f"✗ Login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"✗ Login error: {e}")
            return False

    def get_categories(self):
        """Fetch existing categories from new site"""
        print("\nFetching categories...")
        try:
            response = self.session.get(f"{NEW_SITE_API}/public/categories")
            if response.status_code == 200:
                categories = response.json()
                self.categories_map = {cat['slug']: cat['id'] for cat in categories}
                print(f"✓ Found {len(categories)} categories: {list(self.categories_map.keys())}")
                return True
        except Exception as e:
            print(f"✗ Error fetching categories: {e}")
        return False

    def download_image(self, image_url, save_path):
        """Download image from URL"""
        try:
            # Handle relative URLs
            if not image_url.startswith('http'):
                image_url = urljoin(OLD_SITE, image_url)

            response = requests.get(image_url, timeout=30)
            if response.status_code == 200:
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                print(f"  ✓ Downloaded: {save_path.name}")
                return True
            else:
                print(f"  ✗ Failed to download {image_url}: {response.status_code}")
        except Exception as e:
            print(f"  ✗ Error downloading {image_url}: {e}")
        return False

    def upload_image(self, image_path, product_id=None):
        """Upload image to new site"""
        try:
            with open(image_path, 'rb') as f:
                files = {'image': f}
                data = {}

                if product_id:
                    data['product_id'] = product_id

                response = self.session.post(
                    f"{NEW_SITE_API}/admin/products/{product_id}/images" if product_id else f"{NEW_SITE_API}/admin/gallery",
                    files=files,
                    data=data
                )

                if response.status_code in [200, 201]:
                    print(f"  ✓ Uploaded: {image_path.name}")
                    return response.json()
                else:
                    print(f"  ✗ Upload failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"  ✗ Error uploading {image_path}: {e}")
        return None

    def create_product(self, product_data):
        """Create product on new site"""
        try:
            response = self.session.post(
                f"{NEW_SITE_API}/admin/products",
                json=product_data,
                headers={"Accept": "application/json"}
            )

            if response.status_code in [200, 201]:
                product = response.json()
                print(f"✓ Created product: {product_data['name']}")
                return product
            else:
                print(f"✗ Failed to create product {product_data['name']}: {response.status_code}")
                print(f"  Response: {response.text}")
        except Exception as e:
            print(f"✗ Error creating product: {e}")
        return None

    def migrate_products(self):
        """Migrate all products"""
        print("\n" + "="*60)
        print("MIGRATING PRODUCTS")
        print("="*60)

        products = [
            {
                "name": "Cornhole Board Vinyl Wrap Cutter",
                "slug": "cornhole-board-vinyl-wrap-cutter",
                "description": "Original design for trimming vinyl wrap edges",
                "long_description": "An original design for trimming vinyl wrap edges. Features adjustable reveal spacing from razor blade thickness up to 3/8\", with three 1/8\" thick inserts. Assembled with 2 M5 bolts. Note: RAZOR BLADE NOT INCLUDED",
                "price": "30.00",
                "sale_price": None,
                "sku": "CVWC-001",
                "stock_quantity": 10,
                "category_slug": "small-items",
                "is_featured": False,
                "is_active": True,
                "images": [
                    "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2025/05/il_794xN.6986504884_deud.webp"
                ]
            },
            {
                "name": "American Flag Cornhole Set - Built-In Scoreboard",
                "slug": "american-flag-cornhole-set",
                "description": "Complete cornhole game with integrated scoring system",
                "long_description": "Made from Sanded Grade 3/4\" Plywood, CNC Cut, Hand Painted and Sealed. Built-in scoreboard functionality with four themed wooden golf tees for keeping score. Includes all necessary hardware and themed bags. Dimensions: 48 × 24 × 6 inches.",
                "price": "375.99",
                "sale_price": None,
                "sku": "CORNHOLE-FLAG-001",
                "stock_quantity": 5,
                "category_slug": "cornhole-boards",
                "is_featured": True,
                "is_active": True,
                "images": [
                    "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2024/01/PXL_20240119_221359153-scaled.jpg"
                ]
            },
            {
                "name": "Unfinished Cornhole Set - Built-In Scoreboard",
                "slug": "unfinished-cornhole-set-scoreboard",
                "description": "Raw wood cornhole with integrated scoreboard",
                "long_description": "Quality unfinished cornhole set featuring built-in scoreboard. Made from premium grade plywood, CNC cut for precision. Ready for your custom finish. Perfect for DIY enthusiasts.",
                "price": "249.99",
                "sale_price": None,
                "sku": "CORNHOLE-UNF-001",
                "stock_quantity": 8,
                "category_slug": "cornhole-boards",
                "is_featured": False,
                "is_active": True,
                "images": []
            },
            {
                "name": "Unfinished Cornhole Free Standing Scoreboard",
                "slug": "cornhole-scoreboard",
                "description": "Standalone scoring board for cornhole games",
                "long_description": "High-quality unfinished free-standing scoreboard for cornhole. Can be customized with your own paint and finish. Sturdy construction for years of gameplay.",
                "price": "75.00",
                "sale_price": None,
                "sku": "SCOREBOARD-001",
                "stock_quantity": 12,
                "category_slug": "cornhole-boards",
                "is_featured": False,
                "is_active": True,
                "images": []
            },
            {
                "name": "Wavy 3D Wooden American Flag - Wall Clock",
                "slug": "wavy-flag-clock",
                "description": "Functional wall clock with 3D wavy flag design",
                "long_description": "Made from Pine 2x4's. Hand Painted/Stained, Sanded and Burned. Available in small (13\"H × 24\"W) and large (20\"H × 36\"W) sizes. Choose between 50 Star or 13 Star design.",
                "price": "200.00",
                "sale_price": None,
                "sku": "FLAG-CLOCK-SMALL",
                "stock_quantity": 6,
                "category_slug": "cnc-signs",
                "is_featured": True,
                "is_active": True,
                "images": [
                    "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2023/07/PXL_20230908_210648261-1-scaled.jpg",
                    "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2023/07/PXL_20230913_224205797-scaled.jpg"
                ]
            },
            {
                "name": "Wavy 3D Wooden American Flag",
                "slug": "wavy-flag",
                "description": "Hand-carved three-dimensional flag design",
                "long_description": "Beautiful wavy 3D wooden American flag. Made from Pine 2x4's, hand painted/stained, sanded and burned for authentic rustic look. Perfect patriotic wall decor. Available in multiple sizes.",
                "price": "150.00",
                "sale_price": None,
                "sku": "FLAG-3D-001",
                "stock_quantity": 10,
                "category_slug": "cnc-signs",
                "is_featured": True,
                "is_active": True,
                "images": []
            },
            {
                "name": "Wavy 3D Wooden American Flag - First Responder",
                "slug": "wavy-flag-first-responder",
                "description": "Patriotic flag honoring first responders",
                "long_description": "Special edition wavy 3D wooden American flag honoring first responders. Features thin red/blue line design. Made from Pine 2x4's, hand painted, sanded and burned. A meaningful tribute to our heroes.",
                "price": "200.00",
                "sale_price": None,
                "sku": "FLAG-RESPONDER-001",
                "stock_quantity": 8,
                "category_slug": "cnc-signs",
                "is_featured": False,
                "is_active": True,
                "images": []
            },
            {
                "name": "Personalized Holiday Gift & Stocking Tags (3D Printed)",
                "slug": "holiday-tags-3d",
                "description": "Custom 3D-printed holiday gift tags in multiple colors",
                "long_description": "Personalized multicolor 3D printed holiday gift and stocking tags. Perfect for adding a special touch to your Christmas gifts. Customizable with names. Durable PLA material.",
                "price": "20.00",
                "sale_price": None,
                "sku": "TAGS-HOLIDAY-001",
                "stock_quantity": 50,
                "category_slug": "small-items",
                "is_featured": False,
                "is_active": True,
                "images": []
            },
            {
                "name": "Slab Flattening and Surfacing Service",
                "slug": "slab-flattening-service",
                "description": "Professional wood surfacing and flattening services",
                "long_description": "Professional slab flattening and wood surfacing service. We can surface slabs up to 52\" wide. Precision CNC router ensures perfectly flat surfaces for your live edge projects. Price varies by size and complexity.",
                "price": "200.00",
                "sale_price": None,
                "sku": "SERVICE-FLATTEN",
                "stock_quantity": 999,
                "category_slug": "live-edge-furniture",
                "is_featured": False,
                "is_active": True,
                "images": []
            },
            {
                "name": "Custom Live Edge Tables",
                "slug": "custom-live-edge-tables",
                "description": "Customized live edge tables made to order",
                "long_description": "Beautiful custom live edge tables crafted from premium hardwoods. Each piece is unique, featuring natural live edges and custom finishes. Available in various sizes. Contact us for a custom quote based on your specific requirements.",
                "price": "1500.00",
                "sale_price": None,
                "sku": "TABLE-CUSTOM",
                "stock_quantity": 3,
                "category_slug": "live-edge-furniture",
                "is_featured": True,
                "is_active": True,
                "images": []
            }
        ]

        created_count = 0
        for product_info in products:
            print(f"\nProcessing: {product_info['name']}")

            # Map category
            category_id = self.categories_map.get(product_info['category_slug'])
            if not category_id:
                print(f"  ⚠ Warning: Category '{product_info['category_slug']}' not found, using default")
                category_id = 1

            # Prepare product data
            product_data = {
                "name": product_info['name'],
                "slug": product_info['slug'],
                "description": product_info['description'],
                "long_description": product_info['long_description'],
                "price": product_info['price'],
                "sku": product_info['sku'],
                "stock_quantity": product_info['stock_quantity'],
                "track_inventory": True,
                "low_stock_threshold": 5,
                "is_featured": product_info['is_featured'],
                "is_active": product_info['is_active'],
                "allow_reviews": True,
                "category_ids": [category_id]
            }

            if product_info['sale_price']:
                product_data['sale_price'] = product_info['sale_price']

            # Create product
            product = self.create_product(product_data)
            if product:
                created_count += 1

                # Download and upload images
                if product_info['images']:
                    for idx, image_url in enumerate(product_info['images']):
                        image_name = f"{product_info['slug']}_{idx}.jpg"
                        image_path = PRODUCTS_DIR / image_name

                        if self.download_image(image_url, image_path):
                            time.sleep(0.5)  # Rate limit
                            self.upload_image(image_path, product['id'])

                time.sleep(1)  # Rate limit between products

        print(f"\n✓ Successfully created {created_count}/{len(products)} products")
        return created_count

    def migrate_gallery(self):
        """Migrate gallery images"""
        print("\n" + "="*60)
        print("MIGRATING GALLERY IMAGES")
        print("="*60)

        gallery_items = [
            {
                "title": "Black Walnut Desk",
                "description": "Custom black walnut desk with live edge",
                "image_url": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2024/04/IMG_20240412_195342.jpg",
                "is_featured": True
            },
            {
                "title": "3D CNC Signs",
                "description": "Custom 3D carved wooden signs",
                "image_url": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2024/09/PXL_20240917_155015535.jpg",
                "is_featured": True
            },
            {
                "title": "Waterfall Edge Counter",
                "description": "Live edge waterfall countertop installation",
                "image_url": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2024/10/IMG_20241026_001939.jpg",
                "is_featured": True
            },
            {
                "title": "Live Edge Maple Desk",
                "description": "Beautiful maple live edge desk",
                "image_url": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2024/11/IMG_20241108_180050.jpg",
                "is_featured": False
            },
            {
                "title": "MBTA Project",
                "description": "Custom project for MBTA",
                "image_url": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2024/09/IMG_20240915_233429.jpg",
                "is_featured": False
            },
            {
                "title": "Live Edge Conference Table",
                "description": "Large office conference table with live edge",
                "image_url": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2024/06/IMG_20240621_173825.jpg",
                "is_featured": True
            },
            {
                "title": "Cornhole Sets",
                "description": "Custom cornhole game sets",
                "image_url": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2025/06/PXL_20250618_225202471.MP_.jpg",
                "is_featured": False
            },
            {
                "title": "Laser Engraving",
                "description": "Precision laser engraving services",
                "image_url": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2024/11/20241111_115441.jpg",
                "is_featured": False
            },
            {
                "title": "Wooden Flags",
                "description": "Handcrafted wooden American flags",
                "image_url": "https://sawdustandcoffee.com/wp-content/uploads/sites/2/2023/09/PXL_20230908_210648261.jpg",
                "is_featured": True
            }
        ]

        uploaded_count = 0
        for item in gallery_items:
            print(f"\nProcessing gallery: {item['title']}")

            # Download image
            image_name = f"gallery_{item['title'].lower().replace(' ', '_')}.jpg"
            image_path = GALLERY_DIR / image_name

            if self.download_image(item['image_url'], image_path):
                time.sleep(0.5)

                # Upload to gallery
                try:
                    with open(image_path, 'rb') as f:
                        files = {'image': f}
                        data = {
                            'title': item['title'],
                            'description': item['description'],
                            'is_featured': 'true' if item['is_featured'] else 'false'
                        }

                        response = self.session.post(
                            f"{NEW_SITE_API}/admin/gallery",
                            files=files,
                            data=data
                        )

                        if response.status_code in [200, 201]:
                            print(f"  ✓ Uploaded gallery item: {item['title']}")
                            uploaded_count += 1
                        else:
                            print(f"  ✗ Failed to upload: {response.status_code}")
                except Exception as e:
                    print(f"  ✗ Error: {e}")

                time.sleep(1)

        print(f"\n✓ Successfully uploaded {uploaded_count}/{len(gallery_items)} gallery items")
        return uploaded_count

def main():
    print("="*60)
    print("SAWDUST & COFFEE CONTENT MIGRATION")
    print("="*60)
    print(f"From: {OLD_SITE}")
    print(f"To: {NEW_SITE_API}")
    print("="*60)

    migrator = ContentMigrator()

    # Login
    if not migrator.login():
        print("\n✗ Migration failed: Could not login")
        return

    # Get categories
    if not migrator.get_categories():
        print("\n✗ Migration failed: Could not fetch categories")
        return

    # Migrate products
    products_created = migrator.migrate_products()

    # Migrate gallery
    gallery_uploaded = migrator.migrate_gallery()

    # Summary
    print("\n" + "="*60)
    print("MIGRATION COMPLETE")
    print("="*60)
    print(f"Products created: {products_created}")
    print(f"Gallery items uploaded: {gallery_uploaded}")
    print(f"Images saved to: {IMAGES_DIR}")
    print("="*60)

if __name__ == "__main__":
    main()
