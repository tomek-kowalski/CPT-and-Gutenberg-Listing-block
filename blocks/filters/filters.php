<?php 
if (!defined('ABSPATH')) {
    exit;
}

function create_block_filters_block_init() {
    wp_register_block_types_from_metadata_collection(
        __DIR__ . '/build',
        __DIR__ . '/build/blocks-manifest.php'
    );
}

add_action('init', 'create_block_filters_block_init');