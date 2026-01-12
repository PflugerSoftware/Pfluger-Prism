#!/usr/bin/env python3
"""
Geocode Project Addresses Script
---------------------------------
This script reads the projects.csv file, geocodes all addresses using
the Nominatim (OpenStreetMap) API, and updates the latitude/longitude
columns with the correct coordinates.

Usage: python3 geocode_projects.py
"""

import csv
import time
import requests
from typing import Optional, Tuple

def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Geocode an address using Nominatim API.

    Args:
        address: Street address to geocode

    Returns:
        Tuple of (latitude, longitude) or None if geocoding fails
    """
    # Nominatim API endpoint
    url = "https://nominatim.openstreetmap.org/search"

    params = {
        'q': address,
        'format': 'json',
        'limit': 1,
        'addressdetails': 1
    }

    headers = {
        'User-Agent': 'ProjectPrism/1.0 (Geocoding Script)'
    }

    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()

        data = response.json()

        if data and len(data) > 0:
            result = data[0]
            lat = float(result['lat'])
            lon = float(result['lon'])
            return (lat, lon)
        else:
            print(f"  ⚠️  No results found for: {address}")
            return None

    except Exception as e:
        print(f"  ❌ Error geocoding {address}: {e}")
        return None


def main():
    """Main function to geocode all projects."""

    input_file = 'public/data/projects.csv'
    output_file = 'public/data/projects.csv'

    print("🗺️  Project Address Geocoding Script")
    print("=" * 60)
    print()

    # Read the CSV
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            rows = list(reader)
    except FileNotFoundError:
        print(f"❌ Error: Could not find {input_file}")
        return

    print(f"📄 Found {len(rows)} projects to geocode")
    print()

    # Track statistics
    success_count = 0
    failed_count = 0
    skipped_count = 0

    # Geocode each project
    for i, row in enumerate(rows, 1):
        project_name = row['name']
        address = row['address']

        print(f"[{i}/{len(rows)}] {project_name}")
        print(f"  Address: {address}")

        # Check if address is "Multiple Locations" or empty
        if not address or address.strip() == "" or "Multiple Locations" in address:
            print(f"  ⏭️  Skipping - No specific address")
            skipped_count += 1
            print()
            continue

        # Geocode the address
        result = geocode_address(address)

        if result:
            lat, lon = result
            row['latitude'] = f"{lat:.6f}"
            row['longitude'] = f"{lon:.6f}"
            print(f"  ✅ Geocoded: {lat:.6f}, {lon:.6f}")
            success_count += 1
        else:
            failed_count += 1

        print()

        # Be nice to the API - wait 1 second between requests
        if i < len(rows):
            time.sleep(1)

    # Write updated CSV
    try:
        with open(output_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"✅ Updated CSV written to: {output_file}")
    except Exception as e:
        print(f"❌ Error writing CSV: {e}")
        return

    # Print summary
    print()
    print("=" * 60)
    print("📊 Geocoding Summary:")
    print(f"  ✅ Successfully geocoded: {success_count}")
    print(f"  ❌ Failed to geocode:    {failed_count}")
    print(f"  ⏭️  Skipped (no address): {skipped_count}")
    print(f"  📍 Total projects:       {len(rows)}")
    print("=" * 60)
    print()
    print("🎉 Done! Your projects now have correct coordinates.")
    print("   Refresh your browser to see the updated map.")


if __name__ == "__main__":
    main()
