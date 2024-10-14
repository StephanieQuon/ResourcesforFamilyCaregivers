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
            // Check if there's a letter query param in the URL
            const urlParams = new URLSearchParams(window.location.search);
            const selectedLetter = urlParams.get('letter');
            if (selectedLetter) {
                filterResourcesByLetter(selectedLetter.toUpperCase());
            } else {
                displayResources(resources);
            }
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
        
        // Update the URL to reflect the selected letter
        const newUrl = `${window.location.pathname}?letter=${letter}`;
        history.pushState({ letter: letter }, '', newUrl);
    }

    // Add event listeners to letter buttons
    document.querySelectorAll('.letter-list button').forEach(button => {
        button.addEventListener('click', function () {
            const selectedLetter = this.getAttribute('data-letter').toUpperCase();
            filterResourcesByLetter(selectedLetter);
        });
    });

    // Handle the back/forward buttons to restore the previous state
    window.addEventListener('popstate', function (event) {
        if (event.state && event.state.letter) {
            filterResourcesByLetter(event.state.letter);
        } else {
            // If no state exists (no letter selected), display all resources
            displayResources(resources);
        }
    });
});
