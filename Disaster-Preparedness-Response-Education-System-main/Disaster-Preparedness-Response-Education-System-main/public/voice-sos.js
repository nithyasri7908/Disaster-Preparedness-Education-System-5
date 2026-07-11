// voice-sos.js - Fixed with Capacitor Speech Recognition + Hindi Support + Continuous Listening

document.addEventListener('DOMContentLoaded', async () => {
    const voiceBtn = document.getElementById('voiceSosBtn');
    const floatingVoiceBtn = document.getElementById('floatingVoiceBtn');
    const voiceOverlay = document.getElementById('voiceOverlay');
    const voiceOverlayStatus = document.getElementById('voiceOverlayStatus');
    const voiceOverlayIcon = document.getElementById('voiceOverlayIcon');
    let isListening = false;
    let recognition;
    let isCapacitor = !!window.Capacitor;
    let speechPlugin;

    // Hindi + English keywords (expanded for better recognition)
    const keywords = {
        police: ['police', 'पुलिस', 'पुलिसवालों', '100', 'cops', 'cop', 'thana'],
        ambulance: ['ambulance', 'एम्बुलेंस', 'medical', 'hospital', 'hospital', '108', 'doctor'],
        fire: ['fire', 'आग', 'fire brigade', 'फायर ब्रिगेड', '101', 'firebiket'],
        disaster: ['disaster', 'आपदा', 'emergency', 'इमरजेंसी', '1078', 'helpline']
    };

    // Initialize based on platform
    async function initRecognition() {
        if (isCapacitor) {
            try {
                speechPlugin = await import('@capacitor-community/speech-recognition');
                await speechPlugin.SpeechRecognition.requestPermissions();
                console.log('✅ Capacitor Speech Recognition ready (Native)');
            } catch (error) {
                console.warn('Capacitor plugin failed, falling back to Web Speech API', error);
                initWebSpeech();
            }
        } else {
            initWebSpeech();
        }
    }

    function initWebSpeech() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.lang = 'hi-IN,en-IN';
            recognition.interimResults = true;
            setupWebSpeechEvents();
            console.log('✅ Web Speech API ready (Browser fallback)');
        } else {
            console.error('❌ No speech recognition available');
            if (voiceBtn) voiceBtn.innerHTML = '<span style="font-size:2rem;">❌</span><div>Voice not supported</div>';
        }
    }

    function setupWebSpeechEvents() {
        recognition.onstart = onStart;
        recognition.onresult = onWebResult;
        recognition.onerror = onError;
        recognition.onend = onEnd;
    }

    // Capacitor Speech Events
    async function setupCapacitorEvents() {
        await speechPlugin.SpeechRecognition.addListener('partialResults', (result) => {
            if (voiceOverlayStatus) voiceOverlayStatus.textContent = `Hearing: "${result.matches?.[0] || ''}"`;
        });

        await speechPlugin.SpeechRecognition.addListener('finalResults', (result) => {
            console.log('Capacitor final result:', result);
            processVoiceCommand(result.matches?.[0] || '');
        });

        await speechPlugin.SpeechRecognition.addListener('error', (error) => {
            console.error('Capacitor speech error:', error);
            onError({ error: error.error || 'audio-capture' });
        });
    }

    function onWebResult(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        voiceOverlayStatus.textContent = `Recognized: "${transcript}"`;
        if (event.results[event.results.length - 1].isFinal) {
            processVoiceCommand(transcript.toLowerCase());
        }
    }

    const toggleListening = async () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    async function startListening() {
        try {
            isListening = true;
            updateUI('listening');

            if (isCapacitor && speechPlugin) {
                await setupCapacitorEvents();
                await speechPlugin.SpeechRecognition.start({
                    language: 'hi-IN,en-IN',
                    maxResults: 5,
                    promptForPermissions: true,
                    continuous: true
                });
            } else if (recognition) {
                recognition.start();
            }
        } catch (error) {
            console.error('Start failed:', error);
            onError({ error: 'not-allowed' });
        }
    }

    async function stopListening() {
        try {
            if (isCapacitor && speechPlugin) {
                await speechPlugin.SpeechRecognition.stop();
            } else if (recognition) {
                recognition.stop();
            }
        } catch (error) {
            console.warn('Stop error:', error);
        }
        resetVoiceBtn();
    }

    function onStart() {
        console.log('🎤 Listening started');
    }

    function onEnd() {
        if (isListening) {
            // Auto-restart for continuous listening
            setTimeout(startListening, 500);
        }
    }

    function onError(event) {
        console.error('Speech error:', event.error);
        isListening = false;
        let message = 'Voice error. ';
        switch (event.error) {
            case 'not-allowed':
                message += 'Please allow microphone access.';
                break;
            case 'no-speech':
                message += 'No speech detected. Try again.';
                break;
            case 'audio-capture':
                message += 'Microphone issue. Check permissions.';
                break;
            default:
                message += 'Try again.';
        }
        alert(message);
        resetVoiceBtn();
    }

    function updateUI(state) {
        if (voiceBtn) voiceBtn.classList.toggle('listening', state === 'listening');
        if (floatingVoiceBtn) floatingVoiceBtn.classList.toggle('listening', state === 'listening');
        if (voiceOverlay) {
            voiceOverlay.style.display = state === 'listening' ? 'flex' : 'none';
            voiceOverlayIcon.textContent = state === 'listening' ? '👂' : '🎤';
        }
    }

    function resetVoiceBtn() {
        isListening = false;
        updateUI('idle');
        if (voiceBtn) {
            voiceBtn.innerHTML = `
                <span style="font-size: 2.5rem; margin-right: 15px;">🎤</span>
                <div style="text-align: left;">
                    <h3 style="margin: 0; font-size: 1.5rem;">Smart Voice SOS</h3>
                    <small>Tap & Say "पुलिस", "एम्बुलेंस", "आग" or "Police", "Ambulance", "Fire"</small>
                </div>
            `;
            voiceBtn.style.animation = '';
            voiceBtn.style.background = '';
        }
        if (floatingVoiceBtn) floatingVoiceBtn.classList.remove('listening');
    }

    // Enhanced keyword matching
    function processVoiceCommand(text) {
        console.log('Processing:', text);
        text = text.toLowerCase();

        for (const [service, words] of Object.entries(keywords)) {
            if (words.some(word => text.includes(word))) {
                const serviceMap = {
                    police: { number: '100', name: 'Police Emergency' },
                    ambulance: { number: '108', name: 'Ambulance' },
                    fire: { number: '101', name: 'Fire Brigade' },
                    disaster: { number: '1078', name: 'Disaster Helpline' }
                };
                executeSmartRouting(serviceMap[service], text);
                return;
            }
        }
        alert('Try: "पुलिस", "एम्बुलेंस", "आग" या "police", "ambulance", "fire"');
        resetVoiceBtn();
    }

    // Location + Call (unchanged)
    function executeSmartRouting(service, recognizedText) {
        updateUIStatus('📍 Locating...', 'blue');
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => getLocationName(position.coords.latitude, position.coords.longitude, service),
                () => initiateCall('your area', service.name, service.number),
                { timeout: 8000, enableHighAccuracy: true }
            );
        } else {
            initiateCall('your area', service.name, service.number);
        }
    }

    async function getLocationName(lat, lon, service) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.state_district || 'local area';
            initiateCall(city, service.name, service.number);
        } catch {
            initiateCall('local area', service.name, service.number);
        }
    }

    function initiateCall(city, serviceName, serviceNumber) {
        updateUIStatus(`📞 Calling ${city} ${serviceName} (${serviceNumber})`, 'green');
        setTimeout(() => {
            if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
                window.location.href = `tel:${serviceNumber}`;
            } else {
                alert(`🚨 EMERGENCY ROUTED!\n📍 ${city}\n📞 ${serviceName}\n🔢 ${serviceNumber}`);
            }
            setTimeout(resetVoiceBtn, 3000);
        }, 1500);
    }

    function updateUIStatus(message, color) {
        if (voiceOverlayStatus) voiceOverlayStatus.textContent = message;
        if (voiceOverlayIcon) {
            voiceOverlayIcon.style.color = color === 'blue' ? '#3498db' : '#2ecc71';
        }
        if (voiceBtn) {
            voiceBtn.innerHTML = `<span style="font-size:2rem;">${color === 'blue' ? '📍' : '📞'}</span><span style="font-weight:bold;">${message}</span>`;
            voiceBtn.style.background = color === 'blue' ? '#3498db' : '#2ecc71';
        }
    }

    // Event listeners
    if (voiceBtn) voiceBtn.addEventListener('click', toggleListening);
    if (floatingVoiceBtn) floatingVoiceBtn.addEventListener('click', toggleListening);

    // Initialize
    await initRecognition();
});
