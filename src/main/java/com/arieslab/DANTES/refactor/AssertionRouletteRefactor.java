package com.arieslab.DANTES.refactor;

import com.arieslab.DANTES.dto.RefactorResponse;
import com.arieslab.DANTES.enums.SmellType;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.NodeList;
import com.github.javaparser.ast.expr.LambdaExpr;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.expr.StringLiteralExpr;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
// Import the LexicalPreservingPrinter
import com.github.javaparser.printer.lexicalpreservation.LexicalPreservingPrinter;
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
@Slf4j
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

            // STEP 1: Set up the LexicalPreservingPrinter.
            // This must be done *after* parsing and *before* any modifications.
            // It traverses the AST and stores the original formatting.
            LexicalPreservingPrinter.setup(cu);

            log.debug("Searching for refactorable assertion node at line {}", lineOfSmell);
            Optional<MethodCallExpr> targetNodeOpt = findNodeToRefactor(cu, lineOfSmell);

            if (targetNodeOpt.isEmpty()) {
                log.warn("Could not find a target for Assertion Roulette refactoring at line {}. It might already have a message or is not an assertion.", lineOfSmell);
                return new RefactorResponse(javaCode, List.of(), "Target for refactoring not found or already refactored.", 0);
            }

            MethodCallExpr targetNode = targetNodeOpt.get();
            log.debug("Found target node: '{}'. Proceeding with modification.", targetNode);

            // STEP 2: Perform the modification on the AST node.
            LambdaExpr lazyMessage = new LambdaExpr(
                    new NodeList<>(), // No parameters
                    new StringLiteralExpr("Add assertion message") // Body
            );
            targetNode.addArgument(lazyMessage);

            // STEP 3: Use the LexicalPreservingPrinter to convert the AST to a string.
            // This preserves original whitespace, comments, and formatting.
            String refactoredCode = LexicalPreservingPrinter.print(cu);

            // STEP 4: Calculate the change in the number of lines.
            // This is crucial for the frontend to update the line numbers of other smells.
            int originalLineCount = javaCode.split("\r\n|\r|\n", -1).length;
            int refactoredLineCount = refactoredCode.split("\r\n|\r|\n", -1).length;
            int lineChange = refactoredLineCount - originalLineCount;

            List<Integer> changedLines = List.of(lineOfSmell);

            log.info("Successfully refactored Assertion Roulette at line {}. Line change: {}", lineOfSmell, lineChange);
            return new RefactorResponse(refactoredCode, changedLines, "Refactoring successful.", lineChange);

        } catch (Exception e) {
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
}