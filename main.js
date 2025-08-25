
/*!
 * OnlineCompass.me - Open Source Version
 * A browser-based tool for compass, Qibla direction, GPS location, elevation, and speed.
 * Free to use, modify, and distribute under the MIT License.
 * Author: info@onlinecompass.me
 * Website: https://onlinecompass.me
 */



// Add this to your existing theme toggle code
function updateCompassImage() {
    const compass = document.getElementById('compass');
    if (document.documentElement.classList.contains('dark')) {
        compass.src = 'compass-design-dark.svg';
    } else {
        compass.src = 'compass-design-light.svg';
    }
}

updateCompassImage();

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
    themeToggle.checked = true;
    updateCompassImage();
}

//permission card control
 // Simple JavaScript to handle closing the permission card
 document.getElementById('close-btn').addEventListener('click', function() {
    document.getElementById('compass-permission-control').style.display = 'none';
});

document.getElementById('close-text-btn').addEventListener('click', function() {
    document.getElementById('compass-permission-control').style.display = 'none';
});

// compass and location permissions combined
const compass = document.getElementById('compass');
const headingDisplay = document.getElementById('heading');
const permissionDisplay = document.getElementById('compass-permission-control');
const accessBtn = document.getElementById('access-btn');

// Track permission states
let orientationPermissionGranted = false;
let locationPermissionGranted = false;

// Check if device is iOS
function isiOS() {
    return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
           (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
}

// Track previous heading to prevent jumps
let previousHeading = null;
let isLandscape = false;

// Check orientation and set flag
function checkOrientation() {
    isLandscape = window.innerWidth > window.innerHeight;
}

// Initial orientation check
checkOrientation();

// Listen for orientation changes
window.addEventListener('resize', checkOrientation);

// Handle compass orientation
function handleOrientation(e) {
    // Calculate absolute heading based on device type
    // For iOS devices, webkitCompassHeading is already correct (0 = north)
    // For other devices, we need to calculate from alpha
    let absoluteHeading = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : 0);
    
    // Apply orientation correction for landscape mode if needed
    if (isLandscape) {
        // Get the screen orientation angle
        const orientation = window.orientation || 0;
        
        // Adjust heading based on orientation
        if (orientation === 90) {
            // Landscape right
            absoluteHeading = (absoluteHeading + 90) % 360;
        } else if (orientation === -90) {
            // Landscape left
            absoluteHeading = (absoluteHeading - 90 + 360) % 360;
        }
    }
    
    // Smooth transition when crossing 0°/360° boundary
    if (previousHeading !== null) {
        // If we're crossing the 0/360 boundary
        if (Math.abs(absoluteHeading - previousHeading) > 300) {
            // Choose the shortest path for rotation
            if (absoluteHeading > 340 && previousHeading < 20) {
                // We're rotating counterclockwise across the boundary
                absoluteHeading -= 360;
            } else if (absoluteHeading < 20 && previousHeading > 340) {
                // We're rotating clockwise across the boundary
                absoluteHeading += 360;
            }
        }
    }
    
    // Apply rotation and update display
    rotate(absoluteHeading);
    
    // Update previous heading (normalize between 0-360)
    previousHeading = absoluteHeading % 360;
    if (previousHeading < 0) previousHeading += 360;
}

// Apply rotation to compass and update heading display
function rotate(angle) {
    // Display heading and direction (always normalize to 0-360 for display)
    const displayAngle = angle % 360;
    const normalizedAngle = displayAngle < 0 ? displayAngle + 360 : displayAngle;
    const direction = getDirection(normalizedAngle);
    const formattedAngle = Math.round(normalizedAngle * 10) / 10;
    
    // We need to rotate the compass in the opposite direction
    // If you're facing North (0°), the compass needs to show North at the top
    const rotationAngle = 360 - angle;

    headingDisplay.textContent = `${direction} ${formattedAngle}°`;
    document.getElementById('direction-text').textContent = direction;

    
    // Rotate the compass image (can go beyond 0-360 for smooth transitions)
    compass.style.webkitTransform = `rotate(${rotationAngle}deg)`;
    compass.style.mozTransform = `rotate(${rotationAngle}deg)`;
    compass.style.msTransform = `rotate(${rotationAngle}deg)`;
    compass.style.oTransform = `rotate(${rotationAngle}deg)`;
    compass.style.transform = `rotate(${rotationAngle}deg)`;
}

// Convert angle to cardinal direction
function getDirection(angle) {
    if (angle >= 337.5 || angle < 22.5) return 'N';
    if (angle >= 22.5 && angle < 67.5) return 'NE';
    if (angle >= 67.5 && angle < 112.5) return 'E';
    if (angle >= 112.5 && angle < 157.5) return 'SE';
    if (angle >= 157.5 && angle < 202.5) return 'S';
    if (angle >= 202.5 && angle < 247.5) return 'SW';
    if (angle >= 247.5 && angle < 292.5) return 'W';
    if (angle >= 292.5 && angle < 337.5) return 'NW';
    return 'N'; // fallback
}








