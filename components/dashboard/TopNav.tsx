"use client"
import React from 'react';
import {Wrench, Edit, DollarSign, MapPin, Share, LogOut, } from 'lucide-react';
import {

  Group,
  Title,
  ActionIcon,
  Avatar,
  Menu,
  UnstyledButton,
  Indicator,Flex,
  Box,
  Image
} from '@mantine/core';
import { Bell, ChevronDown, Sun, Moon,  } from 'lucide-react';
import { useAppContext } from '@/providers/AppContext';
import { navigateTo } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import { logOutKeymanUser } from '@/api/registration';
import Link from 'next/link';

// Navigation Component
const TopNavigation: React.FC = () => {
    const {toggleDarkMode,darkMode:isDark,user,logOutUser}=useAppContext();
    const router=useRouter()
  const profileMenuItems = [
    { label: 'Edit Profile', icon: Edit,key:"profile" },
    { label: 'Hardware/Service Profile', icon: Wrench,key:"hardware" },
    { label: 'Price List', icon: DollarSign ,key:"price"},
    { label: 'Delivery Locations', icon: MapPin ,key:"delivery"},
    { label: 'Share', icon: Share,key:"share" },
    { label: 'Logout', icon: LogOut,key:"logout" },
  ];
  const handleLogout=()=>{
    
    
    logOutUser()
        // Implement logout logic here
        console.log("Logout clicked");
        
        navigateTo()
        // For example, you might clear user data and redirect to login page
        //window.location.href = '/account/login';
        router.push('/account/login');
        logOutKeymanUser()
       
  }
const handleClickedItem=(key:string)=>{ 
    //create a switch statement for each key item from array
    switch (key) {
        case "profile":
            console.log("profile clicked");
            break;

                case "hardware":
            console.log("hardware clicked");
            break;

                case "price":
            console.log("price clicked");
            break;

                case "delivery":
            console.log("delivery clicked");
            break;

                        case "share":
            console.log("share clicked");
            break;

                case "logout":
            handleLogout()
            break;
        default:
            console.log("default clicked");
            break;}
}
  return (
    <nav   style={{height:70,padding:12,}}className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200' }>
      <Flex style={{ height: '100%' }}  justify={"space-between"} align="center">
        <Group display={{ base: 'none', lg: 'flex' }}>
            <Box>
                <Link href="/keyman/dashboard"><Image src="/keyman_logo.png" alt="logo" h={40} w={40}/></Link>
                
            </Box>
            
            
               <Title order={2} c={isDark ? 'white' : 'dark'}>
          Keyman 
        </Title>
        </Group>
       

        <Group >
          {/* Dark Mode Toggle */}
          <ActionIcon
            variant="subtle"
            onClick={toggleDarkMode}
            size="lg"
            className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </ActionIcon>

          {/* Notifications */}
          <Indicator inline label="3" size={16}>
            <ActionIcon
              variant="subtle"
              size="lg"
              className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
            >
              <Bell size={20} />
            </ActionIcon>
          </Indicator>

          {/* Profile Menu */}
          <Menu shadow="md" width={220} transitionProps={{ transition: 'pop', duration: 150 }}>
            <Menu.Target>
              <UnstyledButton className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Avatar
                  size="sm"
                  src={user?.profile_photo_url}
                  className="bg-gradient-to-br from-[#F08C23] to-[#3D6B2C] font-bold"
               />
                 
                <ChevronDown size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              {profileMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Menu.Item
                  onClick={() => handleClickedItem(item.key)}
                    key={index}
                    leftSection={<Icon size={16} />}
                    color={item.label === 'Logout' ? 'red' : undefined}
                  >
                    {item.label}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>
    </nav>
  );
};
export default TopNavigation