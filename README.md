# CodeAlpha - Data Redundancy Removal System

CodeAlpha Cloud Computing Internship - Task 1.

## Features
- Required-field and email validation
- Text normalization before comparison
- Exact duplicate detection
- Same-email conflict detection
- Only unique and verified records are stored
- Dashboard for total, verified and duplicate-attempt statistics
- Delete records
- Persistent JSON storage for easy Node.js 24 local development

## Tech Stack
HTML, CSS, JavaScript, Node.js, Express.js, JSON file persistence.

## Run
1. Open Command Prompt in this project folder.
2. Run `npm install`
3. Run `npm start`
4. Open `http://localhost:3000`

Records are stored in `data/records.json`.

For a production cloud deployment, the API/storage layer can be connected to a managed cloud database such as AWS, Azure, or Google Cloud database services.

Suggested GitHub repository name:
`CodeAlpha_Data_Redundancy_Removal_System`
