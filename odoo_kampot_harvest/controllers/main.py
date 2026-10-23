# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request

class KampotHarvestStoreController(http.Controller):

    @http.route(['/kampot', '/kampot-harvest', '/shop/artisan-cashews'], type='http', auth='public', website=True)
    def render_store(self, **kwargs):
        """Renders the custom Kampot Harvest React application natively inside Odoo."""
        return request.render('odoo_kampot_harvest.kampot_store_page', {})

    @http.route('/api/products', type='json', auth='public', methods=['POST', 'GET'], csrf=False)
    def api_products(self, **kwargs):
        """API endpoint returning Odoo product data."""
        products = request.env['product.template'].sudo().search([('website_published', '=', True)])
        return {
            'count': len(products),
            'products': [{
                'id': p.id,
                'name': p.name,
                'price': p.list_price,
                'description': p.description_sale or '',
            } for p in products]
        }

    @http.route('/api/health', type='json', auth='public', methods=['GET', 'POST'], csrf=False)
    def api_health(self, **kwargs):
        return {
            'status': 'ok',
            'service': 'Kampot Harvest Odoo Native Addon',
        }
