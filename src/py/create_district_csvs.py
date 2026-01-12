#!/usr/bin/env python3
"""
Create two CSV files from district GeoJSON and attributes:
1. district_attributes.csv - All district metadata
2. district_shapes.csv - District shapes with reduced precision coordinates
"""

import json
import csv
import os

def round_coordinates_recursive(coords, precision):
    """Recursively round coordinates to specified precision."""
    if isinstance(coords[0], list):
        return [round_coordinates_recursive(c, precision) for c in coords]
    else:
        return [round(c, precision) for c in coords]

def create_csvs(geojson_file, attributes_file, precision=6):
    """Create the two CSV files."""

    print("Loading files...")

    # Load GeoJSON
    with open(geojson_file, 'r') as f:
        geojson_data = json.load(f)

    # Load attributes
    with open(attributes_file, 'r') as f:
        attributes_data = json.load(f)

    print(f"✓ Loaded {len(geojson_data['features'])} districts from GeoJSON")
    print(f"✓ Loaded {len(attributes_data)} districts from attributes\n")

    # Create district_attributes.csv
    print("Creating district_attributes.csv...")

    # Get all possible field names from all districts
    all_fields = set()
    for district_data in attributes_data.values():
        all_fields.update(district_data.keys())

    # Sort fields for consistent ordering, with GEOID20 first
    fieldnames = ['GEOID20'] + sorted([f for f in all_fields if f != 'GEOID20'])

    attributes_output = '/Users/alexanderwickes/GitHub/ProjectPrism/public/data/district_attributes.csv'

    with open(attributes_output, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for geoid, district_data in sorted(attributes_data.items()):
            # Ensure GEOID20 is in the data
            row = {'GEOID20': geoid}
            row.update(district_data)
            writer.writerow(row)

    print(f"✓ Created {attributes_output}")
    print(f"  Fields: {len(fieldnames)}")
    print(f"  Records: {len(attributes_data)}")
    file_size = os.path.getsize(attributes_output) / 1024
    print(f"  Size: {file_size:.2f} KB\n")

    # Create district_shapes.csv
    print(f"Creating district_shapes.csv (precision: {precision} decimal places)...")

    # Build mapping from NCES_DISTR to GEOID20
    nces_to_geoid = {v['NCES_DISTR']: k for k, v in attributes_data.items() if 'NCES_DISTR' in v}

    shapes_output = '/Users/alexanderwickes/GitHub/ProjectPrism/public/data/district_shapes.csv'

    with open(shapes_output, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=['GEOID20', 'geometry_type', 'coordinates'])
        writer.writeheader()

        matched = 0
        unmatched = 0

        for feature in geojson_data['features']:
            nces_distr = feature['properties'].get('NCES_DISTR', '')
            geoid20 = nces_to_geoid.get(nces_distr)

            if not geoid20:
                unmatched += 1
                # Use NCES_DISTR as fallback
                geoid20 = nces_distr
            else:
                matched += 1

            geometry = feature['geometry']
            geometry_type = geometry['type']

            # Round coordinates to specified precision
            rounded_coords = round_coordinates_recursive(geometry['coordinates'], precision)

            # Convert coordinates to JSON string
            coords_json = json.dumps(rounded_coords, separators=(',', ':'))

            writer.writerow({
                'GEOID20': geoid20,
                'geometry_type': geometry_type,
                'coordinates': coords_json
            })

    print(f"✓ Created {shapes_output}")
    print(f"  Matched with attributes: {matched}")
    print(f"  Unmatched (using NCES_DISTR): {unmatched}")
    file_size = os.path.getsize(shapes_output) / (1024 * 1024)
    print(f"  Size: {file_size:.2f} MB")

    # Show size comparison
    original_size = os.path.getsize(geojson_file) / (1024 * 1024)
    reduction = ((original_size - file_size) / original_size) * 100
    print(f"  Original GeoJSON: {original_size:.2f} MB")
    print(f"  Size reduction: {reduction:.1f}%\n")

    print("✓ All done!")
    print(f"\nOutput files:")
    print(f"  - {attributes_output}")
    print(f"  - {shapes_output}")

if __name__ == "__main__":
    geojson_file = "/Users/alexanderwickes/GitHub/ProjectPrism/src/data/districts.geojson"
    attributes_file = "/Users/alexanderwickes/GitHub/ProjectPrism/src/data/districts_attributes.json"

    # Use precision 6 (0.11 meter accuracy - perfect for district boundaries)
    create_csvs(geojson_file, attributes_file, precision=6)
