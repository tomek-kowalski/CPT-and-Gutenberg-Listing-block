document.addEventListener('DOMContentLoaded', () => {

    const root = document.querySelector('.wp-block-ims-filters');
    if (!root) return;

    // -------------------------
    // STATE
    // -------------------------
    const state = {
        category: '',
        subcategory: '',
        client: '',
        year: '',
        support: '',
        page: 1
    };

    // -------------------------
    // UI ELEMENTS
    // -------------------------
    const sektorSelect = root.querySelector('[data-filter="category"]');
    const podsektorSelect = root.querySelector('[data-filter="subcategory"]');
    const clientSelect = root.querySelector('[data-filter="client"]');
    const yearSelect = root.querySelector('[data-filter="year"]');
    const supportSelect = root.querySelector('[data-filter="support"]');

    const results = root.querySelector('[data-results]');
    const pagination = root.querySelector('[data-pagination]');
    const setFiltersDisabled = (disabled) => {
        sektorSelect.disabled = disabled;
        podsektorSelect.disabled = disabled;
        clientSelect.disabled = disabled;
        yearSelect.disabled = disabled;
        supportSelect.disabled = disabled;
    };

    // -------------------------
    // HELPERS
    // -------------------------
    const createOption = (value, label) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        return opt;
    };

    root.addEventListener('click', (e) => {
    const btn = e.target.closest('.post-button');
    if (!btn) return;

    const postEl = btn.closest('.project-item');

    const full = postEl.querySelector('.project-full-content');
    const title = postEl.querySelector('.project-title');
    const excerpt = postEl.querySelector('.project-excerpt');

    const isOpen = postEl.classList.toggle('expanded');

    if (isOpen) {
        full.style.display = 'block';
        title.style.display = 'none';
        excerpt.style.display = 'block';
        btn.textContent = 'Mniej';
    } else {
        full.style.display = 'none';
        title.style.display = 'block';
        excerpt.style.display = 'none';
        btn.textContent = 'Więcej...';
    }
    });

    // -------------------------
    // LOAD PARENTS (SEKTOR)
    // -------------------------
    function loadCategories() {
        fetch('/wp-json/wp/v2/projekt_kategoria?parent=0')
            .then(res => res.json())
            .then(data => {
                sektorSelect.innerHTML = '<option value="">Wybierz sektor</option>';

                data.forEach(term => {
                    sektorSelect.appendChild(createOption(term.id, term.name));
                });
            });
    }

    // -------------------------
    // LOAD CHILDREN (PODSEKTOR)
    // -------------------------
    function loadSubcategories(parentId) {
        podsektorSelect.innerHTML = '<option value="">Wybierz podsektor</option>';
        setupDynamicPlaceholder(sektorSelect, 'Wybierz sektor');

        if (!parentId) return;

        fetch(`/wp-json/wp/v2/projekt_kategoria?parent=${parentId}`)
            .then(res => res.json())
            .then(data => {
                data.forEach(term => {
                    podsektorSelect.appendChild(createOption(term.id, term.name));
                    setupDynamicPlaceholder(podsektorSelect, 'Wybierz podsektor');
                });
            });
    }

    // -------------------------
    // LOAD META FILTERS
    // -------------------------
    const truncate = (str, max = 40) =>
    str.length > max ? str.slice(0, max) + '…' : str;

    function loadMetaFilters() {
        fetch('/wp-json/custom/v1/filters')
            .then(res => res.json())
            .then(data => {

                clientSelect.innerHTML = '<option value="">Klient</option>';
                yearSelect.innerHTML = '<option value="">Rok</option>';
                supportSelect.innerHTML = '<option value="">Zakres wsparcia</option>';

                data.clients.forEach(v => {
                    clientSelect.appendChild(createOption(v, truncate(v)));
                });

                const uniqueSortedYears = [...new Set(data.years)]
                    .map(v => parseInt(v, 10))
                    .filter(v => !isNaN(v))
                    .sort((a, b) => b - a);

                    uniqueSortedYears.forEach(v => {
                        yearSelect.appendChild(createOption(v, v));
                    });

                data.support_range.forEach(v => {
                    supportSelect.appendChild(createOption(v, truncate(v)));
                });

                setupDynamicPlaceholder(clientSelect, 'Klient');
                setupDynamicPlaceholder(yearSelect, 'Rok');
                setupDynamicPlaceholder(supportSelect, 'Zakres wsparcia');
            });
    }

    let termMap = {};

    function loadTermsImages() {
    return fetch('/wp-json/wp/v2/projekt_kategoria?per_page=100')
        .then(res => res.json())
        .then(data => {
            data.forEach(term => {
                termMap[term.id] = term;
            });
        });
    }

    function loadAllTerms() {
    fetch('/wp-json/wp/v2/projekt_kategoria?per_page=100')
        .then(res => res.json())
        .then(data => {

            data.forEach(term => {
                termMap[term.id] = term;
            });

        });
    }

    // -------------------------
    // LOAD POSTS
    // -------------------------
    function loadPosts() {

    const query = new URLSearchParams();

    let loading = true;

    setFiltersDisabled(true); 

    if(loading) {
        results.innerHTML = '<p class="configurator-notice">Ładowanie projektów...</p>';
    }

    query.append('per_page', 18);
    query.append('page', state.page);

    const category = state.subcategory || state.category;
    if (category) {
        query.append('projekt_kategoria', category);
    }

    if (state.client) {
        query.append('client', state.client);
    }

    if (state.year) {
        query.append('year', state.year);
    }

    if (state.support) {
        query.append('support_range', state.support);
    }

    fetch(`/wp-json/wp/v2/projekty?${query.toString()}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const totalPages = res.headers.get('X-WP-TotalPages');
            renderPagination(totalPages);

            return res.json();
        })
        .then(posts => {
            renderPosts(posts);
        })
        .catch(err => {
            console.error('Fetch error:', err);
            results.innerHTML = '<p class="configurator-notice">Błąd ładowania danych</p>';
        })
        .finally(() => {
            setFiltersDisabled(false);
            loading = false;
        });

    }

    // -------------------------
    // RENDER POSTS
    // -------------------------
    function renderPosts(posts) {

    results.innerHTML = '';

    if (!posts.length) {
        results.innerHTML = '<p class="configurator-notice">Brak wyników</p>';
        return;
    }

    posts.forEach(post => {

        const el = document.createElement('div');
        el.className = 'project-item';

        const termIds = post.projekt_kategoria || [];
        const terms = termIds.map(id => termMap[id]).filter(Boolean);


        const subTerm = terms.find(t => t.parent && t.parent !== 0);

        const finalSubTerm = subTerm || terms[0];

        const parentTerm = finalSubTerm?.parent && termMap[finalSubTerm.parent] !==0
        ? termMap[finalSubTerm.parent]
        : subTerm;

        const sektor = parentTerm?.name;
        const podsektor = finalSubTerm?.name;

        const imageUrl = subTerm?.image?.url || '';

        el.innerHTML = `
            <div class="post-top">
                <div class="project-sector">${sektor}</div> /
                <div class="project-category">${podsektor}</div> /
                <div class="project-client">${post.meta?.client || 'Brak klienta'}</div> /
                <div class="project-year">${post.meta?.year || 'Brak roku'}</div>
            </div>
            <div class="content-frame">
                <div class="project-image">
                    ${imageUrl ? `<img src="${imageUrl}" class="project-thumb" />` : '<p>Brak obrazu</p>'}
                </div>
                <div class="project-info">
                    
                    <h2 class="project-title">${post.title.rendered}</h2>
                    <h2 class="project-title project-full-content">${post.content.rendered}</h2>
                    <ul class="project-excerpt">
                        <li>${post.meta?.support_range}</li>
                        <li>${post.excerpt.rendered}</li>
                    </ul>
                </div>
            </div>
            <div class="post-bottom">
                <button class="post-button" data-id="${post.id}">Więcej...</button>
            </div>
        `;

        results.appendChild(el);
    });
    }

    // -------------------------
    // PAGINATION
    // -------------------------
    function renderPagination(totalPages) {

    pagination.innerHTML = '';
    totalPages = parseInt(totalPages);

    if (totalPages <= 1) return;

    const createBtn = (label, page, disabled = false) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.disabled = disabled;

        if (!disabled) {
            btn.addEventListener('click', () => {
                state.page = page;
                loadPosts();
            });
        }

        return btn;
    };

    const current = state.page;

    // -------------------------
    // FIRST PAGE
    // -------------------------
    pagination.appendChild(createBtn(1, 1, current === 1));

    // -------------------------
    // INITIAL STATE (page 1)
    // -------------------------
    if (current === 1) {

        if (totalPages >= 2) {
            pagination.appendChild(createBtn(2, 2));
        }

        if (totalPages > 2) {
            pagination.appendChild(createBtn('=>', 2));
            pagination.appendChild(createBtn('koniec', totalPages));
        }

        return;
    }

    // -------------------------
    // PREV
    // -------------------------
    pagination.appendChild(createBtn('<=', current - 1));

    // -------------------------
    // CURRENT PAGE
    // -------------------------
    pagination.appendChild(createBtn(current, current, true));

    // -------------------------
    // NEXT
    // -------------------------
    if (current < totalPages) {
        pagination.appendChild(createBtn('=>', current + 1));
    }

    // -------------------------
    // LAST
    // -------------------------
    if (current !== totalPages) {
        pagination.appendChild(createBtn('koniec', totalPages));
    }
    }

    // -------------------------
    // EVENTS
    // -------------------------
    sektorSelect.addEventListener('change', (e) => {
        state.category = e.target.value;
        state.subcategory = '';
        state.page = 1;

        loadSubcategories(state.category);
        loadPosts();
    });

    podsektorSelect.addEventListener('change', (e) => {
        state.subcategory = e.target.value;
        state.page = 1;
        loadPosts();
    });

    clientSelect.addEventListener('change', (e) => {
        state.client = e.target.value;
        state.page = 1;
        loadPosts();
    });

    supportSelect.addEventListener('change', (e) => {
        state.support = e.target.value;
        state.page = 1;
        loadPosts();
    });

    yearSelect.addEventListener('change', (e) => {
        state.year = e.target.value;
        state.page = 1;
        loadPosts();
    });

    function setupDynamicPlaceholder(select, defaultText) {
    const firstOption = select.querySelector('option[value=""]');

    if (!firstOption) return;

    select.addEventListener('focus', () => {
        firstOption.textContent = 'Wybierz wszystko';
    });

    select.addEventListener('blur', () => {
    if (!select.value) {
        firstOption.textContent = defaultText;
    }
    });

    select.addEventListener('change', () => {
        firstOption.textContent = defaultText;
    });
    }

    // -------------------------
    // INIT
    // -------------------------

    Promise.all([
    loadTermsImages(),
    loadCategories(),
    loadMetaFilters(),
    //loadAllTerms()
    ]).then(() => {
    loadPosts();
    });
});