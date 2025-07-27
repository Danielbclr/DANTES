package com.arieslab.DANTES.dto;

import com.arieslab.DANTES.enums.SmellType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Setter
@Getter
@NoArgsConstructor // Creates a no-argument constructor, useful for some frameworks
@AllArgsConstructor // Creates a constructor with all fields, which is very convenient
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestSmell {

    private SmellType type;
    private String method;
    private int line;
    private int actualLine;

    @JsonIgnore
    private Set<Integer> lines;

}