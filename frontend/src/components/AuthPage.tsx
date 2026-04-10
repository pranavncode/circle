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
const strengthColor = ['', '#dc2626', '#ea580c', '#d97706', '#2563eb', '#16a34a'];

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

  const strength = getStrength(signupData.password);

  return (
    <div className="auth-flip-bg">
      <div className={`auth-flip-container ${isLogin ? '' : 'flipped'}`}>

        {/* ── Front: Login ── */}
        <div className="auth-flip-side auth-flip-front">
          <div style={{ display: 'flex', width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}>

            {/* Left: Form */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '50%', background: '#fff', padding: '48px' }}>
              <div style={{ width: '100%', maxWidth: '360px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#1c1917', letterSpacing: '-0.04em', display: 'block', marginBottom: '8px' }}>Circle</span>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1c1917', marginBottom: '4px', letterSpacing: '-0.02em' }}>Welcome back</h2>
                <p style={{ fontSize: '14px', color: '#78716c', marginBottom: '32px' }}>Sign in to continue to your account</p>

                <form onSubmit={handleLoginSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Email or Username</label>
                    <input
                      type="text"
                      placeholder="you@example.com"
                      className={`auth-input ${loginErrors.identifier ? 'error' : ''}`}
                      value={loginData.identifier}
                      onChange={e => setLoginData({ ...loginData, identifier: e.target.value })}
                    />
                    {loginErrors.identifier && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{loginErrors.identifier}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Password</label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      className={`auth-input ${loginErrors.password ? 'error' : ''}`}
                      value={loginData.password}
                      onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    {loginErrors.password && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{loginErrors.password}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <a href="#" style={{ fontSize: '13px', color: '#e85d04', textDecoration: 'none', fontWeight: 500 }}>
                      Forgot password?
                    </a>
                  </div>

                  <button type="submit" className="auth-btn-primary" disabled={loginLoading}>
                    {loginLoading ? 'Signing in...' : 'Sign in'}
                  </button>

                  {loginStatus && (
                    <div style={{ textAlign: 'center', fontSize: '13px', color: loginStatus.startsWith('Error') ? '#dc2626' : '#16a34a' }}>
                      {loginStatus}
                    </div>
                  )}
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#78716c' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    style={{ color: '#e85d04', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                  >
                    Sign up
                  </button>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: '#a8a29e' }}>© 2026 circle.co.india</div>
              </div>
            </div>

            {/* Right: Branding */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '50%', background: '#1c1917', position: 'relative', overflow: 'hidden' }}>
              {/* Subtle decorative circles */}
              <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />

              <div style={{ position: 'relative', zIndex: 1, padding: '48px', maxWidth: '400px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e85d04', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>Welcome back</span>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '16px' }}>
                  Your circle<br />awaits you.
                </h1>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                  Connect with students who share your mindset, interests and ambitions.
                </p>

                <div className="auth-float" style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px solid rgba(232,93,4,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(232,93,4,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e85d04' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ position: 'absolute', bottom: '24px', right: '32px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Contact Us</div>
            </div>
          </div>
        </div>

        {/* ── Back: Signup ── */}
        <div className="auth-flip-side auth-flip-back">
          <div style={{ display: 'flex', width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', flexDirection: 'row-reverse' }}>

            {/* Right: Branding (flipped) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '50%', background: '#1c1917', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />

              <div style={{ position: 'relative', zIndex: 1, padding: '48px', maxWidth: '400px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e85d04', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>Get started</span>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '16px' }}>
                  Build your<br />circle today.
                </h1>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                  Create your account to connect with others who share your mindset and ambitions.
                </p>

                <div className="auth-float" style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px solid rgba(232,93,4,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(232,93,4,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e85d04' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ position: 'absolute', bottom: '24px', left: '32px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Contact Us</div>
            </div>

            {/* Left: Signup Form */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '50%', background: '#fff', padding: '48px' }}>
              <div style={{ width: '100%', maxWidth: '360px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#1c1917', letterSpacing: '-0.04em', display: 'block', marginBottom: '8px' }}>Circle</span>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1c1917', marginBottom: '4px', letterSpacing: '-0.02em' }}>Create account</h2>
                <p style={{ fontSize: '14px', color: '#78716c', marginBottom: '32px' }}>Start building your professional circle</p>

                <form onSubmit={handleSignupSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Username</label>
                    <input
                      type="text"
                      placeholder="Choose a username"
                      className={`auth-input ${signupErrors.username ? 'error' : ''}`}
                      value={signupData.username}
                      onChange={e => setSignupData({ ...signupData, username: e.target.value })}
                    />
                    {signupErrors.username && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{signupErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={`auth-input ${signupErrors.email ? 'error' : ''}`}
                      value={signupData.email}
                      onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                    />
                    {signupErrors.email && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{signupErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Password</label>
                    <input
                      type="password"
                      placeholder="Create a strong password"
                      className={`auth-input ${signupErrors.password ? 'error' : ''}`}
                      value={signupData.password}
                      onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                    />
                    {signupErrors.password && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{signupErrors.password}</p>
                    )}

                    {/* Strength meter */}
                    {signupData.password && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              style={{
                                height: '3px',
                                flex: 1,
                                borderRadius: '2px',
                                background: i <= strength ? strengthColor[strength] : '#e7e5e4',
                                transition: 'background 0.3s ease',
                              }}
                            />
                          ))}
                        </div>
                        <p style={{ fontSize: '11px', color: '#a8a29e', marginBottom: '6px' }}>{strengthLabel[strength]}</p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {[
                            [/.{8,}/, 'At least 8 characters'],
                            [/[A-Z]/, 'One uppercase letter'],
                            [/[a-z]/, 'One lowercase letter'],
                            [/[0-9]/, 'One number'],
                            [/[^A-Za-z0-9]/, 'One special character'],
                          ].map(([regex, label]) => (
                            <li
                              key={label as string}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '11px',
                                color: (regex as RegExp).test(signupData.password) ? '#16a34a' : '#a8a29e',
                                transition: 'color 0.2s ease',
                              }}
                            >
                              <span>{(regex as RegExp).test(signupData.password) ? '✓' : '○'}</span>
                              {label as string}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="auth-btn-primary" disabled={signupLoading}>
                    {signupLoading ? 'Creating account...' : 'Create account'}
                  </button>

                  {signupStatus && (
                    <div style={{ textAlign: 'center', fontSize: '13px', color: signupStatus.startsWith('Error') ? '#dc2626' : '#16a34a' }}>
                      {signupStatus}
                    </div>
                  )}
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#78716c' }}>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    style={{ color: '#e85d04', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                  >
                    Sign in
                  </button>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: '#a8a29e' }}>© 2026 circle.co.india</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;