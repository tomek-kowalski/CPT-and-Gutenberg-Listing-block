<?php 

/*
Plugin Name: Project listing configurator
Description: This plugin is used to list IMS projects.
Author: Tomasz Kowalski
Version: 1.0.0
*/

namespace Main;

if (!defined('ABSPATH')) {
    exit;
}

define('IMS_PATH', plugin_dir_path(__FILE__));
define('IMS_URL', plugin_dir_url(__FILE__));
define('IMS_VERSION', '1.0.0');

add_action('plugins_loaded', function () {
    require_once IMS_PATH . 'blocks/autoload.php';
    require_once IMS_PATH . 'cpt/cpt.php';

    new \Main\MyBlocks();
});