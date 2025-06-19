// function getBathValue() {
//   var uiBathrooms = document.getElementsByName("uiBathrooms");
//   for(var i in uiBathrooms) {
//     if(uiBathrooms[i].checked) {
//         return parseInt(i)+1;
//     }
//   }
//   return -1; // Invalid Value
// }

// function getBHKValue() {
//   var uiBHK = document.getElementsByName("uiBHK");
//   for(var i in uiBHK) {
//     if(uiBHK[i].checked) {
//         return parseInt(i)+1;
//     }
//   }
//   return -1; // Invalid Value
// }

// function onClickedEstimatePrice() {
//   console.log("Estimate price button clicked");
//   var sqft = document.getElementById("uiSqft");
//   var bhk = getBHKValue();
//   var bathrooms = getBathValue();
//   var location = document.getElementById("uiLocations");
//   var estPrice = document.getElementById("uiEstimatedPrice");

//   // var url = "http://127.0.0.1:5000/predict_home_price"; //Use this if you are NOT using nginx which is first 7 tutorials
//   var url = "/api/predict_home_price"; // Use this if  you are using nginx. i.e tutorial 8 and onwards

//   $.post(url, {
//       total_sqft: parseFloat(sqft.value),
//       bhk: bhk,
//       bath: bathrooms,
//       location: location.value
//   },function(data, status) {
//       console.log(data.estimated_price);
//       estPrice.innerHTML = "<h2>" + data.estimated_price.toString() + " Lakh</h2>";
//       console.log(status);
//   });
// }

// function onPageLoad() {
//   console.log( "document loaded" );
//   // var url = "http://127.0.0.1:5000/get_location_names"; // Use this if you are NOT using nginx which is first 7 tutorials
//   var url = "/api/get_location_names"; // Use this if  you are using nginx. i.e tutorial 8 and onwards
//   $.get(url,function(data, status) {
//       console.log("got response for get_location_names request");
//       if(data) {
//           var locations = data.locations;
//           var uiLocations = document.getElementById("uiLocations");
//           $('#uiLocations').empty();
//           for(var i in locations) {
//               var opt = new Option(locations[i]);
//               $('#uiLocations').append(opt);
//           }
//       }
//   });
// }

// window.onload = onPageLoad;

// Global variables
let isLoading = false;

// Utility functions
function getBHKValue() {
  const bhkRadios = document.getElementsByName("uiBHK");
  for (let i = 0; i < bhkRadios.length; i++) {
    if (bhkRadios[i].checked) {
      return parseInt(bhkRadios[i].value);
    }
  }
  return -1;
}

function getBathValue() {
  const bathRadios = document.getElementsByName("uiBathrooms");
  for (let i = 0; i < bathRadios.length; i++) {
    if (bathRadios[i].checked) {
      return parseInt(bathRadios[i].value);
    }
  }
  return -1;
}

function showLoading() {
  isLoading = true;
  const btn = document.getElementById("predictBtn");
  const btnText = document.getElementById("btnText");
  const loading = document.getElementById("loading");

  btn.disabled = true;
  btnText.style.opacity = "0";
  loading.style.display = "block";
}

function hideLoading() {
  isLoading = false;
  const btn = document.getElementById("predictBtn");
  const btnText = document.getElementById("btnText");
  const loading = document.getElementById("loading");

  btn.disabled = false;
  btnText.style.opacity = "1";
  loading.style.display = "none";
}

