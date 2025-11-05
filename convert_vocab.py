#!/usr/bin/env python3
import csv
import json
import os
import re

# Create output directory
output_dir = 'data/vocab'
os.makedirs(output_dir, exist_ok=True)

# Read CSV and convert to individual JSON files
with open('data/vocab.csv', 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)

    for index, row in enumerate(reader, start=1):
        # Create JSON object
        vocab_entry = {
            'expression': row['expression'],
            'reading': row['reading'],
            'meaning': row['meaning'],
            'tags': row['tags'].split() if row['tags'] else []
        }

        # Create filename using index and expression
        # Sanitize the expression for use in filename
        sanitized_expr = re.sub(r'[^\w\s-]', '', row['expression'])
        sanitized_expr = re.sub(r'[-\s]+', '_', sanitized_expr)

        # Use index to ensure uniqueness and ordering
        filename = f"{index:05d}_{sanitized_expr}.json"
        filepath = os.path.join(output_dir, filename)

        # Write JSON file
        with open(filepath, 'w', encoding='utf-8') as jsonfile:
            json.dump(vocab_entry, jsonfile, ensure_ascii=False, indent=2)

        if index % 1000 == 0:
            print(f"Processed {index} entries...")

print(f"\nConversion complete! Created {index} JSON files in {output_dir}/")
