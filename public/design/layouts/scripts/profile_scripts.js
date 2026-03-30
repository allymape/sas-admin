(function () {
  const $profileLoader = $("#profile-page-loader");
  const $feedbackArea = $("#profile-feedback-area");
  const $profileForm = $("#profileForm");
  const $passwordForm = $("#passwordForm");

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,40}$/;
  const PHONE_REGEX = /^\+?[0-9\s-]{9,20}$/;
  const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

  const state = {
    avatarBase64: "",
    avatarChanged: false,
  };

  $(window).on("load", function () {
    setTimeout(() => {
      $profileLoader.fadeOut(120);
    }, 180);
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showInlineFeedback(type, message) {
    if (!$feedbackArea.length) return;
    const alertType = type === "success" ? "success" : type === "warning" ? "warning" : "danger";
    $feedbackArea.html(`
      <div class="alert alert-${alertType} alert-dismissible fade show" role="alert">
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
  }

  function setFieldError(selector, message) {
    const $field = $(selector);
    const fieldId = $field.attr("id");
    const errorMap = {
      fullNameInput: "#fullNameError",
      usernameInput: "#usernameError",
      phonenumberInput: "#phoneError",
      emailInput: "#emailError",
      oldpasswordInput: "#oldPasswordError",
      newpasswordInput: "#newPasswordError",
      confirmpasswordInput: "#confirmPasswordError",
    };
    const errorId = fieldId && errorMap[fieldId] ? errorMap[fieldId] : null;
    $field.addClass("is-invalid");
    if (errorId && $(errorId).length) {
      $(errorId).text(message || "");
    }
  }

  function clearFieldError(selector) {
    const $field = $(selector);
    const fieldId = $field.attr("id");
    const errorMap = {
      fullNameInput: "#fullNameError",
      usernameInput: "#usernameError",
      phonenumberInput: "#phoneError",
      emailInput: "#emailError",
      oldpasswordInput: "#oldPasswordError",
      newpasswordInput: "#newPasswordError",
      confirmpasswordInput: "#confirmPasswordError",
    };
    const errorId = fieldId && errorMap[fieldId] ? errorMap[fieldId] : null;
    $field.removeClass("is-invalid");
    if (errorId && $(errorId).length) {
      $(errorId).text("");
    }
  }

  function setButtonLoading($button, loading, loadingText, normalHtml) {
    if (!$button.length) return;
    if (loading) {
      $button.data("original-html", $button.html());
      $button.prop("disabled", true);
      $button.html(`<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>${loadingText}`);
      return;
    }

    $button.prop("disabled", false);
    if (normalHtml) {
      $button.html(normalHtml);
      return;
    }

    const original = $button.data("original-html");
    if (original) {
      $button.html(original);
    }
  }

  function normalizePhone(value) {
    return String(value || "").trim();
  }

  function validateProfileForm() {
    let valid = true;

    const $fullName = $("#fullNameInput");
    const $username = $("#usernameInput");
    const $phone = $("#phonenumberInput");
    const $email = $("#emailInput");
    const canEditUsername = !$username.is(":disabled") && !$username.prop("readonly");
    const canEditEmail = !$email.is(":disabled") && !$email.prop("readonly");

    const fullName = String($fullName.val() || "").trim();
    const username = String($username.val() || "").trim();
    const phone_number = normalizePhone($phone.val());
    const email = String($email.val() || "").trim().toLowerCase();

    clearFieldError("#fullNameInput");
    clearFieldError("#usernameInput");
    clearFieldError("#phonenumberInput");
    clearFieldError("#emailInput");

    if (!fullName || fullName.length < 3) {
      valid = false;
      setFieldError("#fullNameInput", "Jina kamili linahitajika (angalau herufi 3).");
    }

    if (!phone_number || !PHONE_REGEX.test(phone_number)) {
      valid = false;
      setFieldError("#phonenumberInput", "Weka namba sahihi ya simu (tarakimu 9 hadi 20).");
    }

    if (canEditUsername) {
      if (!username || !USERNAME_REGEX.test(username)) {
        valid = false;
        setFieldError("#usernameInput", "Jina la mtumiaji liwe na herufi/tarakimu 3-40 tu.");
      }
    }

    if (canEditEmail) {
      if (!email || !EMAIL_REGEX.test(email)) {
        valid = false;
        setFieldError("#emailInput", "Weka barua pepe sahihi.");
      }
    }

    const payload = {
      full_name: fullName,
      phone_number,
      email_notify: $("#emailNotifyInput").prop("checked") ? 1 : 0,
    };

    if (canEditUsername) {
      payload.username = username;
    }

    if (canEditEmail) {
      payload.email = email;
    }

    if (state.avatarChanged) {
      payload.profile_photo = state.avatarBase64;
    }

    return { valid, payload };
  }

  function getPasswordStrength(password) {
    const value = String(password || "");
    let score = 0;

    if (value.length >= 8) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[@$!%*?&]/.test(value)) score += 1;

    if (score <= 1) return { label: "Dhaifu", width: 20, color: "#dc3545" };
    if (score === 2) return { label: "Inaendelea", width: 40, color: "#fd7e14" };
    if (score === 3) return { label: "Wastani", width: 60, color: "#ffc107" };
    if (score === 4) return { label: "Imara", width: 80, color: "#0dcaf0" };
    return { label: "Imara Sana", width: 100, color: "#198754" };
  }

  function validatePasswordForm() {
    let valid = true;

    const oldpassword = String($("#oldpasswordInput").val() || "").trim();
    const newpassword = String($("#newpasswordInput").val() || "").trim();
    const confirmpassword = String($("#confirmpasswordInput").val() || "").trim();

    clearFieldError("#oldpasswordInput");
    clearFieldError("#newpasswordInput");
    clearFieldError("#confirmpasswordInput");

    if (!oldpassword) {
      valid = false;
      setFieldError("#oldpasswordInput", "Weka nywila ya sasa.");
    }

    if (!newpassword) {
      valid = false;
      setFieldError("#newpasswordInput", "Weka nywila mpya.");
    } else if (!PASSWORD_REGEX.test(newpassword)) {
      valid = false;
      setFieldError("#newpasswordInput", "Nywila mpya haijafikia vigezo vya usalama.");
    }

    if (!confirmpassword) {
      valid = false;
      setFieldError("#confirmpasswordInput", "Thibitisha nywila mpya.");
    }

    if (oldpassword && newpassword && oldpassword === newpassword) {
      valid = false;
      setFieldError("#newpasswordInput", "Nywila mpya haiwezi kufanana na ya sasa.");
    }

    const mismatch = Boolean(newpassword && confirmpassword && newpassword !== confirmpassword);
    $("#passwordMismatch").toggleClass("d-none", !mismatch);

    if (mismatch) {
      valid = false;
      setFieldError("#confirmpasswordInput", "Nywila mpya na uthibitisho havifanani.");
    }

    const strength = getPasswordStrength(newpassword);
    $("#passwordStrengthBar").css({ width: `${strength.width}%`, backgroundColor: strength.color });
    $("#passwordStrengthText").text(`Nguvu ya nywila: ${newpassword ? strength.label : "-"}`);

    return {
      valid,
      payload: {
        oldpassword,
        newpassword,
        confirmpassword,
      },
    };
  }

  function update(url, data, callback) {
    ajaxRequest(url, "POST", (response) => {
      callback(response);
    }, JSON.stringify(data));
  }

  $("#profile-img-file-input").on("change", function () {
    const file = this.files && this.files[0] ? this.files[0] : null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showInlineFeedback("warning", "Tafadhali chagua faili la picha pekee.");
      this.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      showInlineFeedback("warning", "Picha iwe chini ya MB 2.");
      this.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const base64 = String(event.target?.result || "");
      if (!base64) {
        showInlineFeedback("warning", "Imeshindikana kusoma picha uliyochagua.");
        return;
      }

      state.avatarBase64 = base64;
      state.avatarChanged = true;
      $("#avatarBase64Input").val(base64);
      $("#profile-avatar-preview").attr("src", base64);
      showInlineFeedback("success", "Picha imechaguliwa. Bonyeza Badili Taarifa kuhifadhi.");
    };
    reader.readAsDataURL(file);
  });

  $("#fullNameInput, #usernameInput, #phonenumberInput, #emailInput, #emailNotifyInput").on("input change blur", () => {
    validateProfileForm();
  });

  $profileForm.on("submit", function (e) {
    e.preventDefault();
    const { valid, payload } = validateProfileForm();

    if (!valid) {
      showInlineFeedback("warning", "Tafadhali hakiki sehemu zenye makosa kabla ya kuhifadhi.");
      return;
    }

    const $button = $("#btn-update-details");
    setButtonLoading($button, true, "Inahifadhi...", null);

    update("/UpdateMyProfile", payload, (response) => {
      const statusCode = Number(response?.statusCode || 0);
      const ok = statusCode === 300;
      const message = response?.message || (ok ? "Taarifa zimehifadhiwa." : "Imeshindikana kuhifadhi taarifa.");

      setButtonLoading($button, false, "", '<span class="ri-user-settings-line me-1"></span> Badili Taarifa');
      showInlineFeedback(ok ? "success" : "warning", message);

      alertMessage(
        ok ? "Umefanikiwa" : "Haujafanikiwa",
        message,
        ok ? "success" : "error",
        () => {}
      );

      if (ok) {
        $("#profile-display-name").text(payload.full_name || "-");
        if (payload.username) {
          $("#profile-display-username").text(payload.username);
        }
      }
    });
  });

  $(".password-toggle").on("click", function () {
    const targetSelector = $(this).data("target");
    const $target = $(targetSelector);
    if (!$target.length) return;

    const isPassword = $target.attr("type") === "password";
    $target.attr("type", isPassword ? "text" : "password");
    $(this).find("i").attr("class", isPassword ? "ri-eye-off-line" : "ri-eye-line");
  });

  $("#oldpasswordInput, #newpasswordInput, #confirmpasswordInput").on("input blur", function () {
    const { valid } = validatePasswordForm();
    $("#btn-change-password").prop("disabled", !valid);
  });

  $passwordForm.on("submit", function (e) {
    e.preventDefault();
    const { valid, payload } = validatePasswordForm();

    if (!valid) {
      showInlineFeedback("warning", "Tafadhali hakiki taarifa za nywila kabla ya kuwasilisha.");
      $("#btn-change-password").prop("disabled", true);
      return;
    }

    const $button = $("#btn-change-password");
    setButtonLoading($button, true, "Inabadilisha...", "Badili Nywila");

    update("/ChangeMyPassword", payload, (response) => {
      const statusCode = Number(response?.statusCode || 0);
      const ok = statusCode === 300;
      const message = response?.message || (ok ? "Nywila imebadilishwa." : "Imeshindikana kubadili nywila.");

      setButtonLoading($button, false, "", "Badili Nywila");
      const stillValid = validatePasswordForm().valid;
      $("#btn-change-password").prop("disabled", !stillValid);
      showInlineFeedback(ok ? "success" : "warning", message);

      alertMessage(
        ok ? "Umefanikiwa" : statusCode === 422 ? "Kuna Makosa" : "Haujafanikiwa",
        message,
        ok ? "success" : "error",
        () => {
          if (!ok) return;

          $(document).find("#logout").remove();
          $(document)
            .find("body")
            .append('<form action="/logout" method="POST" id="logout"><input name="logout" type="hidden" /></form>');
          $("#logout").submit();
        }
      );
    });
  });
})();
