package com.arieslab.DANTES.controller;

import com.arieslab.DANTES.dto.DetectionResponse;
import com.arieslab.DANTES.dto.TestSmell;
import com.arieslab.DANTES.service.DetectionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DetectionController.class) // Focus tests on only the DetectionController
class DetectionControllerTest {

    @Autowired
    private MockMvc mockMvc; // The main entry point for server-side Spring MVC test support

    @MockBean // Creates a Mockito mock for the service and adds it to the application context
    private DetectionService detectionService;

    @Autowired
    private ObjectMapper objectMapper; // Utility to convert objects to JSON strings

    @Test
    @DisplayName("POST /process-input should return detection results on success")
    void processInput_whenSuccessful_shouldReturnDetectionResponse() throws Exception {
        // ARRANGE
        String inputCode = "public class MyTest {}";
        DetectionResponse mockResponse = new DetectionResponse(
                List.of(new TestSmell()), // Dummy smell list
                "formatted code",
                List.of(10, 11)
        );

        // Configure the mock service to return our mock response when called
        when(detectionService.detectSmells(anyString())).thenReturn(mockResponse);

        // ACT & ASSERT
        mockMvc.perform(post("/process-input")
                        .param("inputText", inputCode)
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.retVal.detectedSmells").isArray())
                .andExpect(jsonPath("$.retVal.highlightedLines[0]").value(10));
    }

    @Test
    @DisplayName("POST /process-input should return 500 on service error")
    void processInput_whenServiceThrowsException_shouldReturnInternalServerError() throws Exception {
        // ARRANGE
        String inputCode = "public class MyTest {}";
        String errorMessage = "Parser exploded!";

        // Configure the mock service to throw an exception
        when(detectionService.detectSmells(anyString())).thenThrow(new RuntimeException(errorMessage));

        // ACT & ASSERT
        mockMvc.perform(post("/process-input")
                        .param("inputText", inputCode)
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("An error occurred during analysis: " + errorMessage))
                .andExpect(jsonPath("$.retVal").isArray()); // Check that retVal is an empty list on error
    }
}