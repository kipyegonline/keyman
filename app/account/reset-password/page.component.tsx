"use client"
import React, { useState } from 'react';
import { useForm } from '@mantine/form';
import { PasswordInput, Button, Text, Checkbox,  TextInput } from '@mantine/core';
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResetPasswordFormValues {
  resetKey: string;
  password: string;
  confirmPassword: string;
}

const KeymanResetPassword: React.FC = () => {
  const [isReset, setIsReset] = useState(false);
  const router=useRouter()
  const form = useForm<ResetPasswordFormValues>({
    initialValues: {
      resetKey: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      resetKey: (value) => (value.length < 4 ? 'Please enter the reset key from your email' : null),
      password: (value) => {
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special character';
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords did not match' : null,
    },
  });

  const handleSubmit = (values: ResetPasswordFormValues) => {
    console.log('Password reset:', values);
    // Handle password reset submission here
    setIsReset(true);
  };

  const handleBackToLogin = () => {
    // Handle navigation back to login
    console.log('Navigate back to login');
    router.push('/account/login');
    setIsReset(false);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.values.password);

  if (isReset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Success State */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <Text size="xl" fw={600} className="text-gray-900 mb-4">
              Password Reset Successfully!
            </Text>
            <Text size="sm" c="dimmed" className="mb-8 leading-relaxed">
              Your password has been updated. You can now sign in with your new password.
            </Text>
          </div>

          <Button
            onClick={handleBackToLogin}
            fullWidth
            size="md"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
          >
            Continue to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center relative">
              {/* Key icon representation */}
              <div className="w-6 h-6 relative">
                <div className="absolute top-1 left-1 w-3 h-3 border-2 border-white rounded-full"></div>
                <div className="absolute top-2.5 left-4 w-2 h-0.5 bg-white"></div>
                <div className="absolute top-3.5 left-4 w-1.5 h-0.5 bg-white"></div>
              </div>
            </div>
          </div>
          <Text size="xl" fw={600} className="text-gray-900 mb-4">
            Reset Your Password
          </Text>
          <Text size="sm" c="dimmed" className="mb-6 leading-relaxed">
            Enter the reset key from your email and create a new password for your account.
          </Text>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <TextInput
            placeholder="Reset Key"
            leftSection={<Key size={16} />}
            size="md"
            {...form.getInputProps('resetKey')}
            description="Enter the 6-digit code sent to your email"
          />

          <div className="space-y-2">
            <PasswordInput
              placeholder="New Password"
              leftSection={<Lock size={16} />}
              size="md"
              visibilityToggleIcon={({ reveal }) =>
                reveal ? <EyeOff size={16} /> : <Eye size={16} />
              }
              {...form.getInputProps('password')}
            />
            
            {/* Password Strength Indicators */}
            {form.values.password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full ${
                        passwordStrength >= level
                          ? passwordStrength <= 2
                            ? 'bg-red-400'
                            : passwordStrength <= 3
                            ? 'bg-yellow-400'
                            : 'bg-green-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      size="xs"
                      checked={form.values.password.length >= 8}
                      readOnly
                      color="green"
                    />
                    <Text size="xs" c={form.values.password.length >= 8 ? 'green' : 'dimmed'}>
                      At least 8 characters
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      size="xs"
                      checked={/[0-9]/.test(form.values.password)}
                      readOnly
                      color="green"
                    />
                    <Text size="xs" c={/[0-9]/.test(form.values.password) ? 'green' : 'dimmed'}>
                      At least one number
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      size="xs"
                      checked={/[A-Z]/.test(form.values.password)}
                      readOnly
                      color="green"
                    />
                    <Text size="xs" c={/[A-Z]/.test(form.values.password) ? 'green' : 'dimmed'}>
                      Uppercase letters
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      size="xs"
                      checked={/[^A-Za-z0-9]/.test(form.values.password)}
                      readOnly
                      color="green"
                    />
                    <Text size="xs" c={/[^A-Za-z0-9]/.test(form.values.password) ? 'green' : 'dimmed'}>
                      One special character
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </div>

          <PasswordInput
            placeholder="Confirm New Password"
            leftSection={<Lock size={16} />}
            size="md"
            visibilityToggleIcon={({ reveal }) =>
              reveal ? <EyeOff size={16} /> : <Eye size={16} />
            }
            {...form.getInputProps('confirmPassword')}
          />

          <div className="pt-4">
            <Button
              onClick={() => form.onSubmit(handleSubmit)()}
              fullWidth
              size="md"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
              disabled={!form.isValid() || !form.values.password || !form.values.confirmPassword}
            >
              Reset Password
            </Button>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleBackToLogin}
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            className="text-gray-600 hover:bg-gray-100"
          >
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KeymanResetPassword;