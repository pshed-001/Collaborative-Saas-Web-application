import { readFile } from "node:fs/promises";

const path = new URL("../resources/categories.json", import.meta.url)

let content;
try {
    const data = await readFile(path, 'utf8');
    content = (JSON.parse(data)).categories;
} catch (err) {
    throw err
}

export default content;