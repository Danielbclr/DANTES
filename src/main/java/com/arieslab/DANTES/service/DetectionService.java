package com.arieslab.DANTES.service;

import com.arieslab.DANTES.detection.ITestSmellDetector;
import com.arieslab.DANTES.dto.DetectionResponse;
import com.arieslab.DANTES.dto.TestSmell;
import com.github.javaparser.StaticJavaParser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
public class DetectionService {

    private final List<ITestSmellDetector> smellDetectors;

    @Autowired
    public DetectionService(List<ITestSmellDetector> smellDetectors) {
        this.smellDetectors = smellDetectors;
    }

    public DetectionResponse detectSmells(String javaCode) {
        if (smellDetectors == null || smellDetectors.isEmpty()) {
            // IMPROVEMENT: Use the SLF4J logger for consistency.
            log.warn("No smell detectors were found. Ensure they are annotated with @Component.");
            return new DetectionResponse();
        }

        log.info("Detection Service starting analysis with {} detector(s).", smellDetectors.size());

        List<TestSmell> smellList = findSmellsInCode(javaCode);

        String parsedJavaCode = StaticJavaParser.parse(javaCode).toString();
        List<TestSmell> parsedCodeSmellList = findSmellsInCode(parsedJavaCode);

        // BUG FIX: Initialize with a mutable ArrayList, not an immutable List.of().
        List<Integer> highlightedLines = new ArrayList<>();

        // Correlate the two lists to populate 'actualLine'.
        // This assumes the order and number of smells are identical, which can be brittle.
        for (int i = 0; i < smellList.size(); i++) {
            if (i < parsedCodeSmellList.size() && smellList.get(i).getType() == parsedCodeSmellList.get(i).getType()) {
                smellList.get(i).setActualLine(parsedCodeSmellList.get(i).getLine());
            }

            if (smellList.get(i).getLines() != null) {
                highlightedLines.addAll(smellList.get(i).getLines());
            }
        }

        return new DetectionResponse(smellList, parsedJavaCode, highlightedLines);
    }

    /**
     * Helper method to run all detectors on a given piece of code, reducing duplication.
     */
    private List<TestSmell> findSmellsInCode(String code) {
        return smellDetectors.stream()
                .flatMap(detector -> {
                    try {
                        return detector.findSmells(code).stream();
                    } catch (Exception e) {
                        log.error("Error running detector '{}': {}", detector.getSmellType().name(), e.getMessage(), e);
                        return Stream.empty();
                    }
                })
                .collect(Collectors.toList());
    }
}