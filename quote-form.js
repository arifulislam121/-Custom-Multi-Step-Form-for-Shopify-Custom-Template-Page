document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".form-step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const backBtns = document.querySelectorAll(".back-btn");
  const overview = document.getElementById("overview");
  const quoteForm = document.getElementById("quoteForm");
  const successPopup = document.getElementById("successPopup");
  const closeSuccess = document.querySelector(".close-success");
  let currentStep = 0;

  // ================= Step Navigation =================
function changeStep(dir) {
  // Current step hide/remove active
  steps[currentStep].classList.remove("active");

  // Update current step index
  currentStep += dir;
  if (currentStep < 0) currentStep = 0;
  if (currentStep >= steps.length) currentStep = steps.length - 1;

  // Show new step and mark active
  steps[currentStep].classList.add("active");

  // Update the overview section
  updateOverview();
}



  // ================= Validate Current Step =================
  function validateStep() {
    const currentForm = steps[currentStep];
    const visibleInputs = currentForm.querySelectorAll(
      "input[required]:not(.hidden input), select[required]:not(.hidden select), textarea[required]:not(.hidden textarea)"
    );
    for (let input of visibleInputs) {
      if (input.type === "radio") {
        const checked = currentForm.querySelector(`input[name="${input.name}"]:checked`);
        if (!checked) return false;
      } else if (input.type === "checkbox") {
        if (!input.checked) return false;
      } else if (input.value.trim() === "") return false;
    }
    return true;
  }

  // ================= Next Button =================
  nextBtns.forEach(btn =>
    btn.addEventListener("click", () => {
      if (!validateStep()) {
        alert("Please fill all required fields.");
        return;
      }

      // Step-4 Skirting logic
      if (currentStep === 3) {
        const skirtSel = document.querySelector('input[name="skirting"]:checked');
        const skirtChild = document.getElementById("skirtingChildOptions");

        if (skirtSel) {
          if (skirtSel.value.includes("I don't need skirting boards")) {
            // সরাসরি Overview (Step-6)
            steps[currentStep].classList.remove("active");
            currentStep = 5;
            steps[currentStep].classList.add("active");
            updateOverview();
            return;
          } else if (skirtChild) {
            // Product select করলে related options Step-5
            skirtChild.classList.remove("hidden");
          }
        }
      }

      changeStep(1);
    })
  );

  // ================= Back Button =================
  backBtns.forEach(btn =>
    btn.addEventListener("click", () => {
      changeStep(-1);
    })
  );


// ================= Leveling show/hide =================
document.querySelectorAll('input[name="leveling"]').forEach(r => {
  r.addEventListener("change", e => {
    const levelingTypes = document.getElementById("levelingTypes");
    const floorTypeField = document.querySelector('select[name="floor_type"]');

    if (e.target.value === "Yes") {
      levelingTypes.classList.remove("hidden");
      floorTypeField.required = true;  // Make the floor type required when "Yes" is selected
      floorTypeField.style.display = "block";  // Ensure it is visible
    } else {
      levelingTypes.classList.add("hidden");
      floorTypeField.required = false;  // Remove the required attribute when "No" is selected
      floorTypeField.style.display = "none";  // Hide the floor type select element
      floorTypeField.value = "";  // Clear the selected value
    }

    updateOverview();
  });
});


// ================= Step-5: Parent and Child Logic =================


document.querySelectorAll('input[name="skirting"]').forEach(r => {
  r.addEventListener("change", e => {
    const skirtChild = document.getElementById("skirtingChildOptions");
    const skirtNoOption = "I don't need skirting boards — I will provide this at a later time"; // Value of the "No Skirting" option
    
    // If "I don't need skirting boards" is selected, hide child options and remove "required"
    if (e.target.value === skirtNoOption) {
      skirtChild.classList.add("hidden");  // Hide the child options
      skirtChild.querySelectorAll('input[required]').forEach(input => {
        input.required = false; // Remove required validation
        input.checked = false; // Clear any checked values
      });
    } else {
      skirtChild.classList.remove("hidden");  // Show the child options
      skirtChild.querySelectorAll('input[required]').forEach(input => {
        input.required = true; // Make child options required
      });
    }

    updateOverview();
  });
});

// ================= Form Validation =================
function validateStep() {
  const currentForm = steps[currentStep];
  const visibleInputs = currentForm.querySelectorAll(
    "input[required]:not(.hidden input):not([style*='display: none']), " +
    "select[required]:not(.hidden select):not([style*='display: none']), " +
    "textarea[required]:not(.hidden textarea):not([style*='display: none'])"
  );

  for (let input of visibleInputs) {
    if (input.type === "radio") {
      const checked = currentForm.querySelector(`input[name="${input.name}"]:checked`);
      if (!checked) return false;
    } else if (input.type === "checkbox") {
      if (!input.checked) return false;
    } else if (input.value.trim() === "") return false;
  }
  return true;
}



