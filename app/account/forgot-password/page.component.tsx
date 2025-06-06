"use client"
import React, { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Button, Text, Anchor, Alert } from '@mantine/core';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ForgotPasswordFormValues {
  email: string;
}

const KeymanForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router=useRouter()
  
  const form = useForm<ForgotPasswordFormValues>({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email address'),
    },
  });

  const handleSubmit = (values: ForgotPasswordFormValues) => {
    console.log('Password reset requested for:', values.email);
    // Handle password reset submission here
    setIsSubmitted(true);
  };

  const handleBackToLogin = () => {
    // Handle navigation back to login
    console.log('Navigate back to login');
    router.push('/account/login');
    setIsSubmitted(false);

  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <Text size="xl" fw={600} className="text-gray-900 mb-4">
              Check your email
            </Text>
            <Text size="sm" c="dimmed" className="mb-6 leading-relaxed">
              We've sent a password reset link to{' '}
              <Text component="span" fw={500} c="dark">
                {form.values.email}
              </Text>
            </Text>
            <Text size="xs" c="dimmed" className="mb-8">
              Didn't receive the email? Check your spam folder or try again.
            </Text>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => setIsSubmitted(false)}
              fullWidth
              size="md"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Try again
            </Button>
            
            <Button
              onClick={handleBackToLogin}
              fullWidth
              size="md"
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
            Forgot password?
          </Text>
          <Text size="sm" c="dimmed" className="mb-6 leading-relaxed">
            Please enter the email address associated with your account to reset your password.
          </Text>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <TextInput
            placeholder="Email"
            leftSection={<Mail size={16} />}
            size="md"
            {...form.getInputProps('email')}
            className="w-full"
          />

          <Button
            onClick={() => form.onSubmit(handleSubmit)()}
            fullWidth
            size="md"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
            disabled={!form.isValid() || !form.values.email}
          >
            Send Pin
          </Button>
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

        {/* Footer */}
        <div className="mt-8">
          <Text size="xs" c="dimmed" ta="center" className="leading-relaxed">
            Need help?{' '}
            <Anchor size="xs" className="text-blue-600 hover:text-blue-700">
              Contact Support
            </Anchor>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default KeymanForgotPassword;