function showResult(price, isError = false) {
  const result = document.getElementById("result");
  const priceValue = document.getElementById("priceValue");

  if (isError) {
    result.className = "result error";
    priceValue.textContent = "Error occurred";
    result.querySelector("p").textContent = "Please try again later";
  } else {
    result.className = "result";
    priceValue.textContent = `₹${price} Lakh`;
    result.querySelector("p").textContent = "Estimated property value";
  }

  result.style.display = "block";
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function validateForm() {
  const sqft = document.getElementById("uiSqft").value;
  const location = document.getElementById("uiLocations").value;
  const bhk = getBHKValue();
  const bath = getBathValue();

  if (!sqft || sqft < 100) {
    alert("Please enter a valid area (minimum 100 sq ft)");
    return false;
  }

  if (!location) {
    alert("Please select a location");
    return false;
  }

  if (bhk === -1) {
    alert("Please select number of bedrooms");
    return false;
  }

  if (bath === -1) {
    alert("Please select number of bathrooms");
    return false;
  }

  return true;
}

// Main prediction function
function predictPrice() {
  if (!validateForm() || isLoading) return;

  console.log("Estimate price button clicked");

  const sqft = document.getElementById("uiSqft");
  const bhk = getBHKValue();
  const bathrooms = getBathValue();
  const location = document.getElementById("uiLocations");

  showLoading();

  // Use the appropriate URL based on your setup
  //const url = "/api/predict_home_price"; // For nginx setup
  const url = "http://127.0.0.1:5000/predict_home_price"; // For direct Flask

  $.post(url, {
    total_sqft: parseFloat(sqft.value),
    bhk: bhk,
    bath: bathrooms,
    location: location.value,
  })
    .done(function (data) {
      console.log("Prediction successful:", data);
      hideLoading();
      showResult(data.estimated_price);
    })
    .fail(function (xhr, status, error) {
      console.error("Prediction failed:", error);
      hideLoading();
      showResult(null, true);
    });
}

// Load locations on page load
function loadLocations() {
  console.log("Loading locations...");

  // Use the appropriate URL based on your setup
  // const url = "/api/get_location_names"; // For nginx setup
  const url = "http://127.0.0.1:5000/get_location_names"; // For direct Flask

  $.get(url)
    .done(function (data) {
      console.log("Locations loaded successfully");
      if (data && data.locations) {
        const locationSelect = document.getElementById("uiLocations");
        locationSelect.innerHTML =
          '<option value="" disabled selected>Choose a location...</option>';

        data.locations.forEach(function (location) {
          const option = document.createElement("option");
          option.value = location;
          option.textContent =
            location.charAt(0).toUpperCase() + location.slice(1);
          locationSelect.appendChild(option);
        });
      }
    })
    .fail(function (xhr, status, error) {
      console.error("Failed to load locations:", error);
      const locationSelect = document.getElementById("uiLocations");
      locationSelect.innerHTML =
        '<option value="" disabled>Failed to load locations</option>';
    });
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  loadLocations();

  // Form submission
  document.getElementById("priceForm").addEventListener("submit", function (e) {
    e.preventDefault();
    predictPrice();
  });

  // Input validation
  document.getElementById("uiSqft").addEventListener("input", function (e) {
    const value = parseInt(e.target.value);
    if (value > 10000) {
      e.target.value = 10000;
    } else if (value < 0) {
      e.target.value = 0;
    }
  });

  // Add smooth transitions to radio buttons
  const radioOptions = document.querySelectorAll(
    '.radio-option input[type="radio"]'
  );
  radioOptions.forEach((radio) => {
    radio.addEventListener("change", function () {
      // Hide result when form changes
      document.getElementById("result").style.display = "none";
    });
  });

  // Hide result when inputs change
  document.getElementById("uiSqft").addEventListener("input", function () {
    document.getElementById("result").style.display = "none";
  });

  document
    .getElementById("uiLocations")
    .addEventListener("change", function () {
      document.getElementById("result").style.display = "none";
    });
});

// Add some interactive feedback
document.addEventListener("DOMContentLoaded", function () {
  // Add ripple effect to button
  const btn = document.getElementById("predictBtn");
  btn.addEventListener("click", function (e) {
    if (!this.disabled) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple 0.6s linear;
                        pointer-events: none;
                    `;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  });
});

// Add CSS for ripple animation
const style = document.createElement("style");
style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);