// Function to set up orientation tracking after permission is granted
function setupOrientationTracking() {
    // Remove existing event listeners first to avoid duplicates
    window.removeEventListener('deviceorientation', handleOrientation);
    window.removeEventListener('deviceorientationabsolute', handleOrientation);
    
    // Add the correct event listener based on device type
    if (isiOS()) {
        window.addEventListener('deviceorientation', handleOrientation);
    } else {
        // Try deviceorientationabsolute first, fall back to deviceorientation
        if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', handleOrientation);
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }
    }
}

// Function to handle real-time location tracking
function setupLocationTracking() {
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(position) {
        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;
        // Use location data as needed here
        // console.log(latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed);
        document.getElementById('latitude-text').textContent = latitude.toFixed(6) + '°';
        document.getElementById('longitude-text').textContent = longitude.toFixed(6) + '°';
        document.getElementById('accuracy-text').textContent = accuracy ? accuracy.toFixed(1) + ' m' : 'N/A';
        document.getElementById('altitude-text').textContent = altitude ? altitude.toFixed(1) + ' m' : 'N/A';
        document.getElementById('altitude-accuracy-text').textContent = altitudeAccuracy ? altitudeAccuracy.toFixed(1) + ' m' : 'N/A';
        document.getElementById('heading-text').textContent = heading ? heading.toFixed(1) + '°' : 'N/A';
        document.getElementById('speed-text').textContent = speed ? (speed * 3.6).toFixed(1) + ' km/h' : 'N/A';
    }

    function error() {
        // Silent error handling
    }

    // Start watching position for real-time updates
    const watchId = navigator.geolocation.watchPosition(success, error, options);
    return watchId;
}

