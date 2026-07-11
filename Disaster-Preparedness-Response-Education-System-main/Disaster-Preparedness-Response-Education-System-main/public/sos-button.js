document.addEventListener('DOMContentLoaded', () => {
    // Unified SOS triggers for students
    window.triggerVoiceSOS = function() {
        // Trigger voice recording SOS
        const description = "Voice emergency recorded by student";
        const department = "All";
        sendSosAlert(description, department, "Voice-Recording");
    };

    window.triggerTextSOS = function() {
        // Show the SOS modal for text input
        showModal(document.getElementById('sos-modal'));
    };

    // Create floating SOS button
    const sosButton = document.createElement('button');
    sosButton.id = 'floating-sos-button';
    sosButton.title = 'Report an Emergency (SOS Mailbox)';
    sosButton.innerHTML = '📬 SOS Mailbox';
    document.body.appendChild(sosButton);

    // Create SOS modal container
    const sosModal = document.createElement('div');
    sosModal.id = 'sos-modal';
    sosModal.innerHTML = `
        <div class="sos-modal-content">
            <h2>📬 Emergency Mailbox</h2>
            <p>Describe your emergency so the Admin control room knows exactly what happened:</p>
            <textarea id="sos-description" rows="4" placeholder="e.g., Fire in classroom, Flood water entering campus, need rescue at..."></textarea>
            
            <p style="margin-top:15px; margin-bottom:5px; font-weight:bold;">Alert Department:</p>
            <select id="sos-department" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; margin-bottom:15px;">
                <option value="All">All Emergency Services</option>
                <option value="Police">Police 🚓</option>
                <option value="Fire Brigade">Fire Brigade 🚒</option>
                <option value="Hospital">Hospital / Ambulance 🚑</option>
            </select>

            <div class="sos-modal-actions">
                <button id="sos-send-btn" class="btn primary">Send Alert</button>
                <button id="sos-cancel-btn" class="btn secondary">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(sosModal);

    // Create confirmation modal container
    const confirmModal = document.createElement('div');
    confirmModal.id = 'confirm-modal';
    confirmModal.innerHTML = `
        <div class="confirm-modal-content">
            <h3>Confirm Emergency Alert</h3>
            <p>Are you sure you want to send an emergency alert?</p>
            <div class="confirm-modal-actions">
                <button id="confirm-yes-btn" class="btn primary">Yes, Send</button>
                <button id="confirm-no-btn" class="btn secondary">No, Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmModal);

    // Create Auto-Detection Simulators Panel
    const simulatorPanel = document.createElement('div');
    simulatorPanel.id = 'sensor-simulator';
    simulatorPanel.style.cssText = 'position:fixed; bottom:20px; left:20px; background:rgba(0,0,0,0.85); color:white; padding:15px; border-radius:10px; z-index:9999; box-shadow:0 4px 10px rgba(0,0,0,0.5); width:200px;';
    simulatorPanel.innerHTML = `
        <h4 style="margin:0 0 10px 0; border-bottom:1px solid #555; padding-bottom:5px; font-size:14px; text-align:center;">🤖 Auto-Detect Simulators</h4>
        <button id="sim-fire" style="background:#e74c3c; color:white; border:none; padding:8px 10px; margin-bottom:8px; width:100%; border-radius:4px; cursor:pointer; font-weight:bold;">🔥 Detect Fire</button>
        <button id="sim-flood" style="background:#3498db; color:white; border:none; padding:8px 10px; margin-bottom:8px; width:100%; border-radius:4px; cursor:pointer; font-weight:bold;">🌊 Detect Flood</button>
        <button id="sim-landslide" style="background:#8e44ad; color:white; border:none; padding:8px 10px; margin-bottom:8px; width:100%; border-radius:4px; cursor:pointer; font-weight:bold;">⛰️ Detect Landslide</button>
        <p style="margin:5px 0 0 0; font-size:11px; opacity:0.8; text-align:center;">Real Shake = Earthquake</p>
    `;
    document.body.appendChild(simulatorPanel);

    // Common Sense Check: Government doesn't need SOS button, they read it! Students use unified button
    if (localStorage.getItem('userRole') === 'Government' || localStorage.getItem('userRole') === 'Student') {
        sosButton.style.display = 'none';
        simulatorPanel.style.display = 'none';
    }

    // Show/hide modal helpers
    function showModal(modal) { modal.style.display = 'block'; }
    function hideModal(modal) { modal.style.display = 'none'; }

    // Event listeners for Manual SOS
    sosButton.addEventListener('click', () => showModal(sosModal));
    document.getElementById('sos-cancel-btn').addEventListener('click', () => hideModal(sosModal));

    document.getElementById('sos-send-btn').addEventListener('click', () => {
        const description = document.getElementById('sos-description').value.trim();
        if (!description) {
            alert('Please enter a description of the emergency.');
            return;
        }
        hideModal(sosModal);
        showModal(confirmModal);
    });

    document.getElementById('confirm-no-btn').addEventListener('click', () => hideModal(confirmModal));
    document.getElementById('confirm-yes-btn').addEventListener('click', () => {
        hideModal(confirmModal);
        const description = document.getElementById('sos-description').value.trim();
        const department = document.getElementById('sos-department').value;
        sendSosAlert(description, department, "Manual");
    });

    // Event Listeners for Simulator Buttons
    document.getElementById('sim-fire').addEventListener('click', () => {
        alert("🔥 FIRE SENSOR TRIGGERED! Sending automatic SOS...");
        sendSosAlert("AUTOMATIC FIRE SENSOR DETECTION TRIPPED!", "Fire Brigade", "Auto-Fire");
    });
    document.getElementById('sim-flood').addEventListener('click', () => {
        alert("🌊 WATER IMMERSION SENSOR TRIPPED! Sending automatic SOS...");
        sendSosAlert("AUTOMATIC FLOOD WATER DETECTION TRIPPED!", "All", "Auto-Flood");
    });
    document.getElementById('sim-landslide').addEventListener('click', () => {
        alert("⛰️ LANDSLIDE / PRESSURE SENSOR TRIPPED! Sending automatic SOS...");
        sendSosAlert("AUTOMATIC LANDSLIDE/SOIL PRESSURE DETECTION TRIPPED!", "All", "Auto-Landslide");
    });

    // Earthquake Shake Detection (Real Accelerometer)
    let lastX = null, lastY = null, lastZ = null;
    let shakeThreshold = 15; // Set shake threshold
    let lastShakeTime = 0;

    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            let current = event.accelerationIncludingGravity;
            if (!current.x) return; // Not supported on current device

            if (lastX !== null) {
                let deltaX = Math.abs(lastX - current.x);
                let deltaY = Math.abs(lastY - current.y);
                let deltaZ = Math.abs(lastZ - current.z);

                if (deltaX > shakeThreshold && deltaY > shakeThreshold) {
                    let now = Date.now();
                    if (now - lastShakeTime > 5000) { // Prvent multiple fires within 5 seconds
                        lastShakeTime = now;
                        alert("⚠️ EARTHQUAKE SHAKE DETECTED! Sending Automatic SOS...");
                        sendSosAlert("AUTOMATIC EARTHQUAKE SENSOR TRIPPED! SHAKING DETECTED!", "All", "Auto-Earthquake");
                    }
                }
            }
            lastX = current.x;
            lastY = current.y;
            lastZ = current.z;
        });
    }

    // Prepare SOS Alert
    function sendSosAlert(description, targetDepartment, triggerType) {
        const senderName = localStorage.getItem('userName') || 'Unknown User';
        const senderRole = localStorage.getItem('userRole') || 'Student';
        const senderClass = localStorage.getItem('userClass') || 'N/A';

        // Clean old alerts
        cleanOldAlerts();

        // Let user choose risk if manual, otherwise default to High Risk for Auto
        if (triggerType === "Manual") {
            showRiskZoneSelectionModal(description, senderName, senderRole, senderClass, targetDepartment, triggerType);
        } else {
            // Auto triggers skip risk selection and go straight to High Risk
            executeSosSending(description, senderName, senderRole, senderClass, "High Risk", targetDepartment, triggerType);
        }
    }

    // Function to remove alerts older than 1 day
    function cleanOldAlerts() {
        const alerts = JSON.parse(localStorage.getItem('sosAlerts') || '[]');
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const filteredAlerts = alerts.filter(alert => new Date(alert.timestamp) >= oneDayAgo);
        localStorage.setItem('sosAlerts', JSON.stringify(filteredAlerts));
    }

    // Function to show risk zone selection modal
    function showRiskZoneSelectionModal(description, senderName, senderRole, senderClass, targetDepartment, triggerType) {
        let riskModal = document.getElementById('risk-zone-modal');
        if (!riskModal) {
            riskModal = document.createElement('div');
            riskModal.id = 'risk-zone-modal';
            riskModal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:10000;';
            riskModal.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; width: 300px; text-align: center;">
                    <h3>Select Risk Zone</h3>
                    <select id="risk-zone-select" style="width: 100%; padding: 8px; margin: 15px 0;">
                        <option value="High Risk">🔴 High Risk</option>
                        <option value="Medium Risk">🟡 Medium Risk</option>
                        <option value="Low Risk">🟢 Low Risk</option>
                    </select>
                    <button id="risk-zone-confirm-btn" class="btn primary" style="margin-right: 10px;">Confirm</button>
                    <button id="risk-zone-cancel-btn" class="btn secondary">Cancel</button>
                </div>
            `;
            document.body.appendChild(riskModal);

            document.getElementById('risk-zone-confirm-btn').addEventListener('click', () => {
                const selectedRisk = document.getElementById('risk-zone-select').value;
                riskModal.style.display = 'none';
                executeSosSending(description, senderName, senderRole, senderClass, selectedRisk, targetDepartment, triggerType);
            });
            document.getElementById('risk-zone-cancel-btn').addEventListener('click', () => {
                riskModal.style.display = 'none';
            });
        }
        riskModal.style.display = 'flex';
    }

    // Execute Final GPS Location and Saving
    async function executeSosSending(description, senderName, senderRole, senderClass, selectedRisk, targetDepartment, triggerType) {
        let audioDataUrl = null;
        
        try {
            // Ask for mic and record 5 seconds
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];
            
            mediaRecorder.addEventListener("dataavailable", event => {
                if (event.data.size > 0) audioChunks.push(event.data);
            });
            
            const toast = document.createElement('div');
            toast.innerText = "🎙️ Recording SOS Audio (5s)... Please speak!";
            toast.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(231,76,60,0.9);color:white;padding:15px;border-radius:8px;z-index:99999;font-weight:bold;";
            document.body.appendChild(toast);
            
            const recordPromise = new Promise(resolve => {
                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        audioDataUrl = reader.result;
                        resolve();
                    };
                    reader.readAsDataURL(audioBlob);
                });
            });

            mediaRecorder.start();
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            mediaRecorder.stop();
            document.body.removeChild(toast);
            stream.getTracks().forEach(track => track.stop());
            
            await recordPromise;
        } catch(e) {
            console.error("Audio recording failed or denied", e);
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    saveAlert(description, senderName, senderRole, senderClass, selectedRisk, targetDepartment, triggerType, position.coords.latitude, position.coords.longitude, audioDataUrl);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    // Generate random nearby location for demo if GPS fails
                    const baseLat = 26.2183, baseLng = 78.1828;
                    const randLat = baseLat + (Math.random() - 0.5) * 0.05;
                    const randLng = baseLng + (Math.random() - 0.5) * 0.05;
                    saveAlert(description, senderName, senderRole, senderClass, selectedRisk, targetDepartment, triggerType, randLat, randLng, audioDataUrl);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        } else {
            // Generate random location
            const baseLat = 26.2183, baseLng = 78.1828;
            saveAlert(description, senderName, senderRole, senderClass, selectedRisk, targetDepartment, triggerType, baseLat, baseLng, audioDataUrl);
        }
    }

    function saveAlert(description, senderName, senderRole, senderClass, selectedRisk, targetDepartment, triggerType, lat, lng, audioDataUrl) {
        const riskEmoji = selectedRisk === 'High Risk' ? '🔴' : selectedRisk === 'Medium Risk' ? '🟡' : '🟢';
        const riskColor = selectedRisk === 'High Risk' ? 'red' : selectedRisk === 'Medium Risk' ? 'orange' : 'green';

        const email = localStorage.getItem('userEmail') || 'guest';

        const alertObj = {
            id: Date.now().toString(),
            senderName,
            senderRole,
            senderClass,
            senderPhone: localStorage.getItem(`userPhone_${email}`) || localStorage.getItem('userPhone') || 'N/A',
            senderParentDetails: localStorage.getItem(`userParentDetails_${email}`) || localStorage.getItem('userParentDetails') || 'N/A',
            senderEmail: email,
            location: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            lat: lat,
            lng: lng,
            description,
            timestamp: new Date().toISOString(),
            riskZone: selectedRisk,
            riskEmoji,
            riskColor,
            targetDepartment,
            triggerType,
            audioDataUrl,
            acknowledged: false
        };

        // No loud sound played on sender device
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);

        // Firebase Push
        if (window.db) {
            try {
                // We overwrite with a real Date just for Firebase to keep sorting perfect
                alertObj.timestamp = new Date();
                window.db.collection("live_sos_signals").add(alertObj)
                .then(() => {
                    console.log("SOS securely dispatched to Live Servers.");
                })
                .catch((error) => console.error("Firebase SOS Error:", error));
            } catch(e) { console.log(e); }
        }

        // Keep local fallback storage as well
        const alerts = JSON.parse(localStorage.getItem('sosAlerts') || '[]');
        // Restore string timestamp for local compatibility just in case
        alertObj.timestamp = new Date().toISOString(); 
        alerts.push(alertObj);
        localStorage.setItem('sosAlerts', JSON.stringify(alerts));

        alert(`${triggerType} ALERT SENT TO: ${targetDepartment}\nLocation: ${alertObj.location}\nRisk: ${selectedRisk}`);

        // For students, show the tracking map after sending SOS
        if (senderRole === 'Student') {
            showStudentTrackingMap(lat, lng);
        }

        // Refresh Map logic if mapped script exists
        if (typeof window.refreshSOSMarkers === 'function') window.refreshSOSMarkers();

        // Clear modal description
        const descElement = document.getElementById('sos-description');
        if (descElement) descElement.value = '';
    }

    // Function to show student tracking map
    function showStudentTrackingMap(studentLat, studentLng) {
        // Hide features grid and show map container
        const featuresGrid = document.querySelector('.features-grid');
        const mapContainer = document.getElementById('student-map-container');
        
        if (featuresGrid) featuresGrid.style.display = 'none';
        if (mapContainer) mapContainer.style.display = 'block';

        // Scroll to the map
        mapContainer.scrollIntoView({ behavior: 'smooth' });

        // Initialize map
        const map = L.map('tracking-map').setView([studentLat, studentLng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add student location marker
        const studentMarker = L.marker([studentLat, studentLng]).addTo(map)
            .bindPopup('📍 Your Location')
            .openPopup();

        // Simulate emergency vehicles with road-following routes
        const policeStart = [studentLat + 0.01, studentLng + 0.012];
        const ambulanceStart = [studentLat - 0.01, studentLng - 0.012];
        const studentEnd = [studentLat, studentLng];

        // Get routes for vehicles (simulated road paths)
        const policeRoute = getSimulatedRoute(policeStart, studentEnd, 0.0018);
        const ambulanceRoute = getSimulatedRoute(ambulanceStart, studentEnd, 0.0015);

        // Create vehicle markers
        const policeMarker = L.marker(policeRoute[0], {
            icon: L.divIcon({
                html: '🚓',
                className: 'vehicle-icon',
                iconSize: [30, 30]
            })
        }).addTo(map).bindPopup('🚓 Police - Responding');

        const ambulanceMarker = L.marker(ambulanceRoute[0], {
            icon: L.divIcon({
                html: '🚑',
                className: 'vehicle-icon',
                iconSize: [30, 30]
            })
        }).addTo(map).bindPopup('🚑 Ambulance - Responding');

        // Draw routes on map with better styling
        if (policeRoute.length > 1) {
            L.polyline(policeRoute, {
                color: '#007bff', 
                weight: 4, 
                opacity: 0.8,
                dashArray: '8, 8' // Dashed line for police route
            }).addTo(map);
        }
        if (ambulanceRoute.length > 1) {
            L.polyline(ambulanceRoute, {
                color: '#dc3545', 
                weight: 4, 
                opacity: 0.8,
                dashArray: '5, 12' // Different dash pattern for ambulance
            }).addTo(map);
        }

        // Animate vehicles along routes
        animateVehicleAlongRoute(policeMarker, policeRoute, 'police');
        animateVehicleAlongRoute(ambulanceMarker, ambulanceRoute, 'ambulance');
    }

    // Function to get simulated road route (creates curved path that looks like roads)
    function getSimulatedRoute(start, end, curveStrength = 0.0018) {
        const [startLat, startLng] = start;
        const [endLat, endLng] = end;
        
        const points = [];
        const numPoints = 30; // More points for smoother road curves
        
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const ease = t * t * (3 - 2 * t); // smooth ease in/out

            // Create a gentle curved route
            const lat = startLat + (endLat - startLat) * ease + Math.sin(t * Math.PI) * curveStrength;
            const lng = startLng + (endLng - startLng) * ease + Math.cos(t * Math.PI * 1.2) * curveStrength;

            points.push([lat, lng]);
        }
        
        return points;
    }

    // Function to animate vehicle along route
    function animateVehicleAlongRoute(marker, route, vehicleType) {
        if (route.length < 2) return;

        let currentSegment = 0;
        let progressInSegment = 0;
        const segmentsPerSecond = 0.5; // Speed control
        
        const interval = setInterval(() => {
            if (currentSegment < route.length - 1) {
                const startPoint = route[currentSegment];
                const endPoint = route[currentSegment + 1];
                
                // Interpolate between current segment points
                const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * progressInSegment;
                const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * progressInSegment;
                
                marker.setLatLng([lat, lng]);
                
                progressInSegment += segmentsPerSecond / 10; // Smooth movement
                
                if (progressInSegment >= 1) {
                    progressInSegment = 0;
                    currentSegment++;
                }
                
                // Calculate remaining distance and ETA
                const remainingSegments = (route.length - 1 - currentSegment) + (1 - progressInSegment);
                const etaMinutes = Math.max(1, Math.ceil(remainingSegments / segmentsPerSecond / 6)); // Convert to minutes
                
                const etaElement = document.getElementById(`${vehicleType}-eta`);
                if (etaElement) {
                    const label = vehicleType === 'police' ? '🚓 Police' : '🚑 Ambulance';
                    etaElement.textContent = `${label}: ${etaMinutes} min`;
                }
            } else {
                // Arrived
                clearInterval(interval);
                const etaElement = document.getElementById(`${vehicleType}-eta`);
                if (etaElement) {
                    const label = vehicleType === 'police' ? '🚓 Police' : '🚑 Ambulance';
                    etaElement.textContent = `${label}: Arrived`;
                }
            }
        }, 100); // Update every 100ms for smooth animation
    }

    // Helper function to calculate route distance
    function calculateRouteDistance(route) {
        let distance = 0;
        for (let i = 1; i < route.length; i++) {
            const [lat1, lng1] = route[i-1];
            const [lat2, lng2] = route[i];
            distance += Math.sqrt((lat2 - lat1)**2 + (lng2 - lng1)**2);
        }
        return distance;
    }
});
