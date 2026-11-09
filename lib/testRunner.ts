import { Sandbox } from 'e2b';

export interface TestRunnerOptions {
  language: 'javascript' | 'typescript' | 'c' | 'cpp' | 'go' | 'java' | 'rust' | 'python';
  testCode: string;
  sourceFiles?: Record<string, string>; // Additional source files needed for the test
  timeoutSeconds?: number;
  workingDir?: string;
}

export interface TestRunnerResult {
  success: boolean;
  output: string;
  exitCode: number | null;
  duration: number;
  language: string;
}

const LANGUAGE_CONFIG: Record<TestRunnerOptions['language'], {
  testCommand: string;
  fileExtension: string;
  testFileName: string;
  setupCommands: string[];
  testFramework: string;
}> = {
  javascript: {
    testCommand: 'npm test -- --reporter=verbose 2>&1 || npx jest --verbose 2>&1 || npx vitest run --reporter=verbose 2>&1 || node --test 2>&1',
    fileExtension: '.js',
    testFileName: 'test.js',
    setupCommands: [
      'npm init -y 2>/dev/null || true',
      'npm install --save-dev jest vitest @types/node 2>/dev/null || true',
    ],
    testFramework: 'Jest/Vitest/Node.js test runner',
  },
  typescript: {
    testCommand: 'npx vitest run --reporter=verbose 2>&1 || npx jest --verbose 2>&1 || npx tsx --test 2>&1',
    fileExtension: '.ts',
    testFileName: 'test.ts',
    setupCommands: [
      'npm init -y 2>/dev/null || true',
      'npm install --save-dev vitest jest @types/node tsx typescript 2>/dev/null || true',
      'npx tsc --init --esModuleInterop --strict --target ES2020 --moduleResolution node 2>/dev/null || true',
    ],
    testFramework: 'Vitest/Jest/tsx',
  },
  c: {
    testCommand: 'make test 2>&1 || ./test_runner 2>&1',
    fileExtension: '.c',
    testFileName: 'test.c',
    setupCommands: [
      'apt-get update && apt-get install -y build-essential cmake check 2>/dev/null || apk add build-base cmake check 2>/dev/null || true',
    ],
    testFramework: 'Check/CMake',
  },
  cpp: {
    testCommand: 'make test 2>&1 || ./test_runner 2>&1',
    fileExtension: '.cpp',
    testFileName: 'test.cpp',
    setupCommands: [
      'apt-get update && apt-get install -y build-essential cmake googletest 2>/dev/null || apk add build-base cmake gtest 2>/dev/null || true',
    ],
    testFramework: 'GoogleTest/CMake',
  },
  go: {
    testCommand: 'go test -v ./... 2>&1',
    fileExtension: '.go',
    testFileName: 'main_test.go',
    setupCommands: [
      'go mod init testproject 2>/dev/null || true',
    ],
    testFramework: 'Go testing',
  },
  java: {
    testCommand: 'mvn test 2>&1 || gradle test 2>&1',
    fileExtension: '.java',
    testFileName: 'Test.java',
    setupCommands: [
      'apt-get update && apt-get install -y maven gradle openjdk-21-jdk 2>/dev/null || apk add maven gradle openjdk21 2>/dev/null || true',
    ],
    testFramework: 'JUnit/Maven/Gradle',
  },
  rust: {
    testCommand: 'cargo test -- --nocapture 2>&1',
    fileExtension: '.rs',
    testFileName: 'lib.rs',
    setupCommands: [
      'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y 2>/dev/null || true',
      'source "$HOME/.cargo/env" 2>/dev/null || true',
      'cargo new --lib testproject 2>/dev/null || true',
    ],
    testFramework: 'Cargo/Rust test',
  },
  python: {
    testCommand: 'python -m pytest -v 2>&1 || python -m unittest discover -v 2>&1',
    fileExtension: '.py',
    testFileName: 'test_main.py',
    setupCommands: [
      'pip install pytest 2>/dev/null || true',
    ],
    testFramework: 'pytest/unittest',
  },
};

