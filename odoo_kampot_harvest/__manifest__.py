# -*- coding: utf-8 -*-
{
    'name': 'Kampot Harvest Co. Storefront',
    'version': '1.0.0',
    'category': 'Website/Theme',
    'summary': 'Artisan Roasted Cashews Direct-to-Consumer Storefront with AI Sommelier for Kampot Harvest Co.',
    'description': """
        Kampot Harvest Co. — Custom E-Commerce Storefront for Odoo.
        Integrates the reactive React + Tailwind + Motion artisan cashew store
        natively into your Odoo Website at /kampot.
    """,
    'author': 'Kampot Harvest Co.',
    'website': 'https://kampotharvest.com',
    'depends': ['website', 'website_sale'],
    'data': [
        'views/templates.xml',
    ],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
