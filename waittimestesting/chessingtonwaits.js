// Thorpe Park configuration with CORS proxy
        
        
        // Try different CORS proxies - if one fails, it will try the next
        const CORS_PROXIES = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://proxy.cors.sh/',
            '' // Try direct as last resort
        ];

        async function loadThorpeParkQueueTimes() {
            const container = document.getElementById('wait-times');
            container.innerHTML = '<div class="loading">🔄 Loading wait times...</div>';
    
            // Try each proxy until one works
            for (const proxy of CORS_PROXIES) {
                try {
                    console.log(`Trying proxy: ${proxy || 'direct'}`);

                    const apiUrl = `https://queue-times.com/parks/${3}/queue_times.json`;
                    const urlWithProxy = proxy + encodeURIComponent(apiUrl);
                    
                    const response = await fetch(urlWithProxy, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const queueData = await response.json();
                    console.log('Queue data received:', queueData);
                    
                    displayThorpeParkWaitTimes(queueData);
                    return; // Success - exit the function
                    
                } catch (error) {
                    console.log(`Proxy failed: ${error.message}`);
                    lastError = error;
                    continue; // Try next proxy
                }
            }
            
        }

        function displayThorpeParkWaitTimes(data) {
            const container = document.getElementById('wait-times');
            
            if (!data.lands || data.lands.length === 0) {
                container.innerHTML = '<div class="error">No ride data available at the moment.</div>';
                return;
            }

            let html = `<h2>Chessington World of Adventures - Current Wait Times</h2>`;
            
            data.lands.forEach(land => {
                html += `
                    <div class="land">
                        <h3>🎢 ${land.name}</h3>
                `;
                
                if (land.rides && land.rides.length > 0) {
                    land.rides.forEach(ride => {
                        const rideElement = getRideHTML(ride);
                        html += rideElement;
                    });
                } else {
                    html += '<p>No ride information available for this area.</p>';
                }
                
                html += '</div>';
            });

            const now = new Date();
            html += `
                <div class="last-updated">
                    Last updated: ${now.toLocaleTimeString()} 
                    | Data provided by Queue-Times.com
                </div>
            `;

            container.innerHTML = html;
        }

        function getRideHTML(ride) {
            let cssClass = '';
            let statusText = '';
            let waitTimeDisplay = '';
            
            if (!ride.is_open) {
                cssClass = 'closed';
                statusText = 'CLOSED';
                waitTimeDisplay = '<span class="wait-time">🔒 CLOSED</span>';
            } else {
                const waitTime = ride.wait_time;
                
                if (waitTime === 0) {
                    cssClass = 'low-wait';
                    waitTimeDisplay = '<span class="wait-time">🚶 Walk On</span>';
                } else if (waitTime < 20) {
                    cssClass = 'low-wait';
                    waitTimeDisplay = `<span class="wait-time">🟢 ${waitTime} min</span>`;
                } else if (waitTime < 45) {
                    cssClass = 'medium-wait';
                    waitTimeDisplay = `<span class="wait-time">🟡 ${waitTime} min</span>`;
                } else {
                    cssClass = 'high-wait';
                    waitTimeDisplay = `<span class="wait-time">🔴 ${waitTime} min</span>`;
                }
            }

            return `
                <div class="ride ${cssClass}">
                    <strong>${ride.name}</strong>
                    ${waitTimeDisplay}
                    <div style="clear: both;"></div>
                    ${statusText ? `<small>Status: ${statusText}</small>` : ''}
                </div>
            `;
        }

        // Load data when page loads
        document.addEventListener('DOMContentLoaded', function() {
            loadThorpeParkQueueTimes();
        });