function getTestTemplate(language: TestRunnerOptions['language']): string {
  const templates: Record<TestRunnerOptions['language'], string> = {
    javascript: `
// JavaScript test template
const assert = require('assert');

// Example test
describe('Sample Tests', () => {
  it('should pass', () => {
    assert.strictEqual(1 + 1, 2);
  });
});
`,
    typescript: `
// TypeScript test template
import { describe, it, expect } from 'vitest';

describe('Sample Tests', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });
});
`,
    c: `
// C test template using Check framework
#include <check.h>
#include <stdlib.h>

START_TEST(test_basic) {
  ck_assert_int_eq(1 + 1, 2);
}
END_TEST

Suite *make_suite(void) {
  Suite *s = suite_create("Sample");
  TCase *tc = tcase_create("Core");
  tcase_add_test(tc, test_basic);
  suite_add_tcase(s, tc);
  return s;
}

int main(void) {
  int number_failed;
  Suite *s = make_suite();
  SRunner *sr = srunner_create(s);
  srunner_run_all(sr, CK_NORMAL);
  number_failed = srunner_ntests_failed(sr);
  srunner_free(sr);
  return (number_failed == 0) ? EXIT_SUCCESS : EXIT_FAILURE;
}
`,
    cpp: `
// C++ test template using GoogleTest
#include <gtest/gtest.h>

TEST(SampleTest, BasicAssertion) {
  EXPECT_EQ(1 + 1, 2);
}

int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}
`,
    go: `
// Go test template
package main

import "testing"

func TestBasic(t *testing.T) {
  if 1+1 != 2 {
    t.Errorf("Expected 2, got %d", 1+1)
  }
}
`,
    java: `
// Java test template using JUnit 5
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Test {
  @Test
  void basicTest() {
    assertEquals(2, 1 + 1);
  }
}
`,
    rust: `
// Rust test template
#[cfg(test)]
mod tests {
  #[test]
  fn basic_test() {
    assert_eq!(1 + 1, 2);
  }
}
`,
    python: `
# Python test template using pytest
def test_basic():
    assert 1 + 1 == 2

# Or using unittest
import unittest

class TestBasic(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(1 + 1, 2)

if __name__ == '__main__':
    unittest.main()
`,
  };
  return templates[language];
}

export async function runMultiLanguageTest(
  sandbox: Sandbox,
  options: TestRunnerOptions
): Promise<TestRunnerResult> {
  const startTime = Date.now();
  const config = LANGUAGE_CONFIG[options.language];
  const workingDir = options.workingDir || '/home/user/test-project';
  
  try {
    // Create working directory
    await sandbox.commands.run(`mkdir -p ${workingDir}`, { timeoutMs: 30000 });
    
    // Run setup commands
    for (const cmd of config.setupCommands) {
      await sandbox.commands.run(cmd, { timeoutMs: 120000 });
    }
    
    // Write test file
    const testFilePath = `${workingDir}/${config.testFileName}`;
    await sandbox.files.write(testFilePath, options.testCode || getTestTemplate(options.language));
    
    // Write additional source files if provided
    if (options.sourceFiles) {
      for (const [fileName, content] of Object.entries(options.sourceFiles)) {
        await sandbox.files.write(`${workingDir}/${fileName}`, content);
      }
    }
    
    // Run tests
    const timeoutMs = (options.timeoutSeconds || 120) * 1000;
    const result = await sandbox.commands.run(
      `cd ${workingDir} && ${config.testCommand}`,
      { timeoutMs }
    );
    
    const duration = Date.now() - startTime;
    
    return {
      success: result.exitCode === 0,
      output: result.stdout + (result.stderr ? '\n' + result.stderr : ''),
      exitCode: result.exitCode,
      duration,
      language: options.language,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      output: error instanceof Error ? error.message : String(error),
      exitCode: -1,
      duration,
      language: options.language,
    };
  }
}

export function getSupportedLanguages(): TestRunnerOptions['language'][] {
  return Object.keys(LANGUAGE_CONFIG) as TestRunnerOptions['language'][];
}

export function getLanguageConfig(language: TestRunnerOptions['language']) {
  return LANGUAGE_CONFIG[language];
}