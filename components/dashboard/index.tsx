"use client"
import React, { useState } from 'react';
import {
  AppShell,
 
 
} from '@mantine/core';
import Sidebar from './sideNav';
import Navigation from './TopNav';









// Main Dashboard Component
const Dashboard: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, ] = useState(false);
  

  return (
    <AppShell
      padding={0}
      className=''
    
      header={
       { height:70}
       
      }
      styles={(theme) => ({
        main: {
          backgroundColor: isDark ? theme.colors.dark[8] : theme.colors.gray[0],
          minHeight: '100vh',
        },
      })}
     /* navbar={{
        width: 280,
        breakpoint: 'sm',collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }}}*/
    >
      <AppShell.Header  h={70} p="md" className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 '}>
        <Navigation   />
        
       
        
      </AppShell.Header>
      <AppShell.Navbar
      
        w={{ base: isCollapsed ? 70 : 280 }}
       // style={{border:"1px solid cyan"}}
       // p="sm"
       mt="md"
        className={`transition-all duration-300 ease-in-out border-r-2  ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
      >
       <Sidebar 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)}
         
        />   
        
        
        
        </AppShell.Navbar>
      <AppShell.Main px="md" style={{paddingTop:100,}} className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
        {children}
     
      </AppShell.Main>
    </AppShell>
  );
};

export default Dashboard;