#!/usr/bin/env python3
"""Validate provider catalog against schema and check for secrets."""
import json
import sys
import re
from pathlib import Path
import jsonschema

def validate_catalog():
    root = Path(__file__).parent.parent
    catalog_path = root / "catalog" / "provider_templates.json"
    schema_path = root / "schemas" / "catalog" / "provider_catalog.schema.json"
    template_schema_path = root / "schemas" / "catalog" / "provider_template.schema.json"

    print(f"Validating {catalog_path}...")
    
    with open(catalog_path) as f:
        catalog = json.load(f)
        
    with open(schema_path) as f:
        schema = json.load(f)
        
    with open(template_schema_path) as f:
        template_schema = json.load(f)

    # Resolve local refs manually since we don't have a full resolver setup
    # But current schema just refs provider_template.schema.json which we can preload if needed
    # Ideally use a resolver, but for simple check:
    # We can patch schema to include definitions or just use a custom RefResolver
    
    resolver = jsonschema.RefResolver(
        base_uri=f"file://{schema_path.absolute()}", 
        referrer=schema,
        handlers={"file": lambda uri: json.load(open(uri.replace("file://", "")))}
    )
    
    # Pre-cache the template schema
    # Actually, jsonschema might handle relative paths if CWD is correct or base_uri is set
    # Let's try simple validation first, if it fails on Ref, we fix it.
    
    try:
        # Patch the $ref to absolute path for simplicity in this script
        schema["properties"]["templates"]["items"]["$ref"] = f"file://{template_schema_path.absolute()}"
        jsonschema.validate(instance=catalog, schema=schema)
        print("Schema validation passed.")
    except jsonschema.exceptions.ValidationError as e:
        print(f"Schema validation failed: {e}")
        sys.exit(1)

    # Check for secrets
    print("Checking for raw secrets...")
    suspicious_patterns = [
        r"sk-[a-zA-Z0-9]{20,}",  # OpenAI style
        r"AIza[0-9A-Za-z-_]{35}", # Google style
        r"x-api-key: [a-zA-Z0-9]{10,}",
    ]
    
    catalog_str = json.dumps(catalog)
    found_secrets = False
    for pattern in suspicious_patterns:
        matches = re.findall(pattern, catalog_str)
        if matches:
            print(f"WARNING: Found potential secret matching {pattern}: {matches}")
            found_secrets = True
            
    if found_secrets:
        print("Validation failed: Potential secrets found in catalog.")
        sys.exit(1)
        
    print("Secret check passed.")
    sys.exit(0)

if __name__ == "__main__":
    validate_catalog()
