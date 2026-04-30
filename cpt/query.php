<?php 

function pre_get_posts($query) {
    if (!is_admin() && $query->is_main_query() && isset($query->query['name'])) {

        $query->set('post_type', ['post', 'page', 'zrealizowane_projekty']);
    }
}