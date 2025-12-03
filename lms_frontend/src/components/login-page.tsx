import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/components/src-contexts-user-context';
import { API_BASE_URL } from '@/config/api';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as z from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login } = useUser();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    try {
      if (activeTab === 'login') {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ name, email, password });
      }
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((error) => {
          const field = error.path[0] as keyof FieldErrors;
          errors[field] = error.message;
        });
      }
      setFieldErrors(errors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const url = activeTab === 'login'
      ? `${API_BASE_URL}/api/auth/sign-in/`
      : `${API_BASE_URL}/api/auth/sign-up/`;

    const body = activeTab === 'login'
      ? { email, password }
      : { name, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`${activeTab === 'login' ? 'Login' : 'Signup'} failed`);
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      login(data.user);

      navigate(data.user.is_staff ? '/catalogue' : '/customer-home');
    } catch (err) {
      setError(`Invalid ${activeTab === 'login' ? 'email or password' : 'signup information'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearErrors = () => {
    setFieldErrors({});
    setError('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome to Rooster Library</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value as 'login' | 'signup'); clearErrors(); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })); }}
                    className={fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })); }}
                    className={fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-sm">{fieldErrors.password}</p>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFieldErrors(prev => ({ ...prev, name: undefined })); }}
                    className={fieldErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {fieldErrors.name && (
                    <p className="text-red-500 text-sm">{fieldErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })); }}
                    className={fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })); }}
                    className={fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-sm">{fieldErrors.password}</p>
                  )}
                  <p className="text-gray-500 text-xs">Must be at least 8 characters</p>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
