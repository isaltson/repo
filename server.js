const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

// Middleware to parse JSON and enable CORS
app.use(express.json());
app.use(cors());

// Validate reCAPTCHA and password strength
app.post('/validate', async (req, res) => {
  const { password, captchaResponse } = req.body;

  // Validate reCAPTCHA
  try {
    const reCAPTCHA_URL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaResponse}`;
    const reCAPTCHA_Response = await axios.post(reCAPTCHA_URL);

    if (!reCAPTCHA_Response.data.success) {
      return res.status(400).json({ error: 'reCAPTCHA validation failed. Please try again.' });
    }
  } catch (error) {
    console.error('Error validating reCAPTCHA:', error); // Log the error
    return res.status(500).json({ error: 'Error validating reCAPTCHA. Please try again.' });
  }

  // Check password strength (optional, if not done on the frontend)
  const strength = checkPasswordStrength(password);

  // Send response
  res.json({ strength });
});

// Password strength logic (optional, if not done on the frontend)
function checkPasswordStrength(password) {
  const length = password.length;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  let strength = 0;
  if (length >= 8) strength++;
  if (hasUpperCase) strength++;
  if (hasLowerCase) strength++;
  if (hasNumbers) strength++;
  if (hasSpecialChars) strength++;

  if (strength <= 2) return 'Weak';
  if (strength <= 4) return 'Medium';
  return 'Strong';
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
