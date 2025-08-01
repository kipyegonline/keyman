"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Select,
  Button,
  Paper,
  Title,
  Text,
  Checkbox,
  MultiSelect,
  Grid,
  Card,
  Transition,
  Notification,
  Group,
  Loader,
  Box,
  Textarea,
  FileInput,
  Avatar,
} from "@mantine/core";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Navigation,
  Package,
  Shield,
  CheckCircle,
  Save,
  RefreshCw,
  ArrowLeft,
  ImageDown,
} from "lucide-react";
import { updateSupplierDetails } from "@/api/supplier";
import Link from "next/link";
import { DataURIToBlob, toDataUrlFromFile } from "@/lib/FileHandlers";

// Types and Interfaces
export interface SupplierUpdateInfo {
  name: string;
  phone: string;
  email: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  //categories: string[];
  is_escrow_only: boolean;
  id?: string;
  comments: string;
  photo: File | null;
}
export interface Location {
  location: {
    type: string;
    coordinates: [number, number];
  };
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
  const [locationStatus, setLocationStatus] = useState<string>("");

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setLocationStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        onLocationChange(lat, lng);
        setLocationStatus("Location updated successfully!");
        setLoading(false);
        setTimeout(() => setLocationStatus(""), 3000);
      },
      (error) => {
        setLocationStatus(`Error: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationChange]);

  return (
    <Card className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-green-50 to-orange-50">
      <Group className="mb-3">
        <MapPin className="text-[#3D6B2C]" size={20} />
        <Text size="sm" className="font-medium text-gray-700">
          Current Location
        </Text>
      </Group>

      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="Latitude"
            value={latitude || ""}
            readOnly
            placeholder="Auto-filled"
            size="sm"
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Longitude"
            value={longitude || ""}
            readOnly
            placeholder="Auto-filled"
            size="sm"
          />
        </Grid.Col>
      </Grid>

      <Button
        onClick={getCurrentLocation}
        loading={loading}
        leftSection={<Navigation size={16} />}
        className="mt-3 bg-[#3D6B2C] hover:bg-[#2A4B1F] transition-all duration-300 transform hover:scale-105"
        size="sm"
        variant="light"
      >
        {loading ? "Updating..." : "Update Location"}
      </Button>

      {locationStatus && (
        <Transition
          mounted={!!locationStatus}
          transition="slide-up"
          duration={300}
          timingFunction="ease"
        >
          {(styles) => (
            <Text
              size="xs"
              className={`mt-2 ${
                locationStatus.includes("Error")
                  ? "text-red-500"
                  : "text-green-600"
              }`}
              style={styles}
            >
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

// Category Selector Component
const CategorySelector: React.FC<{
  supplierTypes: CategoryStructure;
  mainCategory: string;
  subCategory: string[];
  onMainCategoryChange: (category: string) => void;
  onSubCategoryChange: (category: string[]) => void;
  error?: string;
}> = ({
  supplierTypes,
  mainCategory,
  subCategory,
  onMainCategoryChange,
  onSubCategoryChange,
  error,
}) => {
  const mainCategories = React.useMemo(() => {
    if (supplierTypes) {
      return Object.keys(supplierTypes).map((value) => ({
        value,
        label: value.replace("_", " ").toUpperCase(),
      }));
    } else return [];
  }, [supplierTypes]);

  const getSubCategories = () => {
    if (!mainCategory || !(mainCategory in supplierTypes)) return [];
    return supplierTypes[
      mainCategory as keyof CategoryStructure
    ].categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  };

  return (
    <div className="space-y-4">
      {mainCategories.length > 0 && (
        <Select
          label="Business Category"
          placeholder="Select your business category"
          data={mainCategories}
          value={mainCategory}
          onChange={(value) => {
            onMainCategoryChange(value || "");
            onSubCategoryChange([]); // Reset subcategory when main category changes
          }}
          leftSection={<Building2 size={16} className="text-[#3D6B2C]" />}
          className="transition-all duration-300 hover:scale-[1.01]"
          error={error}
          display={"none"}
        />
      )}
      <Transition
        mounted={!!mainCategory}
        transition="slide-down"
        duration={300}
      >
        {(styles) => (
          <MultiSelect
            style={styles}
            label="Specific Categories"
            placeholder="Select  categories"
            data={getSubCategories()}
            value={subCategory}
            onChange={onSubCategoryChange}
            leftSection={<Package size={16} className="text-[#F08C23]" />}
            className="transition-all duration-300 hover:scale-[1.01]"
            //maxValues={2}
          />
        )}
      </Transition>
    </div>
  );
};

// Main Update Component
const SupplierUpdateForm: React.FC<{
  supplierTypes: CategoryStructure;
  initialData?: Partial<SupplierUpdateInfo>;
}> = ({ supplierTypes, initialData = {} }) => {
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const form = useForm<SupplierUpdateInfo>({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      type: "",
      address: "",
      latitude: 0,
      longitude: 0,
      // categories:  [],
      is_escrow_only: false,
      comments: "",
      photo: null,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 characters" : null,
      phone: (value) =>
        /^\+?[0-9]\d{1,14}$/.test(value) ? null : "Invalid phone number",
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      type: (value) => (value.length < 1 ? "Business type is required" : null),
      address: (value) =>
        value.length < 5 ? "Address must be at least 5 characters" : null,
      latitude: (value) => (value === 0 ? "Please set your location" : null),
      longitude: (value) => (value === 0 ? "Please set your location" : null),
      comments: (value) =>
        value.trim().length < 10 ? "Kindly add profile description" : null,
    },
  });

  const getCoords = (data: SupplierUpdateInfo & Location) => {
    if ("location" in data && "coordinates" in data.location)
      return data?.location?.coordinates as [number, number];
    else return [0, 0];
  };
  useEffect(() => {
    if (initialData) {
      form.setValues({
        name: initialData.name,
        phone: initialData.phone,
        email: initialData.email,
        // type:initialData.type,
        address: initialData.address,
        //categories:initialData.categories,

        is_escrow_only: initialData.is_escrow_only,
      });
      //setMainCategory({label:initialData.type,value:initialData.type})
      //setSubCategory(initialData.categories || [])
      const [lat, long] = getCoords(
        initialData as SupplierUpdateInfo & Location
      );
      form.setFieldValue("latitude", long);
      form.setFieldValue("longitude", lat);
      setMainCategory(initialData.type || "");
      //setSubCategory(initialData.categories. || [])
    }
  }, [initialData?.name]);
  /*
  const validateCategories = () => {
    if (subCategory.length < 1) {
      return "Please select at least one category";
    } else if (subCategory.length > 2) {
      return "Please select up to 2 categories";
    }
    return null;
  };*/

  const handleSubCategory = (value: string[]) => {
    setSubCategory(value);
    form.setFieldValue("categories", value);
  };

  const handleSubmit = async (values: SupplierUpdateInfo) => {
    /* const categoryError = validateCategories();
    if (categoryError) {
      form.setErrors({ categories: categoryError });
      return;
    }*/

    if (!confirm("Are you sure you want to update your information?")) return;
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (key === "categories" && Array.isArray(value)) {
        value.forEach((v) => {
          formData.append(key, v);
        });
        //formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (values.photo) {
      const file64 = await toDataUrlFromFile(values.photo);

      const file_ = DataURIToBlob(file64 as string);
      console.log(file_);

      // formData.append("photo", file_, values.photo.name);
    }
    for (const [k, v] of formData.entries()) {
      console.log(k, v);
    }
    setLoading(true);
    try {
      const id = initialData?.id as string;

      const results = await updateSupplierDetails(id, formData);
      if (results.status) {
        setShowSuccess(true);
        //setTimeout(() => setShowSuccess(false), 5000);
      } else {
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.reset();
    //setMainCategory(initialData.type || '');
    //setSubCategory(initialData.categories || []);
  };

  return (
    <section className="py-0 md:py-6  w-full  px-4 md:px-20">
      <Transition mounted={isVisible} transition="fade" duration={500}>
        {(styles) => (
          <Paper
            style={styles}
            className="!p-0 md:p-6   shadow-xl rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100"
          >
            {showSuccess ? (
              <div className="text-center mb-6">
                <Title
                  order={2}
                  className="text-2xl font-bold text-[#3D6B2C] mb-2 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="animate-pulse" size={24} />
                  Business Information Updated
                </Title>
                <Text className="text-gray-600">
                  Your Keyman supplier profile is up to date
                </Text>
              </div>
            ) : (
              <div className="text-center mb-6">
                <Title
                  order={2}
                  className="text-2xl font-bold text-[#3D6B2C] mb-2 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={24} />
                  Update Business Information
                </Title>
                <Text className="text-gray-600">
                  Keep your Keyman supplier profile up to date
                </Text>
              </div>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-5">
              <Transition
                mounted={!showSuccess}
                transition="slide-right"
                duration={400}
              >
                {(styles) => (
                  <div style={styles} className="space-y-5">
                    {/* Basic Information Section */}
                    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                      <Text className="font-semibold text-[#3D6B2C] mb-3 flex items-center gap-2">
                        <User size={18} />
                        Basic Information
                      </Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <TextInput
                            label="Business Name"
                            placeholder="Enter your business name"
                            leftSection={
                              <Building2 size={16} className="text-[#3D6B2C]" />
                            }
                            className="transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]"
                            {...form.getInputProps("name")}
                            required
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <TextInput
                            label="Phone Number"
                            placeholder="+1234567890"
                            leftSection={
                              <Phone size={16} className="text-[#3D6B2C]" />
                            }
                            className="transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]"
                            {...form.getInputProps("phone")}
                            required
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <TextInput
                            label="Email Address"
                            placeholder="business@example.com"
                            leftSection={
                              <Mail size={16} className="text-[#3D6B2C]" />
                            }
                            className="transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]"
                            {...form.getInputProps("email")}
                            required
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <FileInput
                            accept="image/png,image/jpeg, image/jpg"
                            label="Company logo"
                            placeholder="business@example.com"
                            leftSection={
                              <ImageDown size={16} className="text-[#3D6B2C]" />
                            }
                            className="transition-all duration-300 hover:scale-[1.02]"
                            {...form.getInputProps("photo")}
                            required
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          {form.values.photo && (
                            <Avatar
                              size="lg"
                              radius="md"
                              src={URL.createObjectURL(form.values.photo)}
                              alt="Item preview"
                            ></Avatar>
                          )}
                        </Grid.Col>
                      </Grid>
                    </Card>

                    {/* Business Type & Categories */}
                    <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg">
                      <Text className="font-semibold text-[#3D6B2C] mb-3 flex items-center gap-2">
                        <Building2 size={18} />
                        Business Type & Categories
                      </Text>
                      {/**hide this for now */}
                      <Grid>
                        <Grid.Col span={12}>
                          {supplierTypes && (
                            <Select
                              label="Supplier Type"
                              placeholder="Select your business type"
                              data={Object.keys(supplierTypes).map((value) => ({
                                value,
                                label: value.replace("_", " ").toUpperCase(),
                              }))}
                              leftSection={
                                <Building2
                                  size={16}
                                  className="text-[#3D6B2C]"
                                />
                              }
                              className="transition-all duration-300 hover:scale-[1.01]"
                              {...form.getInputProps("type")}
                              onChange={(value) => {
                                form.setFieldValue("type", value || "");
                                setMainCategory(value || "");
                                setSubCategory([]);
                              }}
                              required
                            />
                          )}
                        </Grid.Col>
                        {true && (
                          <Grid.Col span={12}>
                            {form.values.type && (
                              <CategorySelector
                                supplierTypes={supplierTypes}
                                mainCategory={mainCategory}
                                subCategory={subCategory}
                                onMainCategoryChange={setMainCategory}
                                onSubCategoryChange={handleSubCategory}
                                error={form.errors.categories as string}
                              />
                            )}
                            {form.errors.categories && (
                              <Text size="xs" className="text-red-500 mt-1">
                                {form.errors.categories}
                              </Text>
                            )}
                          </Grid.Col>
                        )}
                      </Grid>
                    </Card>

                    {/* Location Section */}
                    <Card className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-lg">
                      <Text className="font-semibold text-[#3D6B2C] mb-3 flex items-center gap-2">
                        <MapPin size={18} />
                        Location Information
                      </Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <TextInput
                            label="Business Address"
                            placeholder="Enter your full business address"
                            leftSection={
                              <MapPin size={16} className="text-[#3D6B2C]" />
                            }
                            className="transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01] mb-4"
                            {...form.getInputProps("address")}
                            required
                          />
                        </Grid.Col>

                        <Grid.Col span={12}>
                          <LocationSelector
                            latitude={form.values.latitude}
                            longitude={form.values.longitude}
                            onLocationChange={(lat, lng) => {
                              form.setFieldValue("latitude", lat);
                              form.setFieldValue("longitude", lng);
                            }}
                            error={form.errors.latitude as string}
                          />
                        </Grid.Col>
                      </Grid>
                    </Card>
                    <Card>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Profile description"
                            placeholder="Enter your profile description"
                            leftSection={null}
                            className="transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01] mb-4"
                            {...form.getInputProps("comments")}
                            required
                          />
                        </Grid.Col>
                      </Grid>
                    </Card>

                    {/* Payment Settings */}
                    <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg">
                      <Text
                        mb="sm"
                        className="font-semibold  text-[#3D6B2C] mb-3 flex items-center gap-2"
                      >
                        <Shield size={18} />
                        Payment Settings
                      </Text>
                      <Checkbox
                        label="Escrow Only"
                        description="Only accept payments through secure escrow service"
                        // icon={() => <Shield size={16} />}
                        color="#3D6B2C"
                        className="transition-all duration-300 hover:scale-[1.01]"
                        {...form.getInputProps("is_escrow_only", {
                          type: "checkbox",
                        })}
                      />
                    </Card>
                  </div>
                )}
              </Transition>

              {/* Action Buttons */}
              {!showSuccess && (
                <Transition
                  mounted={!showSuccess}
                  transition="slide-up"
                  duration={400}
                >
                  {(styles) => (
                    <Group
                      justify="space-between"
                      className="mt-6"
                      style={styles}
                    >
                      <Button
                        variant="outline"
                        onClick={resetForm}
                        className="border-gray-400 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                        leftSection={<RefreshCw size={16} />}
                      >
                        Reset Changes
                      </Button>

                      <Button
                        type="submit"
                        className="bg-[#3D6B2C] hover:bg-[#2A4B1F] transition-all duration-300 transform hover:scale-105"
                        size="md"
                        loading={loading}
                        leftSection={
                          loading ? <Loader size={16} /> : <Save size={16} />
                        }
                      >
                        {loading ? "Updating..." : "Update Information"}
                      </Button>
                    </Group>
                  )}
                </Transition>
              )}
            </form>

            {/* Success Notification */}
            {showSuccess && (
              <Transition
                mounted={showSuccess}
                transition="slide-up"
                duration={500}
              >
                {(styles) => (
                  <Box style={styles} className="mt-6">
                    <Notification
                      title="Update Successful!"
                      withCloseButton={false}
                      color="green"
                      icon={<CheckCircle size={18} />}
                      // onClose={() => setShowSuccess(false)}
                      className="animate-pulse"
                    >
                      Your business information has been updated successfully!
                    </Notification>
                    <Box className="py-4 flex justify-center">
                      <Link
                        href="/keyman/supplier"
                        className="text-keyman-green my-2"
                      >
                        <ArrowLeft size={14} className="inline-block mr-2" />{" "}
                        Return to dashboard
                      </Link>
                    </Box>
                  </Box>
                )}
              </Transition>
            )}
          </Paper>
        )}
      </Transition>
    </section>
  );
};

export default SupplierUpdateForm;