// ================= Fix: Prevent hidden required field validation =================
quoteForm.addEventListener("submit", function (e) {
  // hidden or display:none elements disable temporarily
  const allRequired = quoteForm.querySelectorAll("[required]");
  allRequired.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || el.closest(".hidden")) {
      el.dataset.wasRequired = "true";
      el.required = false;
    }
  });

  // Allow submit to continue normally (no manual preventDefault)
  setTimeout(() => {
    // restore required attributes after submission
    allRequired.forEach(el => {
      if (el.dataset.wasRequired) {
        el.required = true;
        delete el.dataset.wasRequired;
      }
    });
  }, 500);
});




  // ================= Surface area sync =================
  const range = document.getElementById("surfaceAreaRange");
  const num = document.getElementById("surfaceArea");
  if (range && num) {
    range.addEventListener("input", () => {
      num.value = range.value;
      updateOverview();
    });
    num.addEventListener("input", () => {
      range.value = num.value;
      updateOverview();
    });
  }

 // ================= product image,title loaded  =================
const productData = localStorage.getItem("quoteProduct");
  if (productData) {
    const product = JSON.parse(productData);
    document.getElementById("productPreview").innerHTML = `
      <div class="selected-product">
        <img id="step1Img" class="step-img" src="${product.image}" alt="${product.title}" >
        <h3>${product.title}</h3>
      </div>
    `;
  }

// Check if quoteProduct exists in localStorage
  const quoteData = localStorage.getItem("quoteProduct");

  if (!quoteData) {
    // Redirect to homepage if no product data
    window.location.href = "/";
  }





  // ================= Overview Update =================
  function updateOverview() {
  const overview = document.getElementById("overview");
  const steps = document.querySelectorAll(".form-step");

  // localStorage থেকে product data আনা
  const productData = localStorage.getItem("quoteProduct");
  let productTitle = "N/A";
  if (productData) {
    const product = JSON.parse(productData);
    productTitle = product.title || "N/A";
  }

  const area = document.getElementById("surfaceArea")?.value || "N/A";
  const install = document.querySelector('input[name="installation"]:checked')?.value || "N/A";
  const level = document.querySelector('input[name="leveling"]:checked')?.value || "N/A";
  const floor = document.querySelector('select[name="floor_type"]')?.value || "N/A";
  const skirt = document.querySelector('input[name="skirting"]:checked')?.value || "N/A";
  const skirtOpt = document.querySelector('input[name="skirting_install_option"]:checked')?.value || "N/A";
  const laminaatOpt = document.querySelector('input[name="laminaat_option"]:checked')?.value || "N/A";

  const stepMap = { area: 0, installation: 1, leveling: 2, underlay: 2, laminaat: 2, skirting: 3, skirt_option: 4 };

  let html = `
    <p><b>Product:</b> ${productTitle}</p>
    <p><b>Surface Area:</b> ${area} m² <span class="edit-icon" data-step="${stepMap.area}">✎</span></p>
    <p><b>Installation:</b> ${install} <span class="edit-icon" data-step="${stepMap.installation}">✎</span></p>
  `;

  if (laminaatOpt !== "N/A")
    html += `<p><b>Underlay:</b> ${laminaatOpt} <span class="edit-icon" data-step="${stepMap.laminaat}">✎</span></p>`;

  if (level !== "N/A")
    html += `<p><b>Leveling Service:</b> ${level} (${floor}) <span class="edit-icon" data-step="${stepMap.leveling}">✎</span></p>`;

  html += `<p><b>Skirting Boards:</b> ${skirt} <span class="edit-icon" data-step="${stepMap.skirting}">✎</span></p>`;

  if (!skirt.includes("I don't need skirting boards"))
    html += `<p><b>Skirting Option:</b> ${skirtOpt} <span class="edit-icon" data-step="${stepMap.skirt_option}">✎</span></p>`;

  overview.innerHTML = html;

  // Edit icons click
  document.querySelectorAll(".edit-icon").forEach(icon => {
    icon.addEventListener("click", () => {
      const stepToEdit = parseInt(icon.getAttribute("data-step"));
      steps[currentStep].classList.remove("active");
      currentStep = stepToEdit;
      steps[currentStep].classList.add("active");
    });
  });
}

updateOverview();

  // ================= Success Popup =================
  quoteForm.addEventListener("submit", function(e) {
    e.preventDefault();
    successPopup.style.display = "flex";
  });

  closeSuccess.addEventListener("click", () => {
    successPopup.style.display = "none";
  });

  window.addEventListener("click", e => {
    if (e.target === successPopup) successPopup.style.display = "none";
  });

  // ================= Radio Button Active Highlight =================
  document.querySelectorAll('#skirtingProductList label, .option-group label, #skirtingChildOptions label').forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    if (!radio) return;
    radio.addEventListener('change', () => {
      const groupContainer = label.closest('#skirtingProductList') || label.closest('.option-group') || label.closest('#skirtingChildOptions');
      groupContainer.querySelectorAll('label').forEach(l => l.classList.remove('active'));
      if(radio.checked) label.classList.add('active');
    });
  });
});


