import express from "express";
import bodyParser from "body-parser";
import fileType from "file-type";
import cors from "cors";


const app = express();
app.use(bodyParser.json());
app.use(cors());
// Utility functions
const isPrime = (num) => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const processFile = async (base64String) => {
  if (!base64String) return { file_valid: false };

  const buffer = Buffer.from(base64String, "base64");
  const mimeTypeInfo = await fileType.fromBuffer(buffer);
  if (!mimeTypeInfo) return { file_valid: false };

  const fileSizeKb = (buffer.length / 1024).toFixed(2);
  return {
    file_valid: true,
    file_mime_type: mimeTypeInfo.mime,
    file_size_kb: fileSizeKb,
  };
};

// POST Endpoint
app.post("/bfhl", async (req, res) => {
  try {
    const { data, file_b64 } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        message: "Invalid 'data' field. It must be an array.",
      });
    }

    const numbers = [];
    const alphabets = [];
    let highestLowercase = null;
    let primeFound = false;

    // Parse data
    for (const item of data) {
      if (!isNaN(item)) {
        numbers.push(item);
        if (isPrime(parseInt(item))) primeFound = true;
      } else if (typeof item === "string" && /^[A-Za-z]$/.test(item)) {
        alphabets.push(item);
        if (/[a-z]/.test(item)) {
          if (!highestLowercase || item > highestLowercase) {
            highestLowercase = item;
          }
        }
      }
    }

    const fileInfo = await processFile(file_b64);

    res.json({
      is_success: true,
      user_id: "john_doe_17091999",
      email: "john@xyz.com",
      roll_number: "ABCD123",
      numbers,
      alphabets,
      highest_lowercase_alphabet: highestLowercase ? [highestLowercase] : [],
      is_prime_found: primeFound,
      file_valid: fileInfo.file_valid,
      file_mime_type: fileInfo.file_mime_type || null,
      file_size_kb: fileInfo.file_size_kb || null,
    });
  } catch (error) {
    console.error("Error processing POST request:", error.message);
    res.status(500).json({ is_success: false, message: "Internal Server Error" });
  }
});

// GET Endpoint
app.get("/bfhl", (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
