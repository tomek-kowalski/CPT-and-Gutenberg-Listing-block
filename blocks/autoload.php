<?php

namespace Main;

if (!defined('ABSPATH')) {
    exit;
}

class MyBlocks {

    public function __construct() {
        $this->includes();
        add_action('enqueue_block_editor_assets',[$this,'enqueue_block_editor_assets']);
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
}

