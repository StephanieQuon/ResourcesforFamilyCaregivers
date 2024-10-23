document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const resourceList = document.getElementById('resource-list');
    const searchInput = document.getElementById('search');
    const conditionFilter = document.getElementById('condition-filter');
    const regionFilters = document.getElementById('region-filters');
    const costFilters = document.getElementById('cost-filters');
    const virtualFilter = document.getElementById('virtual-filter');
    const clearFiltersButton = document.getElementById('clear-filters');
    const searchStatus = document.getElementById('search-status');
    const noResultsMessage = document.getElementById('no-results-message');
    const resultsCount = document.getElementById('results-count');

    // Filter State
    const filterBubbles = {
        'region': new Set(),
        'cost': new Set(),
        'virtual': new Set()
    };

    // Data Storage
    let allResources = [];
    let filteredResources = [];

    // Initialize Materialize Select
    M.FormSelect.init(document.querySelectorAll('select'));

    // Initialize a single IntersectionObserver for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting || entry.intersectionRatio > 0.1) {
                const img = entry.target;
                // Swap placeholder with actual image
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.onload = () => img.classList.add('loaded'); // Optional: for fade-in effect
                    delete img.dataset.src;
                }
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px', // Preload images slightly before they enter the viewport
        threshold: 0.1
    });

    // Fetch and Initialize Data
    const fetchData = async () => {
        try {
            const response = await fetch('files/resources.csv');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.text();
            const parsedData = Papa.parse(data, { header: true }).data.filter(resource => resource['Name of Organization']);
            allResources = parsedData;
            initializeFilters(allResources);
            initializeAutocomplete(allResources);
            filterResources();
            resultsCount.textContent = `Number of results found: ${allResources.length}`;
        } catch (error) {
            console.error('Error fetching or parsing the CSV file:', error);
        }
    };

    // Display Resources
    const displayResources = (resources) => {
        const fragment = document.createDocumentFragment();

        resources.forEach(resource => {
            const resourceCard = document.createElement('div');
            resourceCard.className = 'resource-card';

            // Create a <picture> element for responsive images with WebP and fallback
            const picture = document.createElement('picture');

            // WebP source
            const sourceWebP = document.createElement('source');
            sourceWebP.type = 'image/webp';
            sourceWebP.srcset = getResponsiveSrcSet(resource["images"], 'webp');
            picture.appendChild(sourceWebP);

            // Fallback source (e.g., JPEG)
            const sourceFallback = document.createElement('source');
            sourceFallback.type = 'image/jpeg';
            sourceFallback.srcset = getResponsiveSrcSet(resource["images"], 'jpg');
            picture.appendChild(sourceFallback);

            // Placeholder image
            const img = document.createElement('img');
            img.src = 'files/placeholder.png'; // Low-res placeholder
            img.dataset.src = resource["images"] ? resource["images"] : 'files/placeholder.png';
            img.alt = resource['Name of Organization'];
            img.className = 'lazy-resource-image';
            img.loading = 'lazy'; // Native lazy loading as a fallback
            picture.appendChild(img);

            resourceCard.appendChild(picture);

            // Resource Details
            const detailsDiv = document.createElement('div');
            detailsDiv.innerHTML = `
                <h5>${resource['Name of Organization']}</h5>
                <p class="condition">${resource['Condition(s)']}</p>
                <p>${resource['Health Region']}</p>
            `;
            resourceCard.appendChild(detailsDiv);

            // Click event to navigate
            resourceCard.addEventListener('click', () => {
                window.location.href = `resource.html?name=${encodeURIComponent(resource['Name of Organization'])}`;
            });

            fragment.appendChild(resourceCard);

            // Observe the image for lazy loading
            img && imageObserver.observe(img);
        });

        // Update the resource list
        resourceList.innerHTML = '';
        resourceList.appendChild(fragment);

        // Update results count
        resultsCount.textContent = `Number of results found: ${resources.length}`;

        // Handle no results message
        noResultsMessage.style.display = resources.length === 0 ? 'block' : 'none';
        resultsCount.style.display = resources.length === 0 ? 'none' : 'block';
    };

    // Generate responsive srcset
    const getResponsiveSrcSet = (imagePath, format) => {
        if (!imagePath) return '';
        const baseName = imagePath.substring(0, imagePath.lastIndexOf('.'));
        return `
            ${baseName}-small.${format} 400w,
            ${baseName}-medium.${format} 800w,
            ${baseName}-large.${format} 1200w
        `;
    };

    // Initialize Filters
    const initializeFilters = (resources) => {
        const conditions = new Set();
        const regions = new Set();
        const costs = new Set();
        const virtualOptions = new Set();

        resources.forEach(resource => {
            if (resource['Condition(s)']) {
                resource['Condition(s)'].split(';').forEach(condition => conditions.add(condition.trim()));
            }
            if (resource['Health Region']) regions.add(resource['Health Region']);
            if (resource['Cost']) costs.add(resource['Cost']);
            if (resource['Virtual/In-person']) virtualOptions.add(resource['Virtual/In-person']);
        });

        populateSelect(conditionFilter, conditions, 'Choose Condition');
        populateFilterBubbles(regionFilters, regions, 'region');
        populateFilterBubbles(costFilters, costs, 'cost');
        populateFilterBubbles(virtualFilter, virtualOptions, 'virtual');

        // Re-initialize Materialize select elements after populating
        M.FormSelect.init(document.querySelectorAll('select'));
    };

    // Populate <select> elements
    const populateSelect = (selectElement, items, placeholder) => {
        selectElement.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        Array.from(items).sort().forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    };

    // Populate filter bubbles
    const populateFilterBubbles = (container, items, type) => {
        container.innerHTML = ''; // Clear existing bubbles
        Array.from(items).sort().forEach(item => {
            const bubble = document.createElement('div');
            bubble.className = 'filter-bubble';
            bubble.textContent = item;
            bubble.dataset.value = item;
            bubble.addEventListener('click', () => toggleFilter(bubble, type));
            container.appendChild(bubble);
        });
    };

    // Toggle filter selection
    const toggleFilter = (bubble, type) => {
        const value = bubble.dataset.value;

        // Allow multiple selections for bubble filters
        bubble.classList.toggle('selected');
        if (bubble.classList.contains('selected')) {
            filterBubbles[type].add(value);
        } else {
            filterBubbles[type].delete(value);
        }

        filterResources();
    };

    // Initialize Autocomplete
    const initializeAutocomplete = (resources) => {
        const autocompleteData = {};
        resources.forEach(resource => {
            if (resource['Name of Organization']) {
                autocompleteData[resource['Name of Organization']] = null;
            }
        });

        M.Autocomplete.init(searchInput, {
            data: autocompleteData,
            limit: 10, // Limit the number of autocomplete suggestions
            onAutocomplete: () => {
                filterResources();
            }
        });
    };

    // Debounce Function
    const debounce = (func, delay) => {
        let debounceTimer;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // Filter Resources Based on Criteria
    const filterResources = () => {
        const searchValue = searchInput.value.toLowerCase().trim();
        const conditionValue = conditionFilter.value;

        filteredResources = allResources.filter(resource => {
            // Search Filter
            const matchesSearch = !searchValue || (
                (resource['Name of Organization'] && resource['Name of Organization'].toLowerCase().includes(searchValue)) ||
                (resource['Tags'] && resource['Tags'].toLowerCase().includes(searchValue))
            );

            // Condition Filter
            const matchesCondition = !conditionValue || (resource['Condition(s)'] && resource['Condition(s)'].includes(conditionValue));

            // Region Filter
            const matchesRegion = filterBubbles['region'].size === 0 || (resource['Health Region'] && filterBubbles['region'].has(resource['Health Region']));

            // Cost Filter
            const matchesCost = filterBubbles['cost'].size === 0 || (resource['Cost'] && filterBubbles['cost'].has(resource['Cost']));

            // Virtual/In-person Filter
            const matchesVirtual = filterBubbles['virtual'].size === 0 || (resource['Virtual/In-person'] && filterBubbles['virtual'].has(resource['Virtual/In-person']));

            return matchesSearch && matchesCondition && matchesRegion && matchesCost && matchesVirtual;
        });

        displayResources(filteredResources);
    };

    // Clear All Filters
    const clearFilters = () => {
        searchInput.value = '';
        conditionFilter.selectedIndex = 0;
        document.querySelectorAll('.filter-bubble.selected').forEach(bubble => bubble.classList.remove('selected'));
        filterBubbles['region'].clear();
        filterBubbles['cost'].clear();
        filterBubbles['virtual'].clear();
        filterResources();
    };

    // Event Listeners
    searchInput.addEventListener('input', debounce(filterResources, 300));
    conditionFilter.addEventListener('change', filterResources);
    clearFiltersButton.addEventListener('click', clearFilters);

    // Set Active Navigation Link
    const setActiveNavLink = () => {
        const currentPath = window.location.pathname;
        document.querySelectorAll(".nav-link").forEach(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname;
            if (currentPath === linkPath) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    };

    setActiveNavLink();
    fetchData();
});
