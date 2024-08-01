document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source');
    const resourceName = params.get('name');

    console.log(`Source: ${source}, Resource Name: ${resourceName}`);

    const backLink = document.getElementById('back-link');

    if (source === 'browse') {
        backLink.setAttribute('href', 'browse.html');
    } else if (source === 'list') {
        backLink.setAttribute('href', 'list.html');
    } else {
        backLink.setAttribute('href', 'search.html');
    }

    fetch('files/resources.csv')
        .then(response => response.text())
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
                        document.getElementById('virtual-inperson').textContent = resource["Virtual/In-person"];
                        document.getElementById('age-restriction').textContent = `Age Restriction: ${resource["Age restriction"]}`;
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
