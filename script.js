document.addEventListener('DOMContentLoaded', function () {
    const resourceList = document.getElementById('resource-list');
    const searchInput = document.getElementById('search');
    const conditionFilter = document.getElementById('condition-filter');
    const regionFilters = document.getElementById('region-filters');
    const costFilters = document.getElementById('cost-filters');
    const virtualFilter = document.getElementById('virtual-filter');
    const clearFiltersButton = document.getElementById('clear-filters');
    const filterBubbles = {};

    M.FormSelect.init(document.querySelectorAll('select'));

    fetch('resources.csv')
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
        const conditions = new Set();
        const regions = new Set();
        const costs = new Set();
        const virtualOptions = new Set();

        resources.forEach(resource => {
            resource['Condition(s)'].split(';').forEach(condition => conditions.add(condition.trim()));
            regions.add(resource['Health Region']);
            costs.add(resource['Cost']);
            virtualOptions.add(resource['Virtual/In-person']);
        });

        const sortedConditions = Array.from(conditions).sort();
        const sortedRegions = Array.from(regions).sort();
        const sortedCosts = Array.from(costs).sort();
        const sortedVirtualOptions = Array.from(virtualOptions).sort();

        sortedConditions.forEach(condition => {
            const option = document.createElement('option');
            option.value = condition;
            option.textContent = condition;
            conditionFilter.appendChild(option);
        });

        sortedRegions.forEach(region => {
            const bubble = document.createElement('div');
            bubble.className = 'filter-bubble';
            bubble.textContent = region;
            bubble.dataset.value = region;
            bubble.addEventListener('click', () => toggleFilter(bubble, 'region'));
            regionFilters.appendChild(bubble);
        });

        sortedCosts.forEach(cost => {
            const bubble = document.createElement('div');
            bubble.className = 'filter-bubble';
            bubble.textContent = cost;
            bubble.dataset.value = cost;
            bubble.addEventListener('click', () => toggleFilter(bubble, 'cost'));
            costFilters.appendChild(bubble);
        });

        sortedVirtualOptions.forEach(option => {
            const bubble = document.createElement('div');
            bubble.className = 'filter-bubble';
            bubble.textContent = option;
            bubble.dataset.value = option;
            bubble.addEventListener('click', () => toggleFilter(bubble, 'virtual'));
            virtualFilter.appendChild(bubble);
        });
    }

    function toggleFilter(bubble, type) {
        const value = bubble.dataset.value;

        document.querySelectorAll(`#${type}-filters .filter-bubble`).forEach(b => {
            if (b !== bubble) b.classList.remove('selected');
        });

        bubble.classList.toggle('selected');
        filterBubbles[type] = bubble.classList.contains('selected') ? new Set([value]) : new Set();

        filterResources();
    }

    function initializeAutocomplete(resources) {
        const autocompleteData = {};
        resources.forEach(resource => {
            autocompleteData[resource['Name of Organization']] = null; 
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
    clearFiltersButton.addEventListener('click', () => {
        searchInput.value = '';
        conditionFilter.selectedIndex = 0;
        regionFilters.querySelectorAll('.filter-bubble').forEach(bubble => bubble.classList.remove('selected'));
        costFilters.querySelectorAll('.filter-bubble').forEach(bubble => bubble.classList.remove('selected'));
        virtualFilter.querySelectorAll('.filter-bubble').forEach(bubble => bubble.classList.remove('selected'));
        filterBubbles['region'] = new Set();
        filterBubbles['cost'] = new Set();
        filterBubbles['virtual'] = new Set();
        M.FormSelect.init(document.querySelectorAll('select'));
        filterResources();
    });

    function filterResources() {
        const searchValue = searchInput.value.toLowerCase();
        const conditionValue = conditionFilter.value;

        fetch('resources.csv')
            .then(response => response.text())
            .then(data => {
                let resources = Papa.parse(data, { header: true }).data;

                if (searchValue) {
                    resources = resources.filter(resource => resource['Name of Organization'].toLowerCase().includes(searchValue));
                }
                if (conditionValue) {
                    resources = resources.filter(resource => resource['Condition(s)'].includes(conditionValue));
                }
                if (filterBubbles['region'].size > 0) {
                    resources = resources.filter(resource => filterBubbles['region'].has(resource['Health Region']));
                }
                if (filterBubbles['cost'].size > 0) {
                    resources = resources.filter(resource => filterBubbles['cost'].has(resource['Cost']));
                }
                if (filterBubbles['virtual'].size > 0) {
                    resources = resources.filter(resource => filterBubbles['virtual'].has(resource['Virtual/In-person']));
                }

                displayResources(resources);
            });
    }

    document.querySelectorAll(".nav-link").forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add("active");
        }
    });
});
