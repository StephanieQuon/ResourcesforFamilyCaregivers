// alphabetScript.js
document.addEventListener('DOMContentLoaded', function () {
    const resourceList = document.getElementById('resource-list');
    const alphabetFilters = document.getElementById('alphabet-filters');
    let allResources = [];

    fetch('files/resources.csv')
        .then(response => response.text())
        .then(data => {
            const resources = Papa.parse(data, { header: true }).data;
            allResources = resources;
            displayResources(resources);
        })
        .catch(error => console.error('Error fetching CSV:', error));

    alphabetFilters.addEventListener('click', event => {
        if (event.target.classList.contains('alphabet-filter')) {
            document.querySelectorAll('.alphabet-filter').forEach(span => {
                span.classList.remove('selected');
            });

            const selectedLetter = event.target.dataset.letter;
            event.target.classList.add('selected');

            const filteredResources = allResources.filter(resource =>
                resource['Name of Organization'].toLowerCase().startsWith(selectedLetter.toLowerCase())
            );

            displayResources(filteredResources);
        }
    });

    function displayResources(resources) {
        resourceList.innerHTML = '';
        resources.forEach(resource => {
            const resourceCard = document.createElement('div');
            resourceCard.className = 'resource-card';
            resourceCard.innerHTML = `
                <h5>${resource['Name of Organization']}</h5>
                <p class="condition">${resource['Condition(s)']}</p>
                <p>${resource['Health Region']}</p>
                <a href="resource.html?name=${encodeURIComponent(resource['Name of Organization'])}" class="btn">View Resource</a>
            `;
            resourceList.appendChild(resourceCard);
        });
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

});
