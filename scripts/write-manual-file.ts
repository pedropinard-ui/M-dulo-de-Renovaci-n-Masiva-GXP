import fs from 'fs';
import path from 'path';
import { getUserManualDocContent } from '../src/utils/userManualWordGenerator';

const content = getUserManualDocContent();
const publicDir = path.resolve('public');
const targetFileInPublic = path.join(publicDir, 'Manual_de_Usuario_Renovacion_Masiva_GEXP.doc');
const targetFileInRoot = path.resolve('Manual_de_Usuario_Renovacion_Masiva_GEXP.doc');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(targetFileInPublic, content, 'utf-8');
fs.writeFileSync(targetFileInRoot, content, 'utf-8');

console.log(`User Manual generated successfully at:`);
console.log(`- ${targetFileInPublic} (${(content.length / 1024).toFixed(1)} KB)`);
console.log(`- ${targetFileInRoot} (${(content.length / 1024).toFixed(1)} KB)`);
