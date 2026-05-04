<?php

class MyCPT{

    public function __construct() {
        $this->hooks();
    }

    private function hooks() {
        add_action('init', [$this, 'init']);

        //add_filter('post_type_link', [$this, 'project_link'], 10, 2);
        add_action('pre_get_posts', [$this, 'my_query']);
        add_action('edited_projekt_kategoria',[$this, 'save_cat_img']);
        add_action('projekt_kategoria_edit_form_fields', [$this,'add_img_field']);
        add_action('admin_enqueue_scripts',[$this,'load_media']);
    }

    public function init() {

        $this->register_cpt();
        $this->register_taxonomy();
        $this->structure();
        $this->register_meta();
        $this->add_cat_img();
    }

    public function register_cpt() {

        register_post_type('projekty', [
            'labels' => [
                'name' => 'Zrealizowane projekty',
                'singular_name' => 'Projekt',
            ],
            'public' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'has_archive' => false,

            'rewrite' => [
                'slug' => 'zrealizowane-projekty',
                'with_front' => true
            ],
        ]);
    }

    public function register_taxonomy() {

        register_taxonomy('projekt_kategoria', ['projekty'], [
            'labels' => [
                'name' => 'Kategorie projektów',
                'singular_name' => 'Kategoria projektu',
            ],
            'hierarchical' => true,

            'show_ui' => true,
            'show_admin_column' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'public' => true,
            'publicly_queryable' => true,
            'query_var' => true,

            'rewrite' => [
                'slug' => 'projekty-kategorie',
                'with_front' => false,
            ],
        ]);
    }

    public function structure() {

        $structure = [
            'Transport i mobilność' => [
                'Tramwaje',
                'Kolej',
                'Transport publiczny',
                'Autobusy i transport publiczny',
                'Infrastruktura rowerowa',
                'Węzły przesiadkowe',
                'Infrastruktura drogowa',
                'Planowanie transportu',
            ],
            'Gospodarka odpadami' => [
                'PSZOK',
                'Termiczne przetwarzanie / odzysk energii',
                'Kompostowanie i osady',
                'Systemy gospodarki odpadami',
            ],
            'Projekty środowiskowe' => [
                'Zielona i niebieska infrastruktura',
                'Efektywność energetyczna',
                'OZE i magazyny energii',
                'Wod-kan i gospodarka wodna',
            ],
            'Kultura i edukacja' => ['Kultura', 'Edukacja'],
            'E-usługi' => ['Cyfryzacja i e-usługi'],
            'Sport i rekreacja' => [
                'Infrastruktura prozdrowotna',
                'Obiekty sportowe',
                'Infrastruktura aktywności',
            ],
            'Medycyna' => ['Infrastruktura zdrowia'],
            'Doradztwo prawne' => ['Pomoc publiczna', 'Formalno-prawne'],
            'Doradztwo finansowe' => [
                'Rekompensaty',
                'Audyty',
                'Wyceny',
                'Modele i plany finansowe',
            ],
            'Pozostałe' => ['Pozostałe'],
        ];

        foreach ($structure as $parent => $children) {

            $parent_term = term_exists($parent, 'projekt_kategoria');

            if (!$parent_term) {
                $parent_term = wp_insert_term($parent, 'projekt_kategoria');
            }

            if (is_wp_error($parent_term)) {
                continue;
            }

            $parent_id = is_array($parent_term)
                ? $parent_term['term_id']
                : $parent_term;

            foreach ($children as $child) {

                if (!term_exists($child, 'projekt_kategoria')) {
                    wp_insert_term($child, 'projekt_kategoria', [
                        'parent' => $parent_id
                    ]);
                }
            }
        }
    }


    public function project_link($post_link, $post) {

        if ($post->post_type === 'projekty') {
            return home_url('/' . $post->post_name . '/');
        }

        return $post_link;
    }

    public function my_query($query) {

    if (is_admin() || !$query->is_main_query()) {
        return;
    }

    if ($query->is_singular('projekty')) {
        $query->set('post_type', ['projekty']);
    }
    }

    public function register_meta() {

    $fields = [
        'year' => 'integer',
        'client' => 'string',
        'support_range' => 'string',
    ];

    foreach ($fields as $key => $type) {

        register_post_meta('projekty', $key, [
            'single' => true,
            'type' => $type,
            'show_in_rest' => [
                'schema' => [
                    'type' => $type,
                    'context' => ['view', 'edit']
                ]
            ],
        ]);
    }
    }

    public function add_cat_img() {
    register_term_meta('projekt_kategoria', 'category_image', [
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'auth_callback' => function () {
            return current_user_can('manage_categories');
        }
    ]);
    }

    public function add_img_field($term) {

    $image_id = get_term_meta($term->term_id, 'category_image', true);
    $image_url = $image_id ? wp_get_attachment_url($image_id) : '';

    ?>
    <tr class="form-field">
        <th scope="row">Image</th>
        <td>
            <input type="hidden" name="category_image" id="category_image" value="<?php echo esc_attr($image_id); ?>">

            <img id="category_image_preview"
                 src="<?php echo esc_url($image_url); ?>"
                 style="max-width:120px; display:block; margin-bottom:10px;">

            <button type="button" class="button select-image">
                Wybierz obraz
            </button>

            <script>
                jQuery(function ($) {

                    let frame;

                    $('.select-image').on('click', function (e) {
                        e.preventDefault();

                        if (frame) {
                            frame.open();
                            return;
                        }

                        frame = wp.media({
                            title: 'Wybierz obraz',
                            button: { text: 'Ustaw obraz' },
                            multiple: false
                        });

                        frame.on('select', function () {
                            const attachment = frame.state().get('selection').first().toJSON();

                            $('#category_image').val(attachment.id);
                            $('#category_image_preview').attr('src', attachment.url);
                        });

                        frame.open();
                    });
                });
            </script>
        </td>
    </tr>
    <?php
    }

    public function save_cat_img($term_id) {
    if (isset($_POST['category_image'])) {
        update_term_meta(
            $term_id,
            'category_image',
            (int) $_POST['category_image']
        );
    }
    }

    public function load_media($hook) {
    if ($hook === 'term.php' || $hook === 'edit-tags.php') {
        wp_enqueue_media();
    }
    }
}

new MyCPT();
