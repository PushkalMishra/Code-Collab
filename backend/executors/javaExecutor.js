import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function executeJava(code) {
  const tempDir = join(process.cwd(), 'temp');
  const filename = `Main_${uuidv4()}`;
  const sourceFile = `${filename}.java`;
  const sourcePath = join(tempDir, sourceFile);

  try {
    // Write code to temporary file
    await writeFile(sourcePath, code);

    // Compile and execute the code
    return new Promise((resolve, reject) => {
      // First compile
      exec(`javac ${sourcePath}`, async (compileError, compileStdout, compileStderr) => {
        if (compileError) {
          // Clean up
          await unlink(sourcePath).catch(console.error);
          resolve({ output: '', error: compileError.message });
          return;
        }

        // Then run
        exec(`java -cp ${tempDir} ${filename}`, async (runError, runStdout, runStderr) => {
          // Clean up both files
          await Promise.all([
            unlink(sourcePath).catch(console.error),
            unlink(join(tempDir, `${filename}.class`)).catch(console.error)
          ]);

          if (runError) {
            resolve({ output: '', error: runError.message });
          } else if (runStderr) {
            resolve({ output: '', error: runStderr });
          } else {
            resolve({ output: runStdout.trim(), error: '' });
          }
        });
      });
    });
  } catch (error) {
    return { output: '', error: error.message };
  }
} 