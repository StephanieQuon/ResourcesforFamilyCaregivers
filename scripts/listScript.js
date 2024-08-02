document.addEventListener('DOMContentLoaded', function () {
    const resourceList = document.getElementById('resource-list');
    const searchInput = document.getElementById('search');
    const conditionFilter = document.getElementById('condition-filter');
    const regionFilter = document.getElementById('region-filter');
    const costFilter = document.getElementById('cost-filter');
    const clearFiltersButton = document.getElementById('clear-filters');

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
            console.log('Parsed resources:', resources); 
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
        const conditions = new Set(resources.map(r => r['Condition(s)']));
        const regions = new Set(resources.map(r => r['Health Region']));
        const costs = new Set(resources.map(r => r['Cost']));

        populateFilter(conditionFilter, conditions);
        populateFilter(regionFilter, regions);
        populateFilter(costFilter, costs);
    }

    function populateFilter(filter, items) {
        filter.innerHTML = '';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            filter.appendChild(option);
        });
        M.FormSelect.init(filter);
    }

    function initializeAutocomplete(resources) {
        const options = {
            data: {}
        };
        resources.forEach(resource => {
            options.data[resource['Name of Organization']] = null;
        });
        const autocomplete = document.querySelector('.autocomplete');
        M.Autocomplete.init(autocomplete, { data: options.data });
    }

    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        document.querySelectorAll(".nav-link").forEach(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname;
            console.log(`Current Path: ${currentPath}, Link Path: ${linkPath}`);
            if (currentPath === linkPath) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }

    setActiveNavLink();

    searchInput.addEventListener('input', function () {
        const query = searchInput.value.toLowerCase();
        const filteredResources = resources.filter(resource => 
            resource['Name of Organization'].toLowerCase().includes(query) ||
            resource['Condition(s)'].toLowerCase().includes(query) ||
            resource['Health Region'].toLowerCase().includes(query)
        );
        displayResources(filteredResources);
    });

    conditionFilter.addEventListener('change', function () {
        filterResources();
    });

    regionFilter.addEventListener('change', function () {
        filterResources();
    });

    costFilter.addEventListener('change', function () {
        filterResources();
    });

    clearFiltersButton.addEventListener('click', function () {
        conditionFilter.value = '';
        regionFilter.value = '';
        costFilter.value = '';
        M.FormSelect.init(conditionFilter);
        M.FormSelect.init(regionFilter);
        M.FormSelect.init(costFilter);
        displayResources(resources);
    });

    function filterResources() {
        const selectedCondition = conditionFilter.value;
        const selectedRegion = regionFilter.value;
        const selectedCost = costFilter.value;

        const filteredResources = resources.filter(resource => {
            return (selectedCondition === '' || resource['Condition(s)'] === selectedCondition) &&
                   (selectedRegion === '' || resource['Health Region'] === selectedRegion) &&
                   (selectedCost === '' || resource['Cost'] === selectedCost);
        });
        displayResources(filteredResources);
    }
});
