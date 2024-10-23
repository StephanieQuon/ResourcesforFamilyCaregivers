document.addEventListener('DOMContentLoaded', function () {
    const resourceList = document.getElementById('resource-list');
    const searchInput = document.getElementById('search');
    const suggestionsContainer = document.getElementById('suggestions');

    if (!resourceList || !searchInput || !suggestionsContainer) {
        console.error('Required elements are missing from the page.');
        return;
    }

    resourceList.classList.add('hidden'); 

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
        })
        .catch(error => {
            console.error('Error fetching or parsing the CSV file:', error);
        });

    // function displayResources(filteredResources) {
    //     if (filteredResources.length === 0) {
    //         resourceList.classList.add('hidden');
    //         return;
    //     }
        
    //     resourceList.innerHTML = '';
    //     filteredResources.forEach(resource => {
    //         const resourceCard = document.createElement('div');
    //         resourceCard.className = 'resource-card';
    //         resourceCard.innerHTML = `
    //             <div>
    //                 <h5>${resource['Name of Organization']}</h5>
    //                 <p class="condition">${resource['Condition(s)']}</p>
    //                 <p>${resource['Health Region']}</p>
    //             </div>
    //             <a href="resource.html?name=${encodeURIComponent(resource['Name of Organization'])}" class="btn view-resource">View Resource</a>
    //         `;
    //         resourceList.appendChild(resourceCard);
    //     });

    //     resourceList.classList.remove('hidden');
    // }

    function displayResources(filteredResources) {
        if (filteredResources.length === 0) {
            resourceList.classList.add('hidden');
            return;
        }
        
        resourceList.innerHTML = '';
        filteredResources.forEach(resource => {
            const resourceCard = document.createElement('div');
            resourceCard.className = 'resource-card';
            resourceCard.innerHTML = `
                <div>
                    <h5>${resource['Name of Organization']}</h5>
                    <p class="condition">${resource['Condition(s)']}</p>
                    <p>${resource['Health Region']}</p>
                </div>
            `;
    
            // Make the entire card clickable
            resourceCard.addEventListener('click', () => {
                window.location.href = `resource.html?name=${encodeURIComponent(resource['Name of Organization'])}`;
            });
    
            resourceList.appendChild(resourceCard);
        });
    
        resourceList.classList.remove('hidden');
    }
    

    
    

    function filterResources() {
        const searchValue = searchInput ? searchInput.value.toLowerCase() : '';

        if (searchValue) {
            const filteredResources = resources.filter(resource => 
                resource['Name of Organization'].toLowerCase().includes(searchValue) ||
                resource['Tag'].toLowerCase().includes(searchValue)
            );
            displayResources(filteredResources);
        } else {
            resourceList.classList.add('hidden'); 
        }
    }

    searchInput.addEventListener('input', () => {
        filterResources();

        document.querySelectorAll('.suggestion-bubble').forEach(bubble => {
            if (searchInput.value.toLowerCase() === bubble.dataset.value) {
                bubble.classList.add('selected');
            } else {
                bubble.classList.remove('selected');
            }
        });
    });

    const suggestions = ['COVID', 'Cancer', 'ALS', 'Diabetes', 'Palliative', 'Child Health'];
    suggestions.forEach(suggestion => {
        const bubble = document.createElement('div');
        bubble.className = 'suggestion-bubble';
        bubble.textContent = suggestion;
        bubble.dataset.value = suggestion.toLowerCase();

        bubble.addEventListener('click', () => {
            if (bubble.classList.contains('selected')) {
                searchInput.value = '';
                document.querySelectorAll('.suggestion-bubble').forEach(b => b.classList.remove('selected'));
                filterResources();
            } else {
                searchInput.value = bubble.dataset.value;
                filterResources();
                document.querySelectorAll('.suggestion-bubble').forEach(b => b.classList.remove('selected'));
                bubble.classList.add('selected');
            }
        });

        suggestionsContainer.appendChild(bubble);
    });

    //navigation bar

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

