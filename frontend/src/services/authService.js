import Swal from 'sweetalert2';

const API_URL = 'http://localhost:5000/api/auth';

// Helper 1: Pure API Sign-In Execution
export const executeLoginApi = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    return { response, data };
};

// Helper 2: Pure API Sign-Up Execution
export const executeSignupApi = async (name, email, password) => {
    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    return { response, data };
};

// Main Orchestrator for Smart Routing Transitions
export const handleSmartAuth = async ({ isSignup, name, email, password, setCurrentUser, setView, setIsSignup }) => {
    Swal.showLoading();

    try {
        if (isSignup) {
            // 👉 FLOW A: USER IS SIGNING UP
            const { response, data } = await executeSignupApi(name, email, password);

            // Condition 1: Account already exists -> Trigger Auto Login Pop-up
            if (response.status === 400 && data.message?.includes('already registered')) {
                Swal.fire({
                    icon: 'info',
                    title: 'Account Already Exists!',
                    text: 'You are already registered. Logging you in automatically...',
                    showConfirmButton: false,
                    timer: 2000,
                    didOpen: () => { Swal.showLoading(); }
                });

                const loginResult = await executeLoginApi(email, password);
                if (!loginResult.response.ok) throw new Error(loginResult.data.message || 'Auto-Login failed');

                saveUserSession(loginResult.data, setCurrentUser, setView);
                showSuccessAlert(`Logged In Successfully!`);
                return;
            }

            if (!response.ok) throw new Error(data.message || 'Registration failed');

            // Standard signup success
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful!',
                text: 'Your details are securely saved. Redirecting to Login...',
                confirmButtonColor: '#16a34a',
                timer: 2000
            });
            setIsSignup(false);

        } else {
            // 👉 FLOW B: USER IS LOGGING IN
            const { response, data } = await executeLoginApi(email, password);

            // Condition 2: Account not found -> Trigger Auto Registration Pop-up
            if (response.status === 400 && data.message?.includes('not found')) {
                Swal.fire({
                    icon: 'info',
                    title: 'Account Not Found!',
                    text: 'Creating a brand new account for you automatically...',
                    showConfirmButton: false,
                    timer: 2000,
                    didOpen: () => { Swal.showLoading(); }
                });

                const fallbackName = email.includes('@') ? email.split('@')[0] : 'Gobus User';

                const signupResult = await executeSignupApi(fallbackName, email, password);
                if (!signupResult.response.ok) throw new Error(signupResult.data.message || 'Auto-Signup failed');

                const loginResult = await executeLoginApi(email, password);
                if (!loginResult.response.ok) throw new Error(loginResult.data.message || 'Login sequence failed');

                saveUserSession(loginResult.data, setCurrentUser, setView);
                showSuccessAlert('Account Created & Logged In!');
                return;
            }

            if (!response.ok) throw new Error(data.message || 'Login failed');

            // Standard login success
            saveUserSession(data, setCurrentUser, setView);
            showSuccessAlert(`Welcome back!`);
        }
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Authentication Error',
            text: err.message,
            confirmButtonColor: '#dc2626'
        });
    }
};

// Local storage session utility
const saveUserSession = (data, setCurrentUser, setView) => {
    localStorage.setItem('gobus_jwt_token', data.token);
    localStorage.setItem('gobus_user_profile', JSON.stringify(data.user));
    setCurrentUser(data.user);
    setView('dashboard');
};

const showSuccessAlert = (titleText) => {
    Swal.fire({
        icon: 'success',
        title: titleText,
        showConfirmButton: false,
        timer: 1500
    });
};