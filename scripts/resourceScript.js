document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded.');

    const params = new URLSearchParams(window.location.search);
    const source = params.get('source');
    const resourceName = params.get('name');

    console.log(`Source: ${source}, Resource Name: ${resourceName}`);

    const backLink = document.getElementById('back-link');

    if (backLink) {
        // Instead of setting a specific href, set a click event listener
        backLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior
            window.history.back(); // Go back to the previous page
        });
        console.log(`Back link set to use window.history.back()`);
    } else {
        console.error('Back link element not found.');
    }

    fetch('files/resources.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            Papa.parse(data, {
                header: true,
                complete: function(results) {
                    const resources = results.data;
                    console.log('Parsed resources:', resources);

                    const resource = resources.find(row => row["Name of Organization"].trim() === resourceName.trim());
                    console.log('Found resource:', resource);

                    if (resource) {
                        document.getElementById('resource-name').textContent = resource["Name of Organization"];
                        
                        // Assuming the resource's image path is being pulled from the CSV as resource["image"]
                    
                        if (resource["images"]) {
                            document.getElementById('resource-header').style.backgroundImage = `url(${resource["images"]})`;
                        } else {
                            document.getElementById('resource-header').style.backgroundImage = 'none';
                        }

                        


                        document.getElementById('services-offered').textContent = resource["Services offered"];
                        const tags = resource["Tag"].split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('');
                        document.getElementById('tags').innerHTML = tags;
                        document.getElementById('address').textContent = `Address: ${resource["Address"]}`;
                        document.getElementById('phone').textContent = `Phone Number: ${resource["Contact phone number"]}`;
                        document.getElementById('website').innerHTML = `Website: <a href="${resource["Contact website"]}" target="_blank">${resource["Contact website"]}</a>`;
                        document.getElementById('email').innerHTML = `Email: <a href="mailto:${resource["Contact email"]}">${resource["Contact email"]}</a>`;
                        document.getElementById('status').textContent = `Status: ${resource["Status"]}`;
                        document.getElementById('cost').textContent = `Cost: ${resource["Cost"]}`;
                        document.getElementById('language').textContent = `Language: ${resource["Language restriction"]}`;
                        document.getElementById('condition').textContent = `Condition(s): ${resource["Condition(s)"]}`;
                        document.getElementById('health-region').textContent = `Health Region: ${resource["Health Region"]}`;
                        document.getElementById('virtual-inperson').textContent = `Service Type: ${resource["Virtual/In-person"]}`;
                        document.getElementById('age-restriction').textContent = `Age Restriction: ${resource["Age restriction"]}`;
                        
                        

                        // Add the Google Maps iframe from the "map" column
                        if (resource["map"]) {
                            document.getElementById('map-container').innerHTML = resource["map"];
                        } else {
                            document.getElementById('map-container').innerHTML = "No map available.";
                        }

                    } else {
                        document.getElementById('resource-name').textContent = 'Resource not found.';
                    }
                },
                error: function(error) {
                    console.error('PapaParse error:', error);
                }
            });
        })
        .catch(error => console.error('Fetch error:', error));
});
