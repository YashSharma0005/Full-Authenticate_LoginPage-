import { useState } from "react";

function ResetPassword({ email }) {
  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const reset = async () => {
    if (
      password !== confirmPassword
    ) {
      alert("Passwords do not match");
      return;
    }

    await fetch(
      "http://localhost:8080/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      }
    );

    alert(
      "Password Changed Successfully"
    );
  };

  return (
    <>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Confirm Password"
        onChange={(e) =>
          setConfirmPassword(
            e.target.value
          )
        }
      />

      <button onClick={reset}>
        Change Password
      </button>
    </>
  );
}

export default ResetPassword;