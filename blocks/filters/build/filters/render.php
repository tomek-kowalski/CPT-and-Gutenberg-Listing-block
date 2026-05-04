<?php

if (!defined('ABSPATH')) {
    exit;
}

$wrapper_attributes = get_block_wrapper_attributes();
?>

<div <?php echo $wrapper_attributes; ?> class="wp-block-ims-filters">

    <div class="ims-filters">

        <div class="ims-filters__row">

            <select class="sektor-filter" data-filter="category">
                <option value="">Sektor</option>
            </select>

            <select class="podsektor-filter" data-filter="subcategory">
                <option value="">Podsektor</option>
            </select>

            <select class="klient-filter" data-filter="client">
                <option value="">Klient</option>
            </select>

            <select class="zakres-filter" data-filter="support">
                <option value="">Zakres wsparcia</option>
            </select>

            <select class="rok-filter" data-filter="year">
                <option value="">Rok</option>
            </select>

        </div>

        <div data-results class="ims-results">
            <p class="configurator-notice">Ładowanie projektów...</p>
        </div>

        <!-- PAGINATION -->
        <div data-pagination class="ims-pagination"></div>

    </div>

</div>