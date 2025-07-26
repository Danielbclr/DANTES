package com.arieslab.DANTES.detection;

import com.arieslab.DANTES.dto.TestSmell;
import com.arieslab.DANTES.enums.SmellType;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Detector for the "Assertion Roulette" test smell.
 * This smell occurs when a test method has multiple assertions without explanations,
 * making it difficult to determine which assertion failed.
 *
 * This class is a stateless Spring Component, making it thread-safe for use in a web application.
 */
@Slf4j
@Component
public class AssertionRouletteDetector implements ITestSmellDetector {

    private static final SmellType SMELL_TYPE = SmellType.ASSERTION_ROULETTE;

    @Override
    public SmellType getSmellType() {
        return SMELL_TYPE;
    }

    @Override
    public List<TestSmell> findSmells(String javaCode) {
        // The list of smells is a local variable, making this method thread-safe.
        List<TestSmell> detectedSmells = new ArrayList<>();
        try {
            CompilationUnit compilationUnit = StaticJavaParser.parse(javaCode);
            // The visitor is instantiated for each call and given the local list to populate.
            new AssertionVisitor().visit(compilationUnit, detectedSmells);
        } catch (Exception e) {
            // Handle parsing errors gracefully, e.g., if the user submits invalid code.
            log.error("Error parsing code for Assertion Roulette detection", e);
        }
        return detectedSmells;
    }

    /**
     * A visitor that traverses the Abstract Syntax Tree (AST) of the parsed Java code
     * to find assertion-related smells.
     */
    private static class AssertionVisitor extends VoidVisitorAdapter<List<TestSmell>> {
        // FIX: Corrected typo in variable name
        private MethodDeclaration currentMethod = null;
        private int assertCount = 0;
        private int assertNoMessageCount = 0;

        @Override
        public void visit(MethodDeclaration n, List<TestSmell> detectedSmells) {
            // We only care about valid test methods (e.g., annotated with @Test)
            if (isTestMethod(n)) {
                currentMethod = n;
                assertCount = 0;
                assertNoMessageCount = 0;

                super.visit(n, detectedSmells); // This will visit all method calls inside this method

                currentMethod = null; // Reset for the next method
            }
        }

        @Override
        public void visit(MethodCallExpr n, List<TestSmell> detectedSmells) {
            if (currentMethod == null) {
                return; // We are not inside a test method
            }

            String methodName = n.getNameAsString();
            int argCount = n.getArguments().size();
            boolean isAssertionWithoutMessage = false;

            // Logic adapted from the original class to check for various assert types
            if (methodName.startsWith("assert") || methodName.equals("fail")) {
                assertCount++;
                if (isAssertionMissingMessage(methodName, argCount, n)) {
                    isAssertionWithoutMessage = true;
                    assertNoMessageCount++;
                }
            }

            if (isAssertionWithoutMessage) {
                // BUG FIX: Initialize with a mutable HashSet, not an immutable Set.of().
                Set<Integer> lines = new HashSet<>();
                n.getRange().ifPresent(r -> {
                    for (int i = r.begin.line; i <= r.end.line; i++) {
                        lines.add(i);
                    }
                });
                TestSmell smell = new TestSmell(
                        SMELL_TYPE,
                        currentMethod.getNameAsString() + "()",
                        n.getRange().map(r -> r.begin.line).orElse(-1),
                        n.getRange().map(r -> r.begin.line).orElse(-1),
                        lines
                );
                detectedSmells.add(smell);
            }
        }

        private boolean isTestMethod(MethodDeclaration n) {
            // A simple check for JUnit 4/5 @Test annotation. This can be made more robust.
            return n.getAnnotations().stream()
                    .anyMatch(a -> a.getNameAsString().equals("Test"));
        }

        private boolean isAssertionMissingMessage(String methodName, int argCount, MethodCallExpr n) {
            // This logic is a simplified and cleaner version of the original's checks.
            switch (methodName) {
                case "assertArrayEquals":
                case "assertEquals":
                case "assertNotSame":
                case "assertSame":
                case "assertThat":
                    return argCount < 3;
                case "assertFalse":
                case "assertNotNull":
                case "assertNull":
                case "assertTrue":
                    return argCount < 2;
                case "fail":
                    return argCount < 1;
                default:
                    return false;
            }
        }
    }
}