// Get DOM elements
const video = document.getElementById('video');
const result = document.getElementById('result');

// Load ZXing QR Code reader
const codeReader = new ZXing.BrowserQRCodeReader();
console.log('ZXing library loaded.');

// Start scanning
codeReader.getVideoInputDevices()
  .then((videoInputDevices) => {
    if (videoInputDevices.length > 0) {
      const selectedDeviceId = videoInputDevices[0].deviceId;

      codeReader.decodeFromVideoDevice(selectedDeviceId, video, async (result, err) => {
        if (result) {
          console.log('Found QR Code:', result.text);
          
          // Send scanned ID to backend
          try {
            const response = await fetch('http://localhost:5000/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: result.text })
            });

            const data = await response.json();

            // Update UI
            if (data.found) {
              result.innerText = data.scanned ? "✅ Already Scanned" : "✅ Authorized";
            } else {
              result.innerText = "❌ Not Found";
            }
          } catch (err) {
            console.error("Error sending scan data:", err);
            result.innerText = "⚠️ Network Error";
          }
        }

        if (err && !(err instanceof ZXing.NotFoundException)) {
          console.error(err.message);
        }
      });
    } else {
      alert("No camera found.");
    }
  })
  .catch(err => console.error("Error accessing devices:", err));