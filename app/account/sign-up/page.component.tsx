"use client"
import React from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Text, Anchor, Checkbox,  Group,Box } from '@mantine/core';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}


const KeymanSignupComponent: React.FC = () => {
 
  const form = useForm<SignupFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      firstName: (value) => (value.length < 2 ? 'First name must have at least 2 letters' : null),
      lastName: (value) => (value.length < 2 ? 'Last name must have at least 2 letters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      phoneNumber: (value) => (value.length < 10 ? 'Phone number must be at least 10 digits' : null),
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

  const handleSubmit = (values: SignupFormValues) => {
    console.log('Form submitted:', values);
    // Handle form submission here
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-24 h-24 0 rounded-full mb-4">
            <div className="  rounded-full flex items-center justify-center">
              <Image src="/keyman_logo.png" alt="Keyman Logo" width={100} height={100} className="rounded-full" />
            </div>
          </div>
          <Text size="xl" fw={600} className="text-gray-900 mb-2">
            Create Your  Account
          </Text>
          <Group gap={4} justify="center">
            <Text size="sm" c="dimmed">
              Already have an account?
            </Text>
            <Link href="/account/login"  className=" text-keyman-green font-semibold  hover:keyman-green-hover transition-colors duration-200">
              SIGN IN
            </Link>
          </Group>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Group grow>
            <TextInput
              placeholder="First Name"
              leftSection={<User size={16} />}
              {...form.getInputProps('firstName')}
              className="w-full"
             // size='md'
            />
            <TextInput
              placeholder="Last Name"
              leftSection={<User size={16} />}
              {...form.getInputProps('lastName')}
              className="w-full"
            />
          </Group>

          <TextInput
            placeholder="Email Address"
            leftSection={<Mail size={16} />}
            {...form.getInputProps('email')}
          />

          <TextInput
            placeholder="Phone Number"
            leftSection={<Phone size={16} />}
            {...form.getInputProps('phoneNumber')}
          />

          <div className="space-y-2">
            <PasswordInput
              placeholder="Create Password"
              leftSection={<Lock size={16} />}
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
            placeholder="Confirm Password"
            leftSection={<Lock size={16} />}
            visibilityToggleIcon={({ reveal }) =>
              reveal ? <EyeOff size={16} /> : <Eye size={16} />
            }
            {...form.getInputProps('confirmPassword')}
          />
{form.values.password.length>6 && form.isDirty("confirmPassword") && form.values.confirmPassword !== form.values.password ? <Text color="red" size="xs" mb="sm">Passwords do not match</Text>:null}

          <Button
            onClick={() => form.onSubmit(handleSubmit)()}
            fullWidth
            size="md"
            className="bg-keyman-green hover:bg-keyman-accent-hover text-white font-medium py-3 rounded-lg transition-colors duration-200"
            disabled={!form.isValid() }
          >
            Create Account
          </Button>
        </div>
<Box mt="md" className="text-center">
     {/* Terms and Conditions */}
        <Text size="xs" c="dimmed" ta="center" className="mt-6 leading-relaxed">
          By creating an account, you agree to our{' '}
          <Anchor size="xs" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </Anchor>{' '}
          and{' '}
          <Anchor size="xs" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Anchor>
        </Text>
</Box>
       
      </div>
    </div>
  );
};

export default KeymanSignupComponent;