// Check and request all necessary permissions
function checkAndRequestAllPermissions() {
    // Show permission display initially
    permissionDisplay.style.display = 'block';
    
    // Use existing permission status message element
    const permissionStatusMsg = document.getElementById('permissinStatusMsg');
    const permissionStatusBox = document.getElementById('permissinStatusBox');
    
    // Function to check if permission is blocked
    async function checkPermissionBlocked() {
        let orientationBlocked = false;
        let locationBlocked = false;
        
        // Check location permission
        if (navigator.permissions && navigator.permissions.query) {
            try {
                const locationStatus = await navigator.permissions.query({ name: 'geolocation' });
                locationBlocked = locationStatus.state === 'denied';
                
                // Listen for changes to location permission
                locationStatus.onchange = function() {
                    if (this.state === 'granted') {
                        locationPermissionGranted = true;
                        setupLocationTracking();
                        updatePermissionDisplay();
                    } else if (this.state === 'denied') {
                        locationBlocked = true;
                        updatePermissionDisplay();
                    }
                };
            } catch (e) {
                // Silent error handling
            }
        }
        
        // For iOS, we can't directly check if orientation is blocked before requesting
        // We'll need to infer it from failed requests
        
        return { orientationBlocked, locationBlocked };
    }
    
    // Function to update permission display based on current state
    function updatePermissionDisplay() {
        if ((orientationPermissionGranted || !isiOS()) && locationPermissionGranted) {
            // All needed permissions granted
            permissionDisplay.style.display = 'none';
            if (permissionStatusBox) {
                permissionStatusBox.style.display = 'none';
            }
        } else {
            // Show appropriate message if permissions are blocked
            if (permissionStatusBox) {
                let blockedStatus = '';
                
                if (isiOS() && orientationBlocked) {
                    blockedStatus += 'Compass orientation access is blocked. ';
                }
                
                if (locationBlocked) {
                    blockedStatus += 'Location access is blocked. ';
                }
                
                if (blockedStatus) {
                    blockedStatus += 'Please enable these permissions in your device settings.';
                    permissionStatusMsg.textContent = blockedStatus;
                    permissionStatusBox.style.display = 'block';
                } else {
                    permissionStatusBox.style.display = 'none';
                }
            }
        }
    }
    
    // Set up access button functionality
    // Modified access button click handler that works for both iOS and Android
accessBtn.addEventListener('click', async () => {
    // For iOS devices that need explicit permission requests
    if (isiOS() && 
        typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        
        // Request device orientation permission on iOS
        try {
            const permissionState = await DeviceOrientationEvent.requestPermission();
            if (permissionState === 'granted') {
                orientationPermissionGranted = true;
                setupOrientationTracking();
            } else {
                orientationBlocked = true;
                const permissionStatusMsg = document.getElementById('permissinStatusMsg');
                const permissionStatusBox = document.getElementById('permissinStatusBox');
                if (permissionStatusMsg && permissionStatusBox) {
                    permissionStatusMsg.textContent = 'Compass orientation access is blocked. Please enable it in your device settings.';
                    permissionStatusBox.style.display = 'block';
                }
                return; // Don't proceed if orientation permission denied on iOS
            }
        } catch (error) {
            orientationBlocked = true;
            const permissionStatusMsg = document.getElementById('permissinStatusMsg');
            const permissionStatusBox = document.getElementById('permissinStatusBox');
            if (permissionStatusMsg && permissionStatusBox) {
                permissionStatusMsg.textContent = 'Compass orientation access is blocked. Please enable it in your device settings.';
                permissionStatusBox.style.display = 'block';
            }
            return; // Don't proceed if there was an error
        }
    } else {
        // For Android and other devices that don't need explicit orientation permission
        orientationPermissionGranted = true;
        setupOrientationTracking();
    }
    
    // Request location permission for all devices
    navigator.geolocation.getCurrentPosition(
        () => {
            locationPermissionGranted = true;
            setupLocationTracking();
            
            // Hide permission display if we have all needed permissions
            if (orientationPermissionGranted) {
                permissionDisplay.style.display = 'none';
            }
        },
        (error) => {
            // Location permission denied
            if (error.code === error.PERMISSION_DENIED) {
                locationBlocked = true;
                const permissionStatusMsg = document.getElementById('permissinStatusMsg');
                const permissionStatusBox = document.getElementById('permissinStatusBox');
                if (permissionStatusMsg && permissionStatusBox) {
                    permissionStatusMsg.textContent = 'Location access is blocked. Please enable it in your device settings.';
                    permissionStatusBox.style.display = 'block';
                }
            }
            
            // Hide permission display if we at least have orientation permission
            if (orientationPermissionGranted) {
                permissionDisplay.style.display = 'none';
            }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
});
    
    // Initial check for blocked permissions
    checkPermissionBlocked().then(({ orientationBlocked: oBlocked, locationBlocked: lBlocked }) => {
        orientationBlocked = oBlocked;
        locationBlocked = lBlocked;
        updatePermissionDisplay();
    });
}

// Variables to track blocked permission states
let orientationBlocked = false;
let locationBlocked = false;

// Initialize everything
function init() {
    // Check device orientation support
    if (window.DeviceOrientationEvent) {
        // Check location support
        if (navigator.geolocation) {
            // If Android, directly setup orientation tracking without requesting permission
            if (!isiOS()) {
                setupOrientationTracking();
            }
            // Both orientation and location are supported, check permissions
            checkAndRequestAllPermissions();
        } else {
            // Only orientation is supported
            if (isiOS()) {
                // iOS needs explicit permission
                permissionDisplay.style.display = 'block';
                
                // Use existing permission status message element
                const permissionStatusMsg = document.getElementById('permissinStatusMsg');
                const permissionStatusBox = document.getElementById('permissinStatusBox');
                
                accessBtn.addEventListener('click', async () => {
                    try {
                        const response = await DeviceOrientationEvent.requestPermission();
                        if (response === 'granted') {
                            setupOrientationTracking();
                            permissionDisplay.style.display = 'none';
                        } else {
                            // Permission was denied
                            orientationBlocked = true;
                            if (permissionStatusBox) {
                                permissionStatusMsg.textContent = 'Compass orientation access is blocked. Please enable it in your device settings.';
                                permissionStatusBox.style.display = 'block';
                            }
                        }
                    } catch (e) {
                        // Error might indicate blocked permission
                        orientationBlocked = true;
                        if (permissionStatusBox) {
                            permissionStatusMsg.textContent = 'Compass orientation access is blocked. Please enable it in your device settings.';
                            permissionStatusBox.style.display = 'block';
                        }
                    }
                });
            } else {
                // Android doesn't need permission for orientation
                setupOrientationTracking();
                permissionDisplay.style.display = 'none';
            }
        }
    } else {
        // Device doesn't support orientation events
        // Can still try location services
        if (navigator.geolocation) {
            checkAndRequestAllPermissions();
        } else {
            // Neither orientation nor location is supported
            permissionDisplay.style.display = 'block';
            
            const permissionStatusMsg = document.getElementById('permissinStatusMsg');
            const permissionStatusBox = document.getElementById('permissinStatusBox');
            if (permissionStatusBox) {
                permissionStatusMsg.textContent = 'Your device does not support orientation or location features.';
                permissionStatusBox.style.display = 'block';
            }
            
            // Hide the access button since it won't do anything
            accessBtn.style.display = 'none';
        }
    }
}

// Start the application
init();