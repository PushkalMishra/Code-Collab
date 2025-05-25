import { executeJavaScript } from './javascriptExecutor.js';
import { executePython } from './pythonExecutor.js';
import { executeCpp } from './cppExecutor.js';
import { executeJava } from './javaExecutor.js';

export const executors = {
  javascript: executeJavaScript,
  python: executePython,
  cpp: executeCpp,
  java: executeJava
}; 