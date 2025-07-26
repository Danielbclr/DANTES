package com.arieslab.DANTES.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DetectionResponse {

    private List<TestSmell> detectedSmells;
    private String refactoredCode;
    private List<Integer> highlightedLines;
}