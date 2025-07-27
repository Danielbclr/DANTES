package com.arieslab.DANTES.refactor;

import com.arieslab.DANTES.dto.RefactorResponse;
import com.arieslab.DANTES.enums.SmellType;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.visitor.ModifierVisitor;
import com.github.javaparser.ast.visitor.Visitable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Refactoring strategy for the "Empty Test" smell.
 * The refactoring consists of removing the entire empty test method
 * and replacing it with a comment.
 */
@Component
public class EmptyTestRefactor implements ITestSmellRefactor {

    @Override
    public SmellType getSmellType() {
        return SmellType.EMPTY_TEST;
    }

    @Override
    public RefactorResponse refactor(String javaCode, int lineOfSmell) {
        CompilationUnit cu;
        try {
            cu = StaticJavaParser.parse(javaCode);
        } catch (Exception e) {
            // If parsing fails, we cannot proceed.
            return new RefactorResponse(javaCode, Collections.emptyList(), "Error: Could not parse Java code. " + e.getMessage(), 0);
        }

        // Find the method declaration at the specified line
        MethodDeclaration methodToRemove = cu.findFirst(MethodDeclaration.class, md ->
                md.getRange().isPresent() && md.getRange().get().begin.line == lineOfSmell
        ).orElse(null);

        if (methodToRemove == null) {
            return new RefactorResponse(javaCode, Collections.emptyList(), "Error: Could not find a method declaration at line " + lineOfSmell + ".", 0);
        }

        // Get the exact start and end lines of the method from the AST
        int startLine = methodToRemove.getRange().get().begin.line; // 1-based index
        int endLine = methodToRemove.getRange().get().end.line;   // 1-based index

        String[] lines = javaCode.split("\r\n|\r|\n", -1);
        List<String> newLines = new ArrayList<>();

        // Add all lines before the method to be removed
        for (int i = 0; i < startLine - 1; i++) {
            newLines.add(lines[i]);
        }

        // Add the replacement comment, preserving indentation
        String originalLine = lines[startLine - 1];
        String leadingWhitespace = originalLine.replaceAll("\\S.*", "");
        newLines.add(leadingWhitespace + "// Method removed due to Empty Test smell.");

        // Add all lines that come after the removed method
        for (int i = endLine; i < lines.length; i++) {
            newLines.add(lines[i]);
        }

        String refactoredCode = String.join(System.lineSeparator(), newLines);
        int lineChange = 1 - (endLine - startLine + 1); // 1 comment line added, N method lines removed

        return new RefactorResponse(
                refactoredCode,
                Collections.singletonList(startLine), // The line number that was changed
                "Successfully removed empty test method.",
                lineChange
        );
    }
}