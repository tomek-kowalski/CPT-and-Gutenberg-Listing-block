<?php

namespace Main;

if (!defined('ABSPATH')) {
    exit;
}

class MyBlocks {

    public function __construct() {
        $this->includes();
        //add_action('enqueue_block_editor_assets',[$this,'enqueue_block_editor_assets']);
        add_filter('rest_projekty_query',[$this, 'filter_query' ], 10, 2);
        add_action('rest_api_init', [$this, 'register_filters_endpoint']);
        add_action('rest_api_init', [$this,'cat_imgage_for_gutenberg']);
    }

    private function includes() {
        require_once IMS_PATH . 'blocks/filters/filters.php';
    }

    public function enqueue_block_editor_assets() {
        global $post;

        if (!$post || $post->post_type !== 'projekty') {
        return;
        }

        wp_enqueue_script(
            'projekty-meta-sidebar',
            IMS_URL . 'blocks/assets-editor/meta-sidebar.js',
            ['wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data'],
            null,
            true
        );
    }

    public function filter_query($args, $request) {

    $meta_query = [];

    if ($client = $request->get_param('client')) {
        $meta_query[] = [
            'key' => 'client',
            'value' => $client,
            'compare' => 'LIKE'
        ];
    }

    if ($year = $request->get_param('year')) {
        $meta_query[] = [
            'key' => 'year',
            'value' => $year,
            'compare' => '='
        ];
    }

    if ($support = $request->get_param('support_range')) {
        $meta_query[] = [
            'key' => 'support_range',
            'value' => $support,
            'compare' => 'LIKE'
        ];
    }

    if (!empty($meta_query)) {
        $args['meta_query'] = $meta_query;
    }

    $tax_query = [];

    if ($term = $request->get_param('projekt_kategoria')) {
        $tax_query[] = [
            'taxonomy' => 'projekt_kategoria',
            'field' => 'term_id',
            'terms' => (array) $term,
        ];
    }

    if (!empty($tax_query)) {
        $args['tax_query'] = $tax_query;
    }

    return $args;
    }

    public function register_filters_endpoint() {

    register_rest_route('custom/v1', '/filters', [
        'methods'  => 'GET',
        'callback' => function () {

            global $wpdb;

            return [
                'clients' => $wpdb->get_col("
                    SELECT DISTINCT meta_value 
                    FROM $wpdb->postmeta 
                    WHERE meta_key = 'client' AND meta_value != ''
                "),
                'years' => $wpdb->get_col("
                    SELECT DISTINCT meta_value 
                    FROM $wpdb->postmeta 
                    WHERE meta_key = 'year' AND meta_value != ''
                "),
                'support_range' => $wpdb->get_col("
                    SELECT DISTINCT meta_value 
                    FROM $wpdb->postmeta 
                    WHERE meta_key = 'support_range' AND meta_value != ''
                ")
            ];
        },

        'permission_callback' => '__return_true',
    ]);
    }

    public function cat_imgage_for_gutenberg() {

    register_rest_field('projekt_kategoria', 'image', [
        'get_callback' => function ($term) {

            $image_id = get_term_meta($term['id'], 'category_image', true);

            if (!$image_id) {
                return null;
            }

            return [
                'id'  => (int) $image_id,
                'url' => wp_get_attachment_url($image_id),
            ];
        },
        'schema' => [
            'type' => 'object',
            'context' => ['view', 'edit'],
        ],
    ]);

    }
}



