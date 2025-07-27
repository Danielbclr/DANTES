package com.arieslab.DANTES.controller;

import com.arieslab.DANTES.dto.RefactorResponse;
import com.arieslab.DANTES.enums.SmellType;
import com.arieslab.DANTES.service.RefactorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RefactorController.class)
class RefactorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RefactorService refactorService;

    @Test
    @DisplayName("POST /api/refactor should return refactored code on success")
    void handleRefactor_whenSuccessful_shouldReturnRefactorResponse() throws Exception {
        // ARRANGE
        String inputCode = "class T {}";
        RefactorResponse mockResponse = new RefactorResponse(
                "class T { /* refactored */ }",
                List.of(5),
                "Refactoring successful.",
                0
        );

        // Configure the mock service to return our mock response
        when(refactorService.performRefactoring(anyString(), any(SmellType.class), anyInt()))
                .thenReturn(mockResponse);

        // ACT & ASSERT
        mockMvc.perform(post("/api/refactor")
                        .param("code", inputCode)
                        .param("smellType", "ASSERTION_ROULETTE")
                        .param("line", "5")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.refactoredCode").value(mockResponse.getRefactoredCode()))
                .andExpect(jsonPath("$.changedLines[0]").value(5));
    }

    @Test
    @DisplayName("POST /api/refactor should return 500 on service error")
    void handleRefactor_whenServiceFails_shouldReturnInternalServerError() throws Exception {
        // ARRANGE
        String inputCode = "class T {}";
        when(refactorService.performRefactoring(anyString(), any(SmellType.class), anyInt()))
                .thenThrow(new IllegalStateException("AST parsing failed"));

        // ACT & ASSERT
        mockMvc.perform(post("/api/refactor")
                        .param("code", inputCode)
                        .param("smellType", "ASSERTION_ROULETTE")
                        .param("line", "5")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An unexpected server error occurred."));
    }
}