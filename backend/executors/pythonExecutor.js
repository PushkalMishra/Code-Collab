import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function executePython(code) {
  const tempDir = join(process.cwd(), 'temp');
  const filename = `${uuidv4()}.py`;
  const filepath = join(tempDir, filename);

  try {
    // Write code to temporary file
    await writeFile(filepath, code);

    // Execute the code with Python
    return new Promise((resolve, reject) => {
      exec(`python ${filepath}`, (error, stdout, stderr) => {
        // Clean up the temporary file
        unlink(filepath).catch(console.error);

        if (error) {
          resolve({ output: '', error: error.message });
        } else if (stderr) {
          resolve({ output: '', error: stderr });
        } else {
          resolve({ output: stdout.trim(), error: '' });
        }
      });
    });
  } catch (error) {
    return { output: '', error: error.message };
  }
} 