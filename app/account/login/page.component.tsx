"use client"
import React from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Text, Anchor, Group,Box,Title } from '@mantine/core';
import { Eye, EyeOff, Mail, Lock, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import { COLOUR } from '@/CONSTANTS/color';
import { login } from '@/api/registration';
import { useAppContext } from '@/providers/AppContext';

interface LoginFormValues {
  email: string;
  password: string;
}

const KeymanLogin: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const {loginUser}=useAppContext();
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 5 ? 'Password is required' : null),
    },
  });

  const handleSubmit = async(values: LoginFormValues) => {
    
    setLoading(true);
    const response=await login(values.email, values.password);
    if(response.status){
      loginUser(response.user,response.token);
      notifications.show({
      title: 'Login Successful',    
        message: `Welcome back, ${response?.user?.name ?? ""}!`,
        color: 'green',
        withBorder: true,
        style: { borderRadius: '8px' ,background:COLOUR.secondary, color: 'white',},
        icon: <Check size={16} />,
        autoClose: 3000,
        
    })
    form.reset();
      setTimeout(() => {
        window.location.href = '/keyman/dashboard'; // Redirect to dashboard or home page
    }, 3000); 
    }else{
       // Handle login failure, e.g., show error message
        notifications.show({
          title: 'Login Failed',
          message:  'Invalid email or password',
          color: 'red',
          withBorder: true,
          style: { borderRadius: '8px', background: COLOUR.secondary, color: 'white' },
          icon: <Check size={16} />,
          autoClose: 3000,
        });
    }
    setLoading(false)
      
    
   
  };

  return (
    <div className="min-h-screen -m-2 bg-gray-50 flex flex-col md:flex-row items-stretch justify-center  ">
       <section className='min-h-[360px] md:min-h-screen   text-white flex flex-col items-center justify-start  bg-keyman-orange   shadow-lg p-8 md:p-16    w-full md:w-1/2 max-w-full '>
             
             <Box className='py-8 md:py-12 px-6 md:px-12  text-center flex flex-col items-center justify-center'>
              <Title order={1} fw={700}> Welcome to the  <span className='  text-transparent bg-clip-text bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50]'>KeyMan App!</span></Title>
             </Box>
              <Title fw={500} order={2} mb="md" c="white">Buy Smart, Build Smart</Title>
              <Text>Your platform for trusted construction products and pros.</Text>
      
            </section>
      <div className=" w-full md:w-1/2  p-8 md:p-16  max-w-full">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24rounded-full mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
             <div>
                <Image src="/keyman_logo.png" alt="" width={100} height={100}/>
             </div>
            </div>
          </div>
         
          
          <Title order={1}   className="mb-4 text-gray-900">
            Sign into Your Account
          </Title>
          <Group gap={4} justify="center">
            <Text size="sm" c="dimmed">
                {" Don't have an account?"}
             
            </Text>
            <Link href="/account/sign-up"   className="text-keyman-green font-medium hover:text-keyman-green-hover transition-colors duration-200">
              CREATE ACCOUNT
            </Link>
          </Group>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <TextInput
            placeholder="Email"
            leftSection={<Mail size={16} />}
            size="md"
            {...form.getInputProps('email')}
            className="w-full"
          />

          <div className="space-y-2">
            <PasswordInput
              placeholder="Password"
              leftSection={<Lock size={16} />}
              size="md"
              visibilityToggleIcon={({ reveal }) =>
                reveal ? <EyeOff size={16} /> : <Eye size={16} />
              }
              {...form.getInputProps('password')}
              className="w-full"
            />
            
            <div className="text-right">
              <Link href="/account/forgot-password"  className="text-keyman-green hover:text-keyman-green-hover transition-colors duration-200"
               >
                <Text size="xs" c="dimmed">
                Forgot Password?
                </Text>
              </Link>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => form.onSubmit(handleSubmit)()}
              fullWidth
              size="md"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
              disabled={!form.isValid() || !form.values.email || !form.values.password || loading}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <Text size="xs" c="dimmed">
              OR
            </Text>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
          <Text size="xs" c="dimmed" ta="center" className="leading-relaxed">
            By signing in, you agree to our{' '}
            <Anchor size="xs" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Anchor>{' '}
            and{' '}
            <Anchor size="xs" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Anchor>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default KeymanLogin;
