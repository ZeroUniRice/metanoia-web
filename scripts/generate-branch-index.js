/**
 * This script generates a JSON file containing the names of all directories at static/branches/_index.json.
 */
import fs from 'fs';
import path from 'path';

const STATIC_DIR = path.resolve('static');
const BRANCHES_DIR = path.join(STATIC_DIR, 'branches');
const OUTPUT_FILE = path.join(BRANCHES_DIR, '_index.json');

if (!fs.existsSync(BRANCHES_DIR)) {
    console.error('Error: branches directory not found in static folder');
    process.exit(1);
}

try {
    const files = fs.readdirSync(BRANCHES_DIR);
    const directories = files.filter(file => {
    const filePath = path.join(BRANCHES_DIR, file);
    return fs.statSync(filePath).isDirectory();
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(directories, null, 2));
    console.log(`Generated branch index with ${directories.length} branches`);
} catch (error) {
    console.error('Error generating branch index:', error);
    process.exit(1);
}
