#!/usr/bin/env python3
"""
Kampot Harvest Co. — Automated Odoo Synchronizer
Pushes products, variants, images, and prices directly to your Odoo ERP database via XML-RPC.
"""

import xmlrpc.client
import base64
import os
import sys

# Odoo Connection Configuration (Set via environment variables or edit below)
ODOO_URL = os.getenv('ODOO_URL', 'http://localhost:8069')
ODOO_DB = os.getenv('ODOO_DB', 'kampot_harvest')
ODOO_USER = os.getenv('ODOO_USER', 'admin')
ODOO_PASSWORD = os.getenv('ODOO_PASSWORD', 'admin')

def get_base64_image(rel_path):
    full_path = os.path.join(os.path.dirname(__file__), '..', rel_path)
    if os.path.exists(full_path):
        with open(full_path, 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8')
    return None

def sync_to_odoo():
    print(f"Connecting to Odoo at {ODOO_URL} (DB: {ODOO_DB})...")
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    
    try:
        uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASSWORD, {})
    except Exception as e:
        print(f"Authentication failed: {e}")
        print("\nTip: Make sure ODOO_URL, ODOO_DB, ODOO_USER, and ODOO_PASSWORD are set correctly.")
        return

    if not uid:
        print("Invalid credentials! Please check your database name and API key/password.")
        return

    print(f"Successfully authenticated as User ID: {uid}")
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')

    # 1. Create or Find Attributes (Flavour & Package Size)
    attributes = {
        'Flavour': ['Honey Butter', 'Chili Lime'],
        'Package Size': ['100g Pouch', '250g Jar']
    }
    
    attr_value_ids = {}

    for attr_name, vals in attributes.items():
        existing_attrs = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'product.attribute', 'search_read',
            [[['name', '=', attr_name]]],
            {'fields': ['id', 'name']}
        )
        if existing_attrs:
            attr_id = existing_attrs[0]['id']
        else:
            attr_id = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'product.attribute', 'create',
                [{'name': attr_name, 'create_variant': 'always'}]
            )
        
        attr_value_ids[attr_id] = []
        for val_name in vals:
            existing_vals = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'product.attribute.value', 'search_read',
                [[['name', '=', val_name], ['attribute_id', '=', attr_id]]],
                {'fields': ['id', 'name']}
            )
            if existing_vals:
                val_id = existing_vals[0]['id']
            else:
                val_id = models.execute_kw(
                    ODOO_DB, uid, ODOO_PASSWORD,
                    'product.attribute.value', 'create',
                    [{'name': val_name, 'attribute_id': attr_id}]
                )
            attr_value_ids[attr_id].append(val_id)

    # 2. Check or Create Product Template
    prod_name = "Artisan Roasted Cashews"
    existing_prod = models.execute_kw(
        ODOO_DB, uid, ODOO_PASSWORD,
        'product.template', 'search_read',
        [[['name', '=', prod_name]]],
        {'fields': ['id', 'name']}
    )

    logo_b64 = get_base64_image('public/assets/aistudio/image_2e860bec.png')

    product_vals = {
        'name': prod_name,
        'detailed_type': 'consu', # or 'product' for storable
        'list_price': 10.00,      # $10 for 100g Pouch
        'description_sale': "Hand-selected Cambodian cashews roasted with wild honey, churned butter, and Kampot bird's eye chili.",
        'website_published': True,
        'out_of_stock_message': "Not Available",
    }
    if logo_b64:
        product_vals['image_1920'] = logo_b64

    if existing_prod:
        prod_id = existing_prod[0]['id']
        print(f"Product '{prod_name}' already exists (ID: {prod_id}). Updating...")
        models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD, 'product.template', 'write', [[prod_id], product_vals])
    else:
        # Prepare attribute lines
        lines = []
        for a_id, v_ids in attr_value_ids.items():
            lines.append((0, 0, {'attribute_id': a_id, 'value_ids': [(6, 0, v_ids)]}))
        product_vals['attribute_line_ids'] = lines
        prod_id = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD, 'product.template', 'create', [product_vals])
        print(f"Created Product '{prod_name}' with ID: {prod_id}")

    # 3. Configure Extra Price for 250g Jar (+$10 => $20 total)
    jar_val_ids = [v_id for a_id, v_ids in attr_value_ids.items() for v_id in v_ids if 'Jar' in str(v_id)]
    # In Odoo, price extra is placed on product.template.attribute.value
    ptav_records = models.execute_kw(
        ODOO_DB, uid, ODOO_PASSWORD,
        'product.template.attribute.value', 'search_read',
        [[['product_tmpl_id', '=', prod_id]]],
        {'fields': ['id', 'name', 'price_extra']}
    )
    for ptav in ptav_records:
        if '250g' in ptav['name'] or 'Jar' in ptav['name']:
            models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'product.template.attribute.value', 'write',
                [[ptav['id']], {'price_extra': 10.00}]
            )
            print(f"Set +$10 extra price for variant '{ptav['name']}' (Total $20.00)")

    print("\nKampot Harvest Co. data successfully synced to Odoo!")

if __name__ == '__main__':
    sync_to_odoo()
