package com.arieslab.DANTES.refactor;

import com.arieslab.DANTES.dto.RefactorResponse;
import com.arieslab.DANTES.enums.SmellType;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.NodeList;
import com.github.javaparser.ast.expr.LambdaExpr;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.expr.StringLiteralExpr;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

/**
 * A refactoring strategy that fixes the "Assertion Roulette" smell.
 *
 * It uses AST manipulation to find the specific assertion method call
 * and adds a descriptive lazy message to it, making the test failure
 * easier to diagnose.
 */
@Slf4j // <-- ADD THIS ANNOTATION
@Component
public class AssertionRouletteRefactor implements ITestSmellRefactor {

    @Override
    public SmellType getSmellType() {
        return SmellType.ASSERTION_ROULETTE;
    }

    @Override
    public RefactorResponse refactor(String javaCode, int lineOfSmell) {
        log.info("Starting Assertion Roulette refactoring for smell at line: {}", lineOfSmell);
        try {
            CompilationUnit cu = StaticJavaParser.parse(javaCode);

            // Step 1: Find the specific AST node to be refactored.
            log.debug("Searching for refactorable assertion node at line {}", lineOfSmell);
            Optional<MethodCallExpr> targetNodeOpt = findNodeToRefactor(cu, lineOfSmell);

            if (targetNodeOpt.isEmpty()) {
                log.warn("Could not find a target for Assertion Roulette refactoring at line {}. It might already have a message or is not an assertion.", lineOfSmell);
                return new RefactorResponse(javaCode, List.of(), "Target for refactoring not found or already refactored.", 0);
            }

            MethodCallExpr targetNode = targetNodeOpt.get();
            log.debug("Found target node: '{}'. Proceeding with modification.", targetNode);

            // Step 2: Perform the modification on the AST node.
            LambdaExpr lazyMessage = new LambdaExpr(
                    new NodeList<>(), // No parameters
                    new StringLiteralExpr("Add assertion message") // Body
            );
            targetNode.addArgument(lazyMessage);

            // Step 3: Convert the entire modified AST to its final string form.
            String refactoredCode = cu.toString();

            // Step 4: Find the line number of the modified node in the *new* string.
            List<Integer> changedLines = (lineOfSmell != -1) ? List.of(lineOfSmell) : List.of();

            log.info("Successfully refactored Assertion Roulette at line {}. New highlighted line: {}", lineOfSmell, lineOfSmell);
            return new RefactorResponse(refactoredCode, changedLines, "Refactoring successful.", 0);

        } catch (Exception e) {
            // IMPROVEMENT: Use the logger to record the exception, which is better than e.printStackTrace().
            log.error("Failed to refactor Assertion Roulette for line {} due to an exception.", lineOfSmell, e);
            return new RefactorResponse(javaCode, List.of(), "Refactoring failed: " + e.getMessage(), 0);
        }
    }

    /**
     * Finds the specific MethodCallExpr node to refactor based on the line number.
     * It uses a visitor to traverse the AST and returns the found node.
     */
    private Optional<MethodCallExpr> findNodeToRefactor(CompilationUnit cu, int lineOfSmell) {
        AtomicReference<MethodCallExpr> foundNode = new AtomicReference<>();
        cu.accept(new VoidVisitorAdapter<Void>() {
            @Override
            public void visit(MethodCallExpr n, Void arg) {
                super.visit(n, arg);
                boolean isOnLine = n.getRange().map(r -> r.begin.line == lineOfSmell).orElse(false);
                if (isOnLine && n.getNameAsString().startsWith("assert")) {
                    boolean hasLazyMessage = n.getArguments().stream()
                            .anyMatch(argExpr -> argExpr instanceof LambdaExpr);
                    if (!hasLazyMessage) {
                        foundNode.set(n);
                    }
                }
            }
        }, null);
        return Optional.ofNullable(foundNode.get());
    }

    /**
     * Finds the line number of a given node's string representation within the full source code.
     * This is done *after* pretty-printing to get the final, accurate line number.
     *
     * @param fullCode The complete, refactored source code.
     * @param nodeAsString The string representation of the node to find.
     * @return The 1-indexed line number, or -1 if not found.
     */
    private int findLineNumberOfNode(String fullCode, String nodeAsString) {
        // We look for the first line that contains the node's text.
        // This is robust because the node's text is now the uniquely refactored version.
        String[] lines = fullCode.split("\r\n|\r|\n");
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].contains(nodeAsString)) {
                return i + 1; // Return 1-indexed line number
            }
        }
        return -1; // Should not happen in normal execution
    }
}