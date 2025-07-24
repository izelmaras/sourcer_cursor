import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';

const CORRECT_PASSWORD = '1234';

// Auth context for in-memory authentication
const AuthContext = createContext<{ isAuthenticated: boolean; authenticate: (pw: string) => boolean }>({
  isAuthenticated: false,
  authenticate: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const authenticate = (pw: string) => {
    if (pw === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate }}>
      {children}
    </AuthContext.Provider>
  );
};

export const PasswordProtect = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { authenticate } = useAuth();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticate(password)) {
      navigate('/');
    } else {
      setError(true);
      setPassword('');
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-white">
        <div className="absolute inset-0 backdrop-blur-xl bg-white/50" />
      </div>
      <div className="relative flex items-center justify-center min-h-screen px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-xs">
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
                    if (i < 3 && inputRefs.current[i + 1] != null) {
                      inputRefs.current[i + 1]?.focus();
                    }
                    if (newPassword.length === 4) {
                      if (authenticate(newPassword)) {
                        navigate('/');
                      } else {
                        setError(true);
                        setPassword('');
                        if (inputRefs.current[0]) {
                          inputRefs.current[0].focus();
                        }
                      }
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !password[i]) {
                    if (i > 0 && inputRefs.current[i - 1] != null) {
                      inputRefs.current[i - 1]?.focus();
                    }
                  }
                }}
                className={`w-14 h-14 text-center text-2xl bg-white border-2 ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-gray-900 focus:ring-0`}
              />
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};