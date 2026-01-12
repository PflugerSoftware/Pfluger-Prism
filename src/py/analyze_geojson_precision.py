#!/usr/bin/env python3
"""
Analyze GeoJSON file and estimate file size reduction based on coordinate precision.
"""

import json
import os
import sys

def analyze_coordinate(coord):
    """Analyze a single coordinate value."""
    coord_str = str(coord)
    if '.' in coord_str:
        decimal_places = len(coord_str.split('.')[1])
        return decimal_places
    return 0

def analyze_coordinates_recursive(coords, depths=None):
    """Recursively analyze coordinates at any nesting level."""
    if depths is None:
        depths = []

    if isinstance(coords[0], list):
        # Nested coordinates - go deeper
        for coord_set in coords:
            analyze_coordinates_recursive(coord_set, depths)
    else:
        # Actual coordinate pair [lon, lat]
        for coord in coords:
            depths.append(analyze_coordinate(coord))

    return depths

def round_coordinates_recursive(coords, precision):
    """Recursively round coordinates to specified precision."""
    if isinstance(coords[0], list):
        return [round_coordinates_recursive(c, precision) for c in coords]
    else:
        return [round(c, precision) for c in coords]

def estimate_sizes(input_file):
    """Analyze GeoJSON file and estimate sizes at different precisions."""

    print(f"Analyzing: {input_file}")
    print(f"Original file size: {os.path.getsize(input_file) / (1024*1024):.2f} MB\n")

    # Load the GeoJSON
    print("Loading GeoJSON file...")
    with open(input_file, 'r') as f:
        data = json.load(f)

    print(f"✓ Loaded successfully")
    print(f"  Features: {len(data.get('features', []))}\n")

    # Analyze precision of existing coordinates
    print("Analyzing coordinate precision...")
    all_precisions = []

    for feature in data['features']:
        geometry = feature.get('geometry', {})
        coords = geometry.get('coordinates', [])
        if coords:
            precisions = analyze_coordinates_recursive(coords)
            all_precisions.extend(precisions)

    if all_precisions:
        avg_precision = sum(all_precisions) / len(all_precisions)
        max_precision = max(all_precisions)
        min_precision = min(all_precisions)

        print(f"✓ Analyzed {len(all_precisions)} coordinate values")
        print(f"  Current precision:")
        print(f"    - Average: {avg_precision:.2f} decimal places")
        print(f"    - Maximum: {max_precision} decimal places")
        print(f"    - Minimum: {min_precision} decimal places\n")

    # Precision reference guide
    print("Precision Reference Guide:")
    print("  6 decimal places ≈ 0.11 meters (good for most mapping)")
    print("  5 decimal places ≈ 1.1 meters")
    print("  4 decimal places ≈ 11 meters")
    print("  3 decimal places ≈ 111 meters\n")

    # Test different precision levels
    print("Estimating file sizes at different precision levels...")
    print("-" * 70)

    original_size = os.path.getsize(input_file)

    for precision in [3, 4, 5, 6, 7, 8]:
        # Create a copy with reduced precision
        data_copy = json.loads(json.dumps(data))  # Deep copy

        for feature in data_copy['features']:
            geometry = feature.get('geometry', {})
            if 'coordinates' in geometry:
                geometry['coordinates'] = round_coordinates_recursive(
                    geometry['coordinates'],
                    precision
                )

        # Serialize to JSON and measure size
        json_str = json.dumps(data_copy, separators=(',', ':'))
        new_size = len(json_str.encode('utf-8'))

        reduction_mb = (original_size - new_size) / (1024 * 1024)
        reduction_pct = ((original_size - new_size) / original_size) * 100

        print(f"Precision {precision}: {new_size/(1024*1024):6.2f} MB  "
              f"(saves {reduction_mb:5.2f} MB, {reduction_pct:5.2f}% reduction)")

    print("-" * 70)
    print("\n✓ Analysis complete!")
    print("\nRecommendation: For web mapping, 5-6 decimal places is typically optimal.")
    print("This provides sufficient accuracy while significantly reducing file size.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    else:
        input_file = "/Users/alexanderwickes/GitHub/ProjectPrism/src/data/districts.geojson"

    if not os.path.exists(input_file):
        print(f"Error: File not found: {input_file}")
        sys.exit(1)

    estimate_sizes(input_file)
