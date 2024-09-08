document.addEventListener('DOMContentLoaded', function () {
    const resourceList = document.getElementById('resource-list');
    let resources = [];

    fetch('files/resources.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            resources = Papa.parse(data, { header: true }).data;
            displayResources(resources);
        })
        .catch(error => {
            console.error('Error fetching or parsing the CSV file:', error);
        });

    // Function to display resources
    function displayResources(resourcesToDisplay) {
        resourceList.innerHTML = '';
        resourcesToDisplay.forEach(resource => {
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

    // Function to filter resources by letter
    function filterResourcesByLetter(letter) {
        const filteredResources = resources.filter(resource =>
            resource['Name of Organization'].toUpperCase().startsWith(letter)
        );
        displayResources(filteredResources);
    }

    // Add event listeners to letter buttons
    document.querySelectorAll('.letter-list button').forEach(button => {
        button.addEventListener('click', function () {
            const selectedLetter = this.getAttribute('data-letter').toUpperCase();
            filterResourcesByLetter(selectedLetter);
        });
    });
});
