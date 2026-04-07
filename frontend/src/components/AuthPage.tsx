import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AuthPage.css';

interface LoginErrors {
  identifier?: string;
  password?: string;
}
 
interface SignupErrors {
  username?: string;
  email?: string;
  password?: string;
}

const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Must include at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Must include at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Must include at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Must include at least one special character (!@#$% etc).';
  return undefined;
};

const getStrength = (p: string): number => {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
};

const strengthLabel = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Login state
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});

  // Signup state
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});
  const [signupStatus, setSignupStatus] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);

  // --- Validators ---
  const validateLogin = (): boolean => {
    const errors: LoginErrors = {};
    if (!loginData.identifier.trim())
      errors.identifier = 'Email or username is required.';
    const passwordError = validatePassword(loginData.password);
    if (passwordError) errors.password = passwordError;
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignup = (): boolean => {
    const errors: SignupErrors = {};
    if (!signupData.username.trim())
      errors.username = 'Username is required.';
    if (!signupData.email.trim())
      errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email))
      errors.email = 'Enter a valid email address.';
    const passwordError = validatePassword(signupData.password);
    if (passwordError) errors.password = passwordError;
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Submit Handlers ---
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStatus(null);
    if (validateLogin()) {
      setLoginLoading(true);
      try {
        const res = await axios.post('http://localhost:5000/api/login', {
          identifier: loginData.identifier,
          password: loginData.password
        });
        localStorage.setItem('user', JSON.stringify(res.data));
        setLoginStatus('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
          setLoginStatus('Error: ' + err.response.data.error);
        } else {
          setLoginStatus('An error occurred. Please try again.');
        }
      } finally {
        setLoginLoading(false);
      }
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus(null);
    if (validateSignup()) {
      setSignupLoading(true);
      try {
        const res = await axios.post('http://localhost:5000/api/signup', signupData);
        localStorage.setItem('user', JSON.stringify(res.data));
        setSignupStatus('Account created successfully! Redirecting to dashboard...');
        setSignupData({ username: '', email: '', password: '' });
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
          setSignupStatus('Error: ' + err.response.data.error);
        } else {
          setSignupStatus('An error occurred. Please try again.');
        }
      } finally {
        setSignupLoading(false);
      }
    }
  };

  const inputClass = (error?: string) =>
    `rounded-full border px-4 py-3 focus:outline-none focus:ring-2 w-full ${
      error
        ? 'border-red-500 focus:ring-red-400'
        : 'focus:ring-orange-400'
    }`;

  const strength = getStrength(signupData.password);

  return (
    <div className="auth-flip-bg min-h-screen flex items-center justify-center">
      <div className={`auth-flip-container ${isLogin ? '' : 'flipped'}`}>

        {/* ── Front: Login ── */}
        <div className="auth-flip-side auth-flip-front">
          <div className="flex w-full h-full rounded-3xl overflow-hidden shadow-2xl">

            {/* Left: Form */}
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white rounded-l-3xl md:rounded-r-none shadow-lg z-10">
              <div className="w-full max-w-md p-8">
                <span className="text-6xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent block mb-6">Circle</span>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Sign In</h2>

                <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit} noValidate>
                  {/* Identifier */}
                  <div>
                    <input
                      type="text"
                      placeholder="Email or Username"
                      className={inputClass(loginErrors.identifier)}
                      value={loginData.identifier}
                      onChange={e => setLoginData({ ...loginData, identifier: e.target.value })}
                    />
                    {loginErrors.identifier && (
                      <p className="text-red-500 text-xs mt-1 ml-3">{loginErrors.identifier}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      className={inputClass(loginErrors.password)}
                      value={loginData.password}
                      onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    {loginErrors.password && (
                      <p className="text-red-500 text-xs mt-1 ml-3">{loginErrors.password}</p>
                    )}
                  </div>

                  <a href="#" className="text-xs text-orange-500 hover:underline self-end">
                    Forgot password?
                  </a>

                  <button
                    type="submit"
                    className="mt-2 bg-gradient-to-r from-orange-400 to-red-500 text-white py-3 rounded-full font-semibold text-lg shadow hover:from-orange-500 hover:to-red-600 transition disabled:opacity-60"
                    disabled={loginLoading}
                  >
                    {loginLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                  {loginStatus && (
                    <div className={`mt-2 text-center text-sm ${loginStatus.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{loginStatus}</div>
                  )}
                </form>

                <div className="mt-8 text-xs text-gray-400 text-center">© 2026 circle.co.india</div>
                <div className="mt-6 text-center">
                  <span className="text-gray-500">Don't have an account? </span>
                  <button
                    className="text-orange-500 hover:underline font-semibold"
                    onClick={() => setIsLogin(false)}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Branding */}
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-r-3xl relative overflow-hidden">
              <div className="z-10 text-white text-left px-12">
                <h1 className="text-5xl font-bold mb-4">Welcome back to Circle..!!</h1>
                <p className="mb-8 text-lg opacity-80">
                  Connections with the students of same mind made easy.
                </p>
                <div className="flex justify-center">
                  <div className="w-60 h-96 bg-neutral-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-neutral-400">[App Image]</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-8 text-neutral-500 text-xs">Contact Us</div>
            </div>
          </div>
        </div>

        {/* ── Back: Signup ── */}
        <div className="auth-flip-side auth-flip-back">
          <div className="flex w-full h-full rounded-3xl overflow-hidden shadow-2xl flex-row-reverse">

            {/* Right: Branding (flipped) */}
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-l-3xl relative overflow-hidden order-2">
              <div className="z-10 text-white text-left px-12">
                <h1 className="text-5xl font-bold mb-4">Welcome to Circle..!!</h1>
                <p className="mb-8 text-lg opacity-80">
                  Create your account on <b>Circle</b> to connect with other's having same mindset, interest and ambitions
                </p>
                <div className="flex justify-center">
                  <div className="w-60 h-96 bg-neutral-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-neutral-400">[App Image]</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-8 text-neutral-500 text-xs">Contact Us</div>
            </div>

            {/* Left: Signup Form */}
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white rounded-r-3xl md:rounded-l-none shadow-lg z-10 order-1">
              <div className="w-full max-w-md p-8">
                <span className="text-6xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent block mb-6">Circle</span>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Sign Up</h2>

                <form className="flex flex-col gap-4" onSubmit={handleSignupSubmit} noValidate>
                  {/* Username */}
                  <div>
                    <input
                      type="text"
                      placeholder="Username"
                      className={inputClass(signupErrors.username)}
                      value={signupData.username}
                      onChange={e => setSignupData({ ...signupData, username: e.target.value })}
                    />
                    {signupErrors.username && (
                      <p className="text-red-500 text-xs mt-1 ml-3">{signupErrors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      className={inputClass(signupErrors.email)}
                      value={signupData.email}
                      onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                    />
                    {signupErrors.email && (
                      <p className="text-red-500 text-xs mt-1 ml-3">{signupErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      className={inputClass(signupErrors.password)}
                      value={signupData.password}
                      onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                    />
                    {signupErrors.password && (
                      <p className="text-red-500 text-xs mt-1 ml-3">{signupErrors.password}</p>
                    )}

                    {/* Strength meter */}
                    {signupData.password && (
                      <div className="mt-2 ml-3">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i <= strength ? strengthColor[strength] : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">{strengthLabel[strength]}</p>
                        {/* Checklist */}
                        <ul className="mt-1 text-xs space-y-0.5">
                          {[
                            [/.{8,}/, 'At least 8 characters'],
                            [/[A-Z]/, 'One uppercase letter'],
                            [/[a-z]/, 'One lowercase letter'],
                            [/[0-9]/, 'One number'],
                            [/[^A-Za-z0-9]/, 'One special character'],
                          ].map(([regex, label]) => (
                            <li
                              key={label as string}
                              className={`flex items-center gap-1 ${
                                (regex as RegExp).test(signupData.password)
                                  ? 'text-green-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              <span>{(regex as RegExp).test(signupData.password) ? '✓' : '○'}</span>
                              {label as string}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="mt-2 bg-gradient-to-r from-orange-400 to-red-500 text-white py-3 rounded-full font-semibold text-lg shadow hover:from-orange-500 hover:to-red-600 transition disabled:opacity-60"
                    disabled={signupLoading}
                  >
                    {signupLoading ? 'Signing Up...' : 'Sign Up'}
                  </button>
                  {signupStatus && (
                    <div className={`mt-2 text-center text-sm ${signupStatus.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{signupStatus}</div>
                  )}
                </form>

                <div className="mt-8 text-xs text-gray-400 text-center">© 2026 circle.co.india</div>
                <div className="mt-6 text-center">
                  <span className="text-gray-500">Already have an account? </span>
                  <button
                    className="text-orange-500 hover:underline font-semibold"
                    onClick={() => setIsLogin(true)}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;