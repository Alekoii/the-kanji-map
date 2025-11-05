#!/usr/bin/env python3
import json
import os
from pathlib import Path

# Read all vocab JSON files and compile into a single list
vocab_dir = Path('data/vocab')
output_file = Path('data/vocablist.json')

vocab_list = []

# Get all JSON files sorted by filename
json_files = sorted(vocab_dir.glob('*.json'))

for json_file in json_files:
    with open(json_file, 'r', encoding='utf-8') as f:
        vocab_entry = json.load(f)
        vocab_list.append(vocab_entry)

# Write the compiled list
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(vocab_list, f, ensure_ascii=False, separators=(',', ':'))

print(f"Compiled {len(vocab_list)} vocab entries into {output_file}")
