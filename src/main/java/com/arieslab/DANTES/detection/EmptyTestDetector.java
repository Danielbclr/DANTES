package com.arieslab.DANTES.detection;

import com.arieslab.DANTES.dto.TestSmell;
import com.arieslab.DANTES.enums.SmellType;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Detector for the "Empty Test" smell.
 * This smell occurs when a test method has no executable statements in its body.
 */
@Component
public class EmptyTestDetector implements ITestSmellDetector {

    @Override
    public SmellType getSmellType() {
        return SmellType.EMPTY_TEST;
    }

    @Override
    public List<TestSmell> findSmells(String javaCode) {
        CompilationUnit cu = StaticJavaParser.parse(javaCode);
        List<TestSmell> smells = new ArrayList<>();
        new MethodVisitor(smells).visit(cu, null);
        return smells;
    }

    private static class MethodVisitor extends VoidVisitorAdapter<Void> {
        private final List<TestSmell> smells;

        public MethodVisitor(List<TestSmell> smells) {
            this.smells = smells;
        }

        @Override
        public void visit(MethodDeclaration md, Void arg) {
            super.visit(md, arg);

            // A method is considered a test if it has the @Test annotation.
            // This check can be expanded for other test frameworks if needed.
            boolean isTestMethod = md.isAnnotationPresent("Test");

            if (isTestMethod) {
                // Check if the method body is present and contains no statements.
                md.getBody().ifPresent(body -> {
                    if (body.getStatements().isEmpty()) {
                        // The range is optional, so we should handle the case where it might not be present.
                        md.getRange().ifPresent(range -> {
                            int startLine = range.begin.line;
                            int endLine = range.end.line;

                            // Use IntStream to generate all line numbers from start to end, inclusive.
                            // Then, collect them into a Set as required by your TestSmell DTO.
                            Set<Integer> lines = IntStream.rangeClosed(startLine, endLine)
                                    .boxed() // Convert IntStream to Stream<Integer>
                                    .collect(Collectors.toSet());

                            smells.add(new TestSmell(
                                    SmellType.EMPTY_TEST,
                                    md.getNameAsString(),
                                    startLine,
                                    startLine,
                                    lines
                            ));
                        });
                    }
                });
            }
        }
    }
}