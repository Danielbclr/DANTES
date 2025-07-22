const form = document.getElementById('myForm');
    const inputText = document.getElementById('inputText');
    const originalCodeContainer = document.getElementById('originalCode');
    const originalCodePre = document.getElementById('originalCodePre');
    const refactoredCodePre = document.getElementById('refactoredCodePre');
    const refactoredCodeContainer = document.getElementById('refactoredCode');
    const responseDiv = document.getElementById('response');
    const testSmellTableList = document.getElementById('testSmellsList');
    const sortOptions = document.getElementById('sortOptions');

    const ASSERTION_ROULETTE = "Assertion Roulette";
    const CONSTRUCTOR_INITIALIZATION = "Constructor Initialization";
    const EXCEPTION_HANDLING = "Exception Handling";
    const IGNORED_TEST = "Ignored Test";
    const EMPTY_TEST = "Empty Test";
    const DUPLICATE_ASSERT = "Duplicate Assert";
    const UNNECESSARY_PRINT = "Unnecessary Print";
    const REDUNDANT_ASSERTION = "Redundant Assertion";
    const MYSTERY_GUEST = "Mystery Guest";
    const MAGIC_NUMBER = "Magic Number"
    const GENERAL_FIXTURE = "General Fixture";

    var buttonList;
    var testSmellObjectList;
    var refactorDataLine;
    var testSmells = [];

    const fileInput = document.getElementById('fileInput')

    sortOptions.addEventListener("change", function (event) {
      console.log(sortOptions.value);
      if (testSmells.length == 0) {
        return;
      }
      if (sortOptions.value === "testSmell") {
        testSmells.sort(function (a, b) {
          if(a.type > b.type) return 1;
          return -1
        });
      }
      else if (sortOptions.value === "line") {
        testSmells.sort(function (a, b) {
          return a.lineBegin - b.lineBegin
        });
      }

      testSmellTableList.innerHTML = "";
      testSmells.forEach((value) => {
        console.log(value.lineBegin + " to " + value.lineEnd);

        let lineDiv = createTestSmellElement(0, value)
        testSmellTableList.appendChild(lineDiv);
      });
      if (testSmellTableList.innerHTML == "") {
        testSmellTableList.innerHTML = "<a style=\"color: var(--green);font-size: 20px;\">No test smells found!</b>" + '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" zoomAndPan="magnify" viewBox="0 0 30 30.000001" height="20" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="id1"><path d="M 2.328125 4.222656 L 27.734375 4.222656 L 27.734375 24.542969 L 2.328125 24.542969 Z M 2.328125 4.222656 " clip-rule="nonzero"/></clipPath></defs><g transform="translate(-1,2)" clip-path="url(#id1)"><path fill="var(--green)" d="M 27.5 7.53125 L 24.464844 4.542969 C 24.15625 4.238281 23.65625 4.238281 23.347656 4.542969 L 11.035156 16.667969 L 6.824219 12.523438 C 6.527344 12.230469 6 12.230469 5.703125 12.523438 L 2.640625 15.539062 C 2.332031 15.84375 2.332031 16.335938 2.640625 16.640625 L 10.445312 24.324219 C 10.59375 24.472656 10.796875 24.554688 11.007812 24.554688 C 11.214844 24.554688 11.417969 24.472656 11.566406 24.324219 L 27.5 8.632812 C 27.648438 8.488281 27.734375 8.289062 27.734375 8.082031 C 27.734375 7.875 27.648438 7.679688 27.5 7.53125 Z M 27.5 7.53125 " fill-opacity="1" fill-rule="nonzero"/></g></svg>'
      }

      let lineDiv = document.createElement('li');
      let buttonRefactorAll = document.createElement("button");
      buttonRefactorAll.classList.add("button");
      buttonRefactorAll.classList.add("refactorAll");
      buttonRefactorAll.innerHTML = "Refactor All";
      
      buttonRefactorAll.onclick = function () {
        refactorAll(this);
      };
     
      lineDiv.appendChild(buttonRefactorAll);
      testSmellTableList.appendChild(lineDiv);

    });

    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
          const content = event.target.result;
          console.log("File Content:");
          console.log(content);
          inputText.value = content;
        }

        reader.readAsText(file);
      } else {
        console.log("No file selected.");
      }
      fileInput.value = ""
    });

    function copyToClipboard(code, button) {
      const codeElement = document.getElementById(code);
      const text = codeElement.innerText;
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      button.innerHTML = `
                <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M9 16.17L5.83 13l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
            `;
      button.classList.add("copy-button-clicked");

      setTimeout(() => {
        button.innerHTML = `<!doctype html>
                <svg viewBox="304.219 221.26 16 16" width="24" height="24" style="fill: var(--bg);">
                    <path
                        d="M 304.219 228.01 C 304.219 227.044 305.003 226.26 305.969 226.26 L 307.469 226.26 C 308.047 226.26 308.408 226.885 308.119 227.385 C 307.985 227.617 307.737 227.76 307.469 227.76 L 305.969 227.76 C 305.831 227.76 305.719 227.872 305.719 228.01 L 305.719 235.51 C 305.719 235.648 305.831 235.76 305.969 235.76 L 313.469 235.76 C 313.607 235.76 313.719 235.648 313.719 235.51 L 313.719 234.01 C 313.719 233.433 314.344 233.072 314.844 233.36 C 315.076 233.494 315.219 233.742 315.219 234.01 L 315.219 235.51 C 315.219 236.476 314.436 237.26 313.469 237.26 L 305.969 237.26 C 305.003 237.26 304.219 236.476 304.219 235.51 L 304.219 228.01 Z"
                        style="fill: var(--text);"></path>
                    <path
                        d="M 309.219 223.01 C 309.219 222.044 310.003 221.26 310.969 221.26 L 318.469 221.26 C 319.435 221.26 320.219 222.044 320.219 223.01 L 320.219 230.51 C 320.219 231.476 319.436 232.26 318.469 232.26 L 310.969 232.26 C 310.003 232.26 309.219 231.476 309.219 230.51 L 309.219 223.01 Z M 310.969 222.76 C 310.831 222.76 310.719 222.872 310.719 223.01 L 310.719 230.51 C 310.719 230.648 310.831 230.76 310.969 230.76 L 318.469 230.76 C 318.607 230.76 318.719 230.648 318.719 230.51 L 318.719 223.01 C 318.719 222.872 318.607 222.76 318.469 222.76 L 310.969 222.76 Z"
                        style="fill: var(--text);"></path>
                </svg>
                `
        button.classList.remove("copy-button-clicked");
      }, 3000);
    }

    form.addEventListener('submit', function (event) {
      sortOptions.value = "testSmell";
        testSmellTableList.innerHTML = "";
        refactoredCodeContainer.innerHTML = "";
        refactorDataLine = "";
        originalCodePre.setAttribute('data-line', "");
        refactoredCodePre.setAttribute('data-line', "");
        testSmellObjectList = [];
        buttonList = [];
        event.preventDefault();

        const inputValue = inputText.value;

        const formData = new URLSearchParams();
        formData.append('inputText', inputValue);

        fetch('/process-input', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            // The `data.retVal` is now a proper JavaScript array, not a string.
            testSmells = data.retVal;
            originalCodeContainer.textContent = inputValue;
            // The message from the server is already complete, so we can use it directly.
            responseDiv.textContent = data.message;
            // Your bug icon can be appended like this
            responseDiv.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" width="40" zoomAndPan="magnify" viewBox="0 0 512 512" height="20" style="fill: var(--green);"preserveAspectRatio="xMidYMid meet" transform="translate(-1,-4)" ><!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 0c53 0 96 43 96 96v3.6c0 15.7-12.7 28.4-28.4 28.4H188.4c-15.7 0-28.4-12.7-28.4-28.4V96c0-53 43-96 96-96zM41.4 105.4c12.5-12.5 32.8-12.5 45.3 0l64 64c.7 .7 1.3 1.4 1.9 2.1c14.2-7.3 30.4-11.4 47.5-11.4H312c17.1 0 33.2 4.1 47.5 11.4c.6-.7 1.2-1.4 1.9-2.1l64-64c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-64 64c-.7 .7-1.4 1.3-2.1 1.9c6.2 12 10.1 25.3 11.1 39.5H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H416c0 24.6-5.5 47.8-15.4 68.6c2.2 1.3 4.2 2.9 6 4.8l64 64c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-63.1-63.1c-24.5 21.8-55.8 36.2-90.3 39.6V240c0-8.8-7.2-16-16-16s-16 7.2-16 16V479.2c-34.5-3.4-65.8-17.8-90.3-39.6L86.6 502.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l64-64c1.9-1.9 3.9-3.4 6-4.8C101.5 367.8 96 344.6 96 320H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96.3c1.1-14.1 5-27.5 11.1-39.5c-.7-.6-1.4-1.2-2.1-1.9l-64-64c-12.5-12.5-12.5-32.8 0-45.3z" fill-rule="nonzero"/></svg>';
            responseDiv.className = 'response'; // Assuming 'response' is the intended class name

            let linesWithSmells = "";

            // --- FIX 1: Loop over the correct variable `testSmells` ---
            testSmells.forEach((value, key) => {
              console.log(key + ': ' + value.lineBegin + " to " + value.lineEnd);
              linesWithSmells += value.lineBegin + "-" + value.lineEnd + ",";

              // This property should ideally be managed purely on the frontend
              value.refactor2 = false;

              // --- FIX 2: Compare against the `displayName` property of the type object ---
              if (value.type.displayName == EXCEPTION_HANDLING ||
                value.type.displayName == MYSTERY_GUEST) {
                value.method += "()";
              } else if (value.type.displayName == GENERAL_FIXTURE) {
                // This logic can now be driven by the backend enum's `refactorAction` property
                value.refactor1 = "Make Fixture Unique"
              }

              testSmellObjectList.push({ key, value });

              let lineDiv = createTestSmellElement(key, value);
              testSmellTableList.appendChild(lineDiv);
            });

            // This block now works perfectly for an empty list!
            // If `testSmells` is empty, the loop above does nothing, and this condition becomes true.
            if (testSmellTableList.innerHTML == "") {
              testSmellTableList.innerHTML = "<a style=\"color: var(--green);font-size: 20px;\">No test smells found!</a>" + '<svg ... >...</svg>';
              testSmellTableList.classList.add("smells-list-refactored");
            } else {
              // Add the "Refactor All" button only if there are smells
              let lineDiv = document.createElement('li');
              let buttonRefactorAll = document.createElement("button");
              buttonRefactorAll.classList.add("button", "refactorAll");
              buttonRefactorAll.onclick = function () {
                refactorAll(this);
              };
              buttonRefactorAll.innerHTML = "Refactor All";
              lineDiv.appendChild(buttonRefactorAll);
              testSmellTableList.appendChild(lineDiv);
              testSmellTableList.classList.remove("smells-list-refactored");
            }

            originalCodePre.setAttribute('data-line', linesWithSmells);

            Prism.highlightElement(originalCodeContainer);
            Prism.highlightElement(refactoredCodeContainer);

            console.log("Received data:", data);
          })
          .catch(error => {
            console.error('Error:', error);
            responseDiv.textContent = 'Error occurred while processing input. Check the console for details.';
          });
      });

    function createTestSmellElement(key, value) {
      let lineDiv = document.createElement('li');

      let a = document.createElement('a');
      let button1 = document.createElement("button");
      let popUpText = "";

      console.log(key);
      console.log(value);

      lineDiv.className = 'line';
      if (value.type.displayName === ASSERTION_ROULETTE) {
        popUpText = "Multiple unexplained assertions in a test method hinder readability and understanding, making test failures unclear."
        button1.className = "button";
        button1.onclick = function () {
          performRefactor(value, this);
        };
        button1.innerHTML = value.type.refactorAction;
      }
      else if (value.type === CONSTRUCTOR_INITIALIZATION) {
        popUpText = "Test suites should avoid using constructors; fields should be initialized in a setUp() method."
        button1.classList.add("button");
        button1.onclick = function () {
          refactorCI(value.lineBegin, value.lineEnd, this, value);
        };
        button1.innerHTML = value.refactor1;
      }
      else if (value.type === EXCEPTION_HANDLING) {
        popUpText = "Test cases should avoid relying on the production code throwing an error or exception; instead use JUnit's assertThrows."
        button1.classList.add("button");
        button1.onclick = function () {
          refactorEH(value.lineBegin, value.lineEnd, this, value);
        };
        button1.innerHTML = value.refactor1;
      }

      else if (value.type === IGNORED_TEST) {
        popUpText = "Ignored JUnit 4 test methods add compilation overhead and complexity, impacting code comprehension."
        button1.classList.add("button");
        button1.onclick = function () {
          refactorIT(value.lineBegin, value.lineEnd, this, value);
        };
        button1.innerHTML = value.refactor1;
      }

      else if (value.type === EMPTY_TEST) {
        popUpText = "Empty test methods pose risks; JUnit passes them, potentially masking behavior-breaking changes in production classes."
        button1.classList.add("button");
        button1.onclick = function () {
          refactorET(value.lineBegin, value.lineEnd, this, value);
        };
        button1.innerHTML = value.refactor1;
      }

      else if (value.type === DUPLICATE_ASSERT) {
        popUpText = "Repeated testing of the same condition within a test method is a test smell. Use separate methods for varying values/tests."
        button1.classList.add("button");
        button1.onclick = function () {
          refactorDA(value.lineBegin, value.lineEnd, this, value);
        };
        button1.innerHTML = value.refactor1;
      }

      else if (value.type === UNNECESSARY_PRINT) {
        popUpText = "Print statements in unit tests are redundant; used for debugging, they often remain forgotten, adding no value to automated testing."
        button1.classList.add("button");
        button1.onclick = function () {
          refactorUP(value.lineBegin, value.lineEnd, this, value);
        };
        button1.innerHTML = value.refactor1;
      }

      else if (value.type === REDUNDANT_ASSERTION) {
        popUpText = "Test methods with constant true/false assertions are a smell, often introduced for debugging and inadvertently left behind."
        button1.classList.add("button");
        button1.onclick = function () {
          refactorRA(value.lineBegin, value.lineEnd, this, value);
        };
        button1.innerHTML = value.refactor1;
      }

      else if (value.type === MYSTERY_GUEST) {
        popUpText = "Using external resources in test methods leads to stability and performance issues. Utilize mock objects instead."
        button1.classList.add("button");
        button1.onclick = function () {
          refactorMG(value.lineBegin, value.lineEnd, this, value);
        };
        button1.innerHTML = value.refactor1;
      }

      else if (value.type === MAGIC_NUMBER) {
        popUpText = "Using numeric literals in assert statements (magic numbers) is a smell. Substitute them with constants/variables for clarity."
        button1.classList.add("button");
        button1.onclick = function () {
          refactorMN(value.lineBegin, value.lineEnd, this, value);
        };
        button1.innerHTML = value.refactor1;
      }

      else if (value.type === GENERAL_FIXTURE) {
        popUpText = "Overly general test fixtures, initializing unused fields, lead to unnecessary work during test execution."
        button1.classList.add("button");
        button1.onclick = function () {
          refactorGF(value.lineBegin, value.lineEnd, this, value);
        };
        button1.innerHTML = value.refactor1;
      }

      if(value.refactor2 == true){
        button1.className = "button-refactored";
        button1.textContent = "Refactored!";
      }

      a.innerHTML = '<span class="popup"><a class="smell"><b>' + value.type.displayName + '</b></a><span class="popuptext">'+popUpText+'</span></span> detected in method <a class="method">' + value.method + '</a> at line ' + value.lineBegin + '.';
      lineDiv.appendChild(a);

      lineDiv.appendChild(button1);

      buttonList.push(button1);

      return lineDiv;
    }

    function refactorAA(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      formData.append('line', lineBegin);

      fetch('/refactorAA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          refactoredCodeContainer.textContent = data.retVal;
          refactorDataLine += lineBegin + "-" + lineEnd + ",";
          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function performRefactor(smell, button) {
      // 1. Get the CURRENT code from the textarea. This is the stateless principle.
      const currentCode = inputText.value;

      const formData = new URLSearchParams();
      formData.append('code', currentCode);
      formData.append('smellType', smell.type.name); // Send the enum name (e.g., "ASSERTION_ROULETTE")
      formData.append('line', smell.lineBegin);

      fetch('/api/refactor', { // 2. Call our new, unified endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          // New, clear, and robust way:
          // The 'data' object is now { refactoredCode: "...", changedLines: [...], message: "..." }
          const refactoredCode = data.refactoredCode;
          const changedLines = data.changedLines; // You now have access to this data!

          console.log(data.message); // "Refactoring successful."

          refactoredCodeContainer.textContent = refactoredCode;
          inputText.value = refactoredCode;

          // You can now use the 'changedLines' array for more precise highlighting
          refactorDataLine += changedLines.join(',') + ",";
          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          // Update the button state
          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
          button.disabled = true; // Disable the button after refactoring
        })
        .catch(error => {
            console.error("Refactoring failed:", error);
            alert("An error occurred during refactoring.");
        });
    }

//    TO REMOVE
    function refactorCI(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      // formData.append('inputText', data);
      formData.append('line', lineBegin);

      fetch('/refactorCI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          // console.log(data.retVal)
          // const jsonData = JSON.parse(data.retVal);
          // console.log(jsonData);
          refactoredCodeContainer.textContent = data.retVal;
          refactorDataLine += lineBegin + "-" + lineEnd + ",";
          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function refactorEH(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      // formData.append('inputText', data);
      formData.append('line', lineBegin);

      fetch('/refactorEH', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          // console.log(data.retVal)
          const jsonData = JSON.parse(data.retVal);
          // console.log(jsonData);
          // console.log(jsonData[0]);
          // console.log(jsonData[1]);

          refactoredCodeContainer.textContent = jsonData[0];
          var offset = parseInt(jsonData[1]);
          var lineBeginValue = parseInt(lineBegin);
          var lineEndValue = parseInt(lineEnd) + offset;
          lineEnd = lineEndValue.toString();
          console.log(lineEnd);
          console.log(lineEndValue);
          refactorDataLine += (lineBegin) + "-" + (lineEnd) + ",";

          adjustTestSmellLines(lineEndValue, offset);

          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function refactorIT(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      // formData.append('inputText', data);
      formData.append('line', lineBegin);

      fetch('/refactorIT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          // console.log(data.retVal)
          const jsonData = JSON.parse(data.retVal);
          // console.log(jsonData);
          refactoredCodeContainer.textContent = jsonData[0];
          var commentLine = parseInt(jsonData[1]);

          var offset = - lineEnd + commentLine + 1
          adjustTestSmellLines(parseInt(lineBegin), offset);

          refactorDataLine += (commentLine) + ",";
          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function refactorET(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      // formData.append('inputText', data);
      formData.append('line', lineBegin);

      fetch('/refactorET', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          // console.log(data.retVal)
          const jsonData = JSON.parse(data.retVal);
          // console.log(jsonData);
          refactoredCodeContainer.textContent = jsonData[0];
          var dataLine = parseInt(jsonData[1]) + 1;
          refactorDataLine += dataLine + ",";

          var offset = - lineEnd + parseInt(jsonData[1]) + 1
          adjustTestSmellLines(parseInt(lineBegin), offset);

          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function refactorDA(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      // formData.append('inputText', data);
      formData.append('line', lineBegin);

      fetch('/refactorDA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          // console.log(data.retVal)
          // const jsonData = JSON.parse(data.retVal);
          // console.log(jsonData);
          refactoredCodeContainer.textContent = data.retVal;
          refactorDataLine += lineBegin + "-" + lineEnd + ",";
          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function refactorUP(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      // formData.append('inputText', data);
      formData.append('line', lineBegin);

      fetch('/refactorUP', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          // console.log(data.retVal)
          // const jsonData = JSON.parse(data.retVal);
          // console.log(jsonData);
          refactoredCodeContainer.textContent = data.retVal;
          refactorDataLine += lineBegin + "-" + lineEnd + ",";
          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function refactorRA(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      // formData.append('inputText', data);
      formData.append('line', lineBegin);

      fetch('/refactorRA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          // console.log(data.retVal)
          // const jsonData = JSON.parse(data.retVal);
          // console.log(jsonData);
          refactoredCodeContainer.textContent = data.retVal;
          refactorDataLine += lineBegin + "-" + lineEnd + ",";
          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function refactorMG(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      // formData.append('inputText', data);
      formData.append('line', lineBegin);

      fetch('/refactorMG', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          // console.log(data.retVal)
          // const jsonData = JSON.parse(data.retVal);
          // console.log(jsonData);
          refactoredCodeContainer.textContent = data.retVal;
          refactorDataLine += lineBegin + "-" + lineEnd + ",";
          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function refactorMN(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      // formData.append('inputText', data);
      formData.append('line', lineBegin);

      fetch('/refactorMN', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          console.log(data.retVal)
          const jsonData = JSON.parse(data.retVal);
          console.log(jsonData);
          refactoredCodeContainer.textContent = jsonData[0];
          refactorDataLine += jsonData[1];
          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          adjustTestSmellLines(parseInt(lineBegin) - 1, 1);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function refactorGF(lineBegin, lineEnd, button, smell) {
      const formData = new URLSearchParams();
      // formData.append('inputText', data);
      formData.append('line', lineBegin);

      fetch('/refactorGF', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          console.log(data.retVal)
          const jsonData = JSON.parse(data.retVal);
          console.log(jsonData);
          refactoredCodeContainer.textContent = jsonData[0];
          refactorDataLine += jsonData[1];
          refactoredCodePre.setAttribute('data-line', refactorDataLine);

          const stringArray = jsonData[1].split(',');

          // Convert each substring to an integer using the map function
          const integerArray = stringArray.map(function (substring) {
            // Use parseInt to convert the substring to an integer
            return parseInt(substring, 10);
          });

          console.log(integerArray);

          for( i = parseInt(jsonData[2]); i < integerArray.length - 1; i++){
            console.log(integerArray[i]);
            adjustTestSmellLines(integerArray[i], 1);
          }

          Prism.highlightElement(refactoredCodeContainer);

          smell.refactor2 = true;
          button.className = "button-refactored";
          button.textContent = "Refactored!";
        });
    }

    function refactorAll(buttonRefactorAll) {
      const formData = new URLSearchParams();

      fetch('/refactorAll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
        .then(response => response.json())
        .then(data => {
          console.log(data.retVal)
          const jsonData = JSON.parse(data.retVal);
          console.log(jsonData);
          refactoredCodeContainer.textContent = jsonData[0];
          refactorDataLine += jsonData[1];
          refactoredCodePre.setAttribute('data-line', refactorDataLine);
          Prism.highlightElement(refactoredCodeContainer);

          buttonRefactorAll.classList.add("refactorAll-clicked");
          buttonRefactorAll.innerHTML = 'Refactored! <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" zoomAndPan="magnify" viewBox="0 0 30 30.000001" height="20" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="id1"><path d="M 2.328125 4.222656 L 27.734375 4.222656 L 27.734375 24.542969 L 2.328125 24.542969 Z M 2.328125 4.222656 " clip-rule="nonzero"/></clipPath></defs><g transform="translate(2,4)" clip-path="url(#id1)"><path fill="var(--green)" d="M 27.5 7.53125 L 24.464844 4.542969 C 24.15625 4.238281 23.65625 4.238281 23.347656 4.542969 L 11.035156 16.667969 L 6.824219 12.523438 C 6.527344 12.230469 6 12.230469 5.703125 12.523438 L 2.640625 15.539062 C 2.332031 15.84375 2.332031 16.335938 2.640625 16.640625 L 10.445312 24.324219 C 10.59375 24.472656 10.796875 24.554688 11.007812 24.554688 C 11.214844 24.554688 11.417969 24.472656 11.566406 24.324219 L 27.5 8.632812 C 27.648438 8.488281 27.734375 8.289062 27.734375 8.082031 C 27.734375 7.875 27.648438 7.679688 27.5 7.53125 Z M 27.5 7.53125 " fill-opacity="1" fill-rule="nonzero"/></g></svg>';

          testSmellObjectList.forEach((item, index) => {
            item.value.refactor2 = true;
            var button = buttonList[index];
            button.className = "button-refactored";
            button.textContent = "Refactored!";
          });
        });
    }

    function adjustTestSmellLines(lineEndValue, offset) {
      console.log(lineEndValue);
      testSmellObjectList.forEach((item, index) => {
        var itemLineBeginValue = parseInt(item.value.lineBegin);
        var itemLineEndValue = parseInt(item.value.lineEnd);
        if (itemLineBeginValue > lineEndValue) {
          item.value.lineBegin = (itemLineBeginValue + offset).toString();
          console.log(item.value.lineBegin + " > " + lineEndValue)
        }
        if (itemLineEndValue > lineEndValue) {
          item.value.lineEnd = (itemLineEndValue + offset).toString();
          console.log(item.value.lineEnd + " > " + lineEndValue)
        }

        var button = buttonList[index];

        switch (item.value.type) {
          case ASSERTION_ROULETTE:
            button.onclick = function () {
              refactorAA(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          case CONSTRUCTOR_INITIALIZATION:
            button.onclick = function () {
              refactorCI(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          case EXCEPTION_HANDLING:
            button.onclick = function () {
              refactorEH(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          case IGNORED_TEST:
            button.onclick = function () {
              refactorIT(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          case EMPTY_TEST:
            button.onclick = function () {
              refactorET(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          case DUPLICATE_ASSERT:
            button.onclick = function () {
              refactorDA(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          case UNNECESSARY_PRINT:
            button.onclick = function () {
              refactorUP(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          case REDUNDANT_ASSERTION:
            button.onclick = function () {
              refactorRA(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          case MYSTERY_GUEST:
            button.onclick = function () {
              refactorMG(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          case MAGIC_NUMBER:
            button.onclick = function () {
              refactorMN(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          case GENERAL_FIXTURE:
            button.onclick = function () {
              refactorGF(item.value.lineBegin, item.value.lineEnd, this, item.value);
            };
            break;
          default:
            break;
        }
      })
    }

    function printFileContent() {
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
          const content = event.target.result;
          console.log("File Content:");
          console.log(content);
        }

        reader.readAsText(file);
      } else {
        console.log("No file selected.");
      }
    }
