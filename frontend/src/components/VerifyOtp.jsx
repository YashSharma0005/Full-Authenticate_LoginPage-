import { useState } from "react";
import { Snackbar, Alert } from "@mui/material";


function VerifyOtp({ email, setView }) {

    const [otp, setOtp] = useState("");

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState("success");



    const verify = async () => {
        console.log("Recived Email:", email);
        console.log("OTP:", otp);

        if (!otp) {
            setMessage("Please enter OTP");
            setSeverity("error");
            setOpen(true);
            return;
        }


        try {

            const res = await fetch(
                "http://localhost:5000/api/auth/verify-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        otp
                    })
                }
            );

            const data = await res.json();


            if (res.ok) {

                setMessage("OTP verified successfully");
                setSeverity("success");
                setOpen(true);


                setTimeout(() => {
                    setView("reset");
                }, 1000);


            } else {

                setMessage(data.message || "Invalid OTP");
                setSeverity("error");
                setOpen(true);

            }


        } catch (error) {

            console.log(error);

            setMessage("Server connection failed");
            setSeverity("error");
            setOpen(true);

        }

    };


    return (
        <div>

            <h2>Verify OTP</h2>


            <input
                type="text"
                maxLength="6"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
            />


            <button onClick={verify}>
                Verify OTP
            </button>


            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
            >

                <Alert
                    severity={severity}
                    variant="filled"
                >
                    {message}
                </Alert>

            </Snackbar>


        </div>
    );
}

export default VerifyOtp;