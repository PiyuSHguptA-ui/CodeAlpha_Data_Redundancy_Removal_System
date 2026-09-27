const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "records.json");

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readRecords() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
function writeRecords(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}
function normalize(v) { return String(v || "").trim().replace(/\s+/g, " "); }
function emailKey(v) { return normalize(v).toLowerCase(); }
function textKey(v) { return normalize(v).toLowerCase(); }
function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

app.get("/api/records", (req, res) => {
  res.json(readRecords().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
});

app.get("/api/stats", (req, res) => {
  const records = readRecords();
  res.json({
    total: records.length,
    verified: records.filter(r => r.status === "Verified").length,
    duplicateAttempts: records.filter(r => r.duplicate_attempt).length
  });
});

app.post("/api/records", (req, res) => {
  const name = normalize(req.body.name);
  const email = emailKey(req.body.email);
  const description = normalize(req.body.description);

  if (!name || !email || !description)
    return res.status(400).json({success:false, message:"All fields are required."});

  if (!validEmail(email))
    return res.status(400).json({success:false, message:"Please enter a valid email address."});

  const records = readRecords();

  const exact = records.find(r =>
    emailKey(r.email) === email &&
    textKey(r.name) === textKey(name) &&
    textKey(r.description) === textKey(description)
  );
  if (exact)
    return res.status(409).json({success:false, duplicate:true, message:"Duplicate record detected. The same data already exists."});

  const sameEmail = records.find(r => emailKey(r.email) === email);
  if (sameEmail)
    return res.status(409).json({success:false, duplicate:true, message:"A record with this email already exists. Please verify the existing data before adding another record."});

  const id = records.reduce((m,r) => Math.max(m, Number(r.id)||0), 0) + 1;
  const record = {
    id, name, email, description,
    status: "Verified",
    duplicate_attempt: false,
    created_at: new Date().toISOString()
  };

  records.push(record);
  writeRecords(records);
  res.status(201).json({success:true, message:"Unique and verified data added successfully.", record});
});

app.delete("/api/records/:id", (req, res) => {
  const id = Number(req.params.id);
  const records = readRecords();
  const updated = records.filter(r => Number(r.id) !== id);
  if (updated.length === records.length)
    return res.status(404).json({success:false, message:"Record not found."});
  writeRecords(updated);
  res.json({success:true, message:"Record deleted successfully."});
});

app.get("*", (req,res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Data Redundancy Removal System running on http://localhost:${PORT}`));
