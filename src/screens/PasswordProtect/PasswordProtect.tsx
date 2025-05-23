import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';

const CORRECT_PASSWORD = '1234';

export const PasswordProtect = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      setError(true);
      setPassword('');
      // Focus first input on error
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute inset-0 backdrop-blur-xl bg-white/50" />
      </div>

      {/* Password input */}
      <div className="relative flex items-center justify-center min-h-screen px-4">
        <form 
          onSubmit={handleSubmit} 
          className="w-full max-w-xs"
        >
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={password[i] || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.match(/^[0-9]$/)) {
                    const newPassword = password.slice(0, i) + newValue + password.slice(i + 1);
                    setPassword(newPassword);
                    setError(false);
                    
                    // Move focus to next input
                    if (i < 3 && inputRefs.current[i + 1]) {
                      inputRefs.current[i + 1].focus();
                    }
                    
                    // Auto-submit when all digits are entered
                    if (newPassword.length === 4) {
                      if (newPassword === CORRECT_PASSWORD) {
                        localStorage.setItem('isAuthenticated', 'true');
                        navigate('/');
                      } else {
                        setError(true);
                        setPassword('');
                        // Focus first input on error
                        if (inputRefs.current[0]) {
                          inputRefs.current[0].focus();
                        }
                      }
                    }
                  }
                }}
                onKeyDown={(e) => {
                  // Handle backspace
                  if (e.key === 'Backspace' && !password[i]) {
                    if (i > 0 && inputRefs.current[i - 1]) {
                      inputRefs.current[i - 1].focus();
                    }
                  }
                }}
                className={`w-14 h-14 text-center text-2xl bg-white border-2 ${
                  error ? 'border-red-500' : 'border-gray-200'
                } rounded-xl focus:border-gray-900 focus:ring-0`}
              />
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};