"use client"
import React, { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Button, Text, Anchor, Image } from '@mantine/core';
import { Mail, ArrowLeft } from 'lucide-react';
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
const  share=`We've sent a password reset link to`;
const didntReceive=`Didn't receive the email? Check your spam folder or try again.`
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <Image src="/keyman_logo.png" alt="" className='w-20 h-20'/>
            </div>
            <Text size="xl" fw={600} className="text-gray-900 mb-4">
              Check your email
            </Text>
            <Text size="sm" c="dimmed" className="mb-6 leading-relaxed">
              {share}
              <Text component="span" fw={500} c="dark">
                {form.values.email}
              </Text>
            </Text>
            <Text size="xs" c="dimmed" className="mb-8">
              {didntReceive}
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6">
            <div className=" rounded-full flex items-center justify-center relative">
             <Image src="/keyman_logo.png" alt="" className='w-20 h-20'/>
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