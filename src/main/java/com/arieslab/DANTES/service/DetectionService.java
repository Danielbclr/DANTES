package com.arieslab.DANTES.service;

import com.arieslab.DANTES.detection.ITestSmellDetector;
import com.arieslab.DANTES.dto.TestSmell;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class DetectionService {

    /**
     * A list of all beans that implement the ITestSmellDetector interface.
     * Spring's dependency injection automatically populates this list.
     */
    private final List<ITestSmellDetector> smellDetectors;

    /**
     * Use constructor injection to receive all detector components from Spring.
     * This is the modern, recommended way to handle dependencies.
     */
    @Autowired
    public DetectionService(List<ITestSmellDetector> smellDetectors) {
        this.smellDetectors = smellDetectors;
    }

    /**
     * Analyzes the given Java code by orchestrating all available smell detectors.
     * This method is stateless and thread-safe.
     *
     * @param javaCode The Java code to analyze, passed in from the controller.
     * @return A consolidated list of all detected test smells.
     */
    public List<TestSmell> detectSmells(String javaCode) {
        if (smellDetectors == null || smellDetectors.isEmpty()) {
            System.err.println("Warning: No smell detectors were found. Ensure they are annotated with @Component.");
            return List.of();
        }

        System.out.println("Detection Service starting analysis with " + smellDetectors.size() + " detector(s).");

        return smellDetectors.stream()
                .flatMap(detector -> {
                    try {
                        return detector.findSmells(javaCode).stream();
                    } catch (Exception e) {
                        System.err.println("Error running detector '" + detector.getSmellType().name() + "': " + e.getMessage());
                        return Stream.empty();
                    }
                })
                .collect(Collectors.toList());
    }
}