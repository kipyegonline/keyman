"use client"
import React, { useState, useCallback } from 'react';
import { useForm } from '@mantine/form';
import {
  TextInput,
  Select,
  Button,
  Stepper,
  Group,
  Container,
  Paper,
  Title,
  Text,
  Checkbox,
  Textarea,
  FileInput,
  Tabs,Image, 
  Badge,
  Grid,
  Card,
  Transition,
  Notification,
  MultiSelect,
  Box
} from '@mantine/core';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Camera,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Music2,
  Truck,
  Wifi,
  CreditCard,
  Package,
  Shield,
  CheckCircle,
 
  Navigation,
  
} from 'lucide-react';
import { becomeSupplier } from '@/api/supplier';
import Link from 'next/link';

// Types and Interfaces
export interface SupplierInfo {
  name: string;
  phone: string;
  email: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  categories: string[];
  tiktok_link?: string;
  facebook_link?: string;
  youtube_link?: string;
  Instagram_link?: string;
  twitter_link?: string;
  offers_transport?: boolean;
  internet_access?: boolean;
  has_pos?: boolean;
  has_inventory?: boolean;
  is_escrow_only?: boolean;
  photo?:File|null;
  comments?: string;
  'categories[0]'?:string
'categories[1]'?:string
}

interface CategoryStructure {
  goods: {
    name: string;
    categories: { id: string; name: string }[];
  };
  professional_services: {
    name: string;
    categories: { id: string; name: string }[];
  };
  services: {
    name: string;
    categories: { id: string; name: string }[];
  };
}

// Location Component
const LocationSelector: React.FC<{
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  error?: string;
}> = ({ latitude, longitude, onLocationChange, error }) => {
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setLocationStatus('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        onLocationChange(lat, lng);
        setLocationStatus('Location captured successfully!');
        setLoading(false);
      },
      (error) => {
        setLocationStatus(`Error: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [onLocationChange]);

  return (
    <Card className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-green-50 to-orange-50">
      <Group className="mb-3">
        <MapPin className="text-[#3D6B2C]" size={20} />
        <Text size="sm" className="font-medium text-gray-700">Location Details</Text>
      </Group>
      
      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="Latitude"
            value={latitude || ''}
            readOnly
            placeholder="Auto-filled"
            className="mb-2"
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Longitude"
            value={longitude || ''}
            readOnly
            placeholder="Auto-filled"
          />
        </Grid.Col>
      </Grid>

      <Button
        onClick={getCurrentLocation}
        loading={loading}
        leftSection={<Navigation size={16} />}
        className="mt-3 bg-[#3D6B2C] hover:bg-[#2A4B1F] transition-all duration-300 transform hover:scale-105"
        fullWidth
      >
        {loading ? 'Getting Location...' : 'Use My Current Location'}
      </Button>

      {locationStatus && (
        <Transition mounted={!!locationStatus} transition="slide-up" duration={300} timingFunction="ease">
          {(styles) => (
            <Text size="xs" className={`mt-2 ${locationStatus.includes('Error') ? 'text-red-500' : 'text-green-600'}`} style={styles}>
              {locationStatus}
            </Text>
          )}
        </Transition>
      )}

      {error && (
        <Text size="xs" className="text-red-500 mt-1">
          {error}
        </Text>
      )}
    </Card>
  );
};

// Photo Upload Component
const PhotoUpload: React.FC<{
  value?: File|null;
  onChange: (file: File | null) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  return (
    <div className="space-y-3">
      <FileInput
        label="Business Photo"
        placeholder="Choose a photo of your business"
        accept="image/*"
        value={value}
        onChange={onChange}
        leftSection={<Camera size={16} className="text-[#3D6B2C]" />}
        className="transition-all duration-300 hover:scale-[1.02]"
        error={error}
      />
      {value && (
        <Transition mounted={!!value} transition="scale" duration={300}>
          {(styles) => (
            <Badge color="green" style={styles} className="mt-2">
              Photo selected: {value.name}
            </Badge>
          )}
        </Transition>
      )}
    </div>
  );
};

// Category Selector Component
const CategorySelector: React.FC<{
  supplierTypes:CategoryStructure;
  mainCategory: string;
  subCategory: string[];
  onMainCategoryChange: (category: string) => void;
  onSubCategoryChange: (category: string[]) => void;
  error?: string;
}> = ({supplierTypes, mainCategory, subCategory, onMainCategoryChange, onSubCategoryChange, error }) => {
 
 
const mainCategories= Object.keys(supplierTypes).map(value=>({value,label:value.replace("_"," ").toUpperCase()}))


  
  const getSubCategories = () => {
    if (!mainCategory || !(mainCategory in supplierTypes)) return [];
    return supplierTypes[mainCategory as keyof CategoryStructure].categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }));
  };

  return (
    <div className="space-y-4">
      <Select
        label="Main Category"
        placeholder="Select your business category"
        data={mainCategories}
        value={mainCategory}
        onChange={(value) => {
          onMainCategoryChange(value || '');
          onSubCategoryChange([]); // Reset subcategory when main category changes
        }}
        leftSection={<Building2 size={16} className="text-[#3D6B2C]" />}
        className="transition-all duration-300 hover:scale-[1.02]"
        error={error}
      />

      <Transition mounted={!!mainCategory} transition="slide-down" duration={300}>
        {(styles) => (
          <MultiSelect
            style={styles}
            multiple
            label="Subcategory"
            placeholder="Select specific category"
            data={getSubCategories()}
            value={subCategory}
            onChange={(value) =>{
              onSubCategoryChange(value)
              
              
            } }
            leftSection={<Package size={16} className="text-[#F08C23]" />}
            className="transition-all duration-300 hover:scale-[1.02]"
          />
        )}
      </Transition>
    </div>
  );
};

// Main Component
const SupplierRegistrationForm: React.FC<{supplierTypes:CategoryStructure}> = ({supplierTypes}) => {
  const [active, setActive] = useState(0);
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
const [loading,setLoading]=useState(false)
  const form = useForm<SupplierInfo>({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      type: '',
      address: '',
      latitude: 0,
      longitude: 0,
      categories: [],
      tiktok_link: '',
      facebook_link: '',
      youtube_link: '',
      Instagram_link: '',
      twitter_link: '',
      offers_transport: false,
      internet_access: false,
      has_pos: false,
      has_inventory: false,
      is_escrow_only: false,
      photo: null,
      comments: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      phone: (value) => (/^\+?[0-9]\d{1,14}$/.test(value) ? null : 'Invalid phone number'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      type: (value) => (value.length < 1 ? 'Supplier type is required' : null),
      address: (value) => (value.length < 5 ? 'Address must be at least 5 characters' : null),
      latitude: (value) => (value === 0 ? 'Please set your location' : null),
      longitude: (value) => (value === 0 ? 'Please set your location' : null),
      //categories: (value) => (value.length < 1 ? 'Please select a category'  : value.length>2? "Please select 2 categories":null),
    
    },
  });

 const validateCategories=()=>{
  let errors!:string
  if(subCategory.length<1){
    errors="Please select up to 2 categories"
  }else if(subCategory.length>2){
    errors="Please select 2 categories"
  }
  return errors
  
 }

  const nextStep = () => {
   
    const errors=validateCategories()
    if(errors){
      form.setErrors({categories:errors}  )
      return;
    }
    
    
    if (active === 0) {
      const validation = form.validate();
      if (!validation.hasErrors && mainCategory && subCategory) {
        //form.setFieldValue('categories', subCategory);
        setActive(1);
      }
    } else {
      setActive(active + 1);
    }
  };

  const prevStep = () => setActive(active - 1);
const handleSubCategory=(value:string[])=>{ 
  setSubCategory(value)
   form.setFieldValue('categories', value);
}
  const handleSubmit =async (values: SupplierInfo) => {
    if(!confirm("Are you sure you want to submit the form?"))return
    // Create FormData for backend submission
    const formData = new FormData();
    
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'photo' && value instanceof File) {
        formData.append(key, value);
      } else if (key === 'categories' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Here you would typically send formData to your backend
    console.log(values,'vals')
    console.log('Form Data:', Object.fromEntries(formData),);
    const payload={...values,'categories[0]':values?.categories?.[1],'categories[1]':values?.categories?.[2] ??""}
    setLoading(true)
    const response=await becomeSupplier(payload)
    console.log(response)
    setLoading(false) 
    setShowSuccess(true);
   // setTimeout(() => setShowSuccess(false), 5000);
  };
const categoriesError=(<>
{form.errors.categories && (
          <Text size="xs" className="!text-red-500 mt-1">
            {form.errors.categories}
          </Text>
        )}</>)
  return (
    <Container size="md" className="py-8">
      <Paper className="p-8 shadow-2xl rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100">
        <div className="text-center mb-8">
          <Title className="text-3xl font-bold text-[#3D6B2C] mb-2">
            Join Keyman Network
          </Title>
          <Text className="text-gray-600 text-lg">
            Register as a supplier and grow your construction business
          </Text>
        </div>

        <Stepper 
          active={active} 
          onStepClick={setActive}
          className="mb-8"
          color="#3D6B2C"
          completedIcon={<CheckCircle size={18} />}
        >
          <Stepper.Step 
            label="Basic Information" 
            description="Essential business details"
            icon={<User size={16} />}
          />
          <Stepper.Step 
            label="Additional Details" 
            description="Optional information"
            icon={<Building2 size={16} />}
          />
          <Stepper.Step 
            label="Complete" 
            description="Review and submit"
            icon={<CheckCircle size={16} />}
          />
        </Stepper>

        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
          {active === 0 && (
            <Transition mounted={active === 0} transition="slide-right" duration={300}>
              {(styles) => (
                <div style={styles} className="space-y-6">
                  <Grid>
                    <Grid.Col span={12}>
                      <TextInput
                        label="Business Name"
                        placeholder="Enter your business name"
                        leftSection={<Building2 size={16} className="text-[#3D6B2C]" />}
                        className="transition-all duration-300 hover:scale-[1.02]"
                        {...form.getInputProps('name')}
                        required
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <TextInput
                        label="Phone Number"
                        placeholder="+1234567890"
                        leftSection={<Phone size={16} className="text-[#3D6B2C]" />}
                        className="transition-all duration-300 hover:scale-[1.02]"
                        {...form.getInputProps('phone')}
                        required
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <TextInput
                        label="Email Address"
                        placeholder="business@example.com"
                        leftSection={<Mail size={16} className="text-[#3D6B2C]" />}
                        className="transition-all duration-300 hover:scale-[1.02]"
                        {...form.getInputProps('email')}
                        required
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                      {supplierTypes && <Select
                        label="Supplier Type"
                        placeholder="Select your business type"
                        data={Object.keys(supplierTypes).map(value=>({value,label:value.replace("_"," ").toUpperCase()}))}
                        value={form.values.type}
                        
                        leftSection={<Building2 size={16} className="text-[#3D6B2C]" />}
                        className="transition-all duration-300 hover:scale-[1.02]"
                        {...form.getInputProps('type')}
                        required
                      />}
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                      <TextInput
                        label="Business Address"
                        placeholder="Enter your full business address"
                        leftSection={<MapPin size={16} className="text-[#3D6B2C]" />}
                        className="transition-all duration-300 hover:scale-[1.02]"
                        {...form.getInputProps('address')}
                        required
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                      <LocationSelector
                        latitude={form.values.latitude}
                        longitude={form.values.longitude}
                        onLocationChange={(lat, lng) => {
                          form.setFieldValue('latitude', lat);
                          form.setFieldValue('longitude', lng);
                        }}
                        error={form.errors.latitude as string}
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                     {supplierTypes && <CategorySelector
                      supplierTypes={supplierTypes}
                        mainCategory={mainCategory}
                        subCategory={subCategory}
                        onMainCategoryChange={setMainCategory}
                        onSubCategoryChange={handleSubCategory}
                        error={!mainCategory && form.errors.categories ? 'Please select a category' : ''}
                      />}
                      {categoriesError}
                    </Grid.Col>
                  </Grid>
                </div>
              )}
            </Transition>
          )}

          {active === 1 && (
            <Transition mounted={active === 1} transition="slide-left" duration={300}>
              {(styles) => (
                <div style={styles} className="space-y-6">
                  <Tabs defaultValue="social" className="w-full">
                    <Tabs.List className="mb-6">
                      <Tabs.Tab value="social" leftSection={<Facebook size={16} />}>
                        Social Media
                      </Tabs.Tab>
                      <Tabs.Tab value="services" leftSection={<Package size={16} />}>
                        Services
                      </Tabs.Tab>
                      <Tabs.Tab value="media" leftSection={<Camera size={16} />}>
                        Media & Comments
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="social">
                      <Grid>
                        <Grid.Col span={6}>
                          <TextInput
                            label="Facebook"
                            placeholder="https://facebook.com/yourpage"
                            leftSection={<Facebook size={16} className="text-blue-600" />}
                            {...form.getInputProps('facebook_link')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <TextInput
                            label="Twitter"
                            placeholder="https://twitter.com/yourhandle"
                            leftSection={<Twitter size={16} className="text-blue-400" />}
                            {...form.getInputProps('twitter_link')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <TextInput
                            label="Instagram"
                            placeholder="https://instagram.com/yourprofile"
                            leftSection={<Instagram size={16} className="text-pink-500" />}
                            {...form.getInputProps('Instagram_link')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <TextInput
                            label="YouTube"
                            placeholder="https://youtube.com/yourchannel"
                            leftSection={<Youtube size={16} className="text-red-500" />}
                            {...form.getInputProps('youtube_link')}
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <TextInput
                            label="TikTok"
                            placeholder="https://tiktok.com/@yourhandle"
                            leftSection={<Music2 size={16} className="text-black" />}
                            {...form.getInputProps('tiktok_link')}
                          />
                        </Grid.Col>
                      </Grid>
                    </Tabs.Panel>

                    <Tabs.Panel value="services">
                      <div className="grid grid-cols-2 gap-4">
                        <Checkbox
                          label="Offers Transportation"
                          description="We provide delivery services"
                          icon={()=><Truck size={16} />}
                          color="#3D6B2C"
                          {...form.getInputProps('offers_transport', { type: 'checkbox' })}
                        />
                        <Checkbox
                          label="Internet Access"
                          description="Online ordering available"
                          icon={()=><Wifi size={16} />}
                          color="#3D6B2C"
                          {...form.getInputProps('internet_access', { type: 'checkbox' })}
                        />
                        <Checkbox
                          label="Has POS System"
                          description="Digital payment processing"
                          icon={()=><CreditCard size={16} />}
                          color="#3D6B2C"
                          {...form.getInputProps('has_pos', { type: 'checkbox' })}
                        />
                        <Checkbox
                          label="Has Inventory"
                          description="Manage stock levels"
                          icon={()=><Package size={16} />}
                          color="#3D6B2C"
                          {...form.getInputProps('has_inventory', { type: 'checkbox' })}
                        />
                        <Checkbox
                          label="Escrow Only"
                          description="Secure payment method only"
                          icon={()=><Shield size={16} />}
                          color="#3D6B2C"
                          {...form.getInputProps('is_escrow_only', { type: 'checkbox' })}
                          className="col-span-2"
                        />
                      </div>
                    </Tabs.Panel>

                    <Tabs.Panel value="media">
                      <div className="space-y-6">
                        <PhotoUpload
                          value={form.values.photo}
                          onChange={(file) =>file ? form.setFieldValue('photo', file):null}
                        />
                        <Textarea
                          label="Additional Comments"
                          placeholder="Tell us more about your business, specialties, or any other relevant information..."
                          leftSection={<MessageSquare size={16} className="text-[#3D6B2C]" />}
                          minRows={4}
                          className="transition-all duration-300 hover:scale-[1.02]"
                          {...form.getInputProps('comments')}
                        />
                      </div>
                    </Tabs.Panel>
                  </Tabs>
                </div>
              )}
            </Transition>
          )}

          {active === 2 && !showSuccess && (
            <Transition mounted={active === 2} transition="scale" duration={300}>
              {(styles) => (
                <div style={styles} className="text-center space-y-6">
                  <div className="flex flex-col items-center">
                    <div className='w-24 h-24 mb-2'><Image src="/keyman_logo.png" alt="" height={50} width={50} className="mx-auto" /></div>
                    
                  </div>
                  <CheckCircle size={64} className="text-[#388E3C] mx-auto hidden" />
                  <Title order={2} className="text-[#3D6B2C]">
                    Ready to Submit!
                  </Title>
                  <Text className="text-gray-600 text-lg">
                    Please review your information and submit your registration.
                  </Text>
                  
                  <Card className="p-6 bg-gradient-to-r from-green-50 to-orange-50 border border-gray-200">
                    <Text className="font-semibold text-[#3D6B2C] mb-2">Registration Summary:</Text>
                    <Text size="sm" className="text-gray-700">
                      Business: {form.values.name || 'Not specified'}<br />
                      Type: {form.values.type || 'Not specified'}<br />
                      Category: {mainCategory ? mainCategory.replace('_', ' ').toUpperCase() : 'Not selected'}<br />
                      Location: {form.values.address || 'Not specified'}
                    </Text>
                  </Card>
                </div>
              )}
            </Transition>
          )}

        {showSuccess ? null :  <Group justify="space-between" className="mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={active === 0}
              className="border-[#3D6B2C] text-[#3D6B2C] hover:bg-[#3D6B2C] hover:text-white transition-all duration-300"
            >
              Previous
            </Button>

            {active < 2  ? (
              <Button
                onClick={nextStep}
                className="bg-[#3D6B2C] hover:bg-[#2A4B1F] transition-all duration-300 transform hover:scale-105"
                disabled={active === 0 && (!mainCategory || !subCategory)}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-[#F08C23] hover:bg-[#D67A1E] transition-all duration-300 transform hover:scale-105"
                size="lg"
                loading={loading}
              >
                Submit Registration
              </Button>
            )}
          </Group>}
        </form>

        {showSuccess && (
          <Transition mounted={showSuccess} transition="slide-up" duration={500}>
            {(styles) => (
              <Notification
                style={styles}
                title="Registration Submitted!"
                color="green"
                className="mt-6"
                icon={<CheckCircle size={18} />}
                onClose={() => setShowSuccess(false)}
                withCloseButton={false}
              >
                {"Thank you for joining Keyman! We'll review your application and contact you soon."}
                
                <Box><Link href="/keyman/dashboard" className='my-2 py-2 text-keyman-green'>Return to dashboard</Link></Box>
                
              </Notification>
            )}
          </Transition>
        )}
      </Paper>
    </Container>
  );
};

export default SupplierRegistrationForm;