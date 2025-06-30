document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;

  const response = await fetch('http://localhost:5000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });

  const result = await response.json();
  const display = document.getElementById('qrDisplay');

  if (result.success) {
    display.innerHTML = `<h3>Registration Successful!</h3><img src="${result.qrCode}" alt="QR Code" />`;
  } else {
    display.innerHTML = `<p>${result.message || 'Error occurred'}</p>`;
  }
});