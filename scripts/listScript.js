document.addEventListener('DOMContentLoaded', function () {
    const resourceList = document.getElementById('resource-list');
    const searchInput = document.getElementById('search');
    const conditionFilter = document.getElementById('condition-filter');
    const regionFilter = document.getElementById('region-filter');
    const costFilter = document.getElementById('cost-filter');
    const clearFiltersButton = document.getElementById('clear-filters');

    // Initialize Materialize FormSelect
    M.FormSelect.init(document.querySelectorAll('select'));

    fetch('files/resources.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const resources = Papa.parse(data, { header: true }).data;
            console.log('Parsed resources:', resources); // Debug statement
            displayResources(resources);
            populateFilters(resources);
            initializeAutocomplete(resources);
        })
        .catch(error => {
            console.error('Error fetching or parsing the CSV file:', error);
        });

    function displayResources(resources) {
        resourceList.innerHTML = '';
        resources.forEach(resource => {
            const resourceCard = document.createElement('div');
            resourceCard.className = 'resource-card';
            resourceCard.innerHTML = `
                <div>
                    <h5>${resource['Name of Organization']}</h5>
                    <p class="condition">${resource['Condition(s)']}</p>
                    <p>${resource['Health Region']}</p>
                </div>
                <a href="resource.html?name=${encodeURIComponent(resource['Name of Organization'])}" class="btn view-resource">View Resource</a>
            `;
            resourceList.appendChild(resourceCard);
        });
    }

    function populateFilters(resources) {
        const conditions = new Set();
        const regions = new Set();
        const costs = new Set();

        resources.forEach(resource => {
            resource['Condition(s)'].split(';').forEach(condition => conditions.add(condition.trim()));
            regions.add(resource['Health Region']);
            costs.add(resource['Cost']);
        });

        const sortedConditions = Array.from(conditions).sort();
        const sortedRegions = Array.from(regions).sort();
        const sortedCosts = Array.from(costs).sort();

        sortedConditions.forEach(condition => {
            const option = document.createElement('option');
            option.value = condition;
            option.textContent = condition;
            conditionFilter.appendChild(option);
        });

        sortedRegions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionFilter.appendChild(option);
        });

        sortedCosts.forEach(cost => {
            const option = document.createElement('option');
            option.value = cost;
            option.textContent = cost;
            costFilter.appendChild(option);
        });

        M.FormSelect.init(document.querySelectorAll('select'));
    }

    function initializeAutocomplete(resources) {
        const autocompleteData = {};
        resources.forEach(resource => {
            autocompleteData[resource['Name of Organization']] = null; // You can add an image URL if you have one
        });

        M.Autocomplete.init(searchInput, {
            data: autocompleteData,
            onAutocomplete: function() {
                filterResources();
            }
        });
    }

    searchInput.addEventListener('input', () => filterResources());
    conditionFilter.addEventListener('change', () => filterResources());
    regionFilter.addEventListener('change', () => filterResources());
    costFilter.addEventListener('change', () => filterResources());
    clearFiltersButton.addEventListener('click', () => {
        searchInput.value = '';
        conditionFilter.selectedIndex = 0;
        regionFilter.selectedIndex = 0;
        costFilter.selectedIndex = 0;
        M.FormSelect.init(document.querySelectorAll('select'));
        filterResources();
    });

    function setActiveNavLink() {
        document.querySelectorAll(".nav-link").forEach(link => {
            const linkUrl = new URL(link.href).pathname;
            const currentUrl = new URL(window.location.href).pathname;
            if (linkUrl === currentUrl) {
                link.classList.add("active");
            }
        });
    }

    setActiveNavLink();
});