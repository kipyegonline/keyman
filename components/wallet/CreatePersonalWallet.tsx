"use client";
import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import {
  Container,
  Stepper,
  Button,
  Group,
  TextInput,
  Select,
  //Textarea,
  FileInput,
  Paper,
  Title,
  Text,
  Grid,
  Stack,
  Badge,
  Card,
  Image,
  //Modal,
  ActionIcon,
  //Divider,
  Alert,
  Progress,
  Box,
} from "@mantine/core";
import {
  User,
  Phone,
  Mail,
  //MapPin,
  Calendar,
  CreditCard,
  FileText,
  //Camera,
  Upload,
  Eye,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Building,
  Award,
  FileCheck,
  Briefcase,
  DollarSign,
  Factory,
} from "lucide-react";
import { createCurrentAccount } from "@/api/wallet";
import RegistrationSuccess from "./RegistrationSuccess";
import { notify } from "@/lib/notifications";
//import { toDataUrlFromFile } from "@/lib/FileHandlers";

interface CreatePersonalWalletFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  birthday: Date | null;
  gender: string;
  mobile: string;
  idType: string;
  idNumber: string;
  kraPin: string;
  email: string;
  employmentStatus: string;
  monthlyIncome: string;
  businessIndustry: string;
  specifyIndustry: string;
  // Optional documents
  certificateOfGoodConduct?: File | null;
  businessRegistrationCert?: File | null;
  businessPermit?: File | null;
  professionalCertificate?: File | null;
  portfolio?: File | null;
}

const idTypeOptions = [
  { value: "101", label: "National ID" },
  { value: "102", label: "Alien ID" },
  { value: "103", label: "Passport" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const employmentStatusOptions = [
  { value: "A", label: "Employee" },
  { value: "B", label: "Self employed" },
  { value: "C", label: "Unemployed" },
  { value: "D", label: "Employer" },
];

const monthlyIncomeOptions = [
  { value: "A", label: "Less than Ksh. 14,999" },
  { value: "B", label: "Ksh. 15,000-24,999" },
  { value: "C", label: "Ksh. 25,000-39,999" },
  { value: "D", label: "Ksh. 40,000-59,999" },
  { value: "E", label: "Ksh. 60,000-84,999" },
  { value: "F", label: "Above Ksh. 85,000" },
];

const businessIndustryOptions = [
  { value: "1", label: "Agriculture and Agribusiness" },
  { value: "2", label: "Manufacturing and Processing" },
  { value: "3", label: "Construction and Engineering" },
  { value: "4", label: "Retail and Wholesale Trade" },
  { value: "5", label: "Information and Communication Technology" },
  { value: "6", label: "Tourism and Hospitality" },
  { value: "7", label: "Health and Wellness Services" },
  { value: "8", label: "Education and Training" },
  { value: "9", label: "Financial Services" },
  { value: "10", label: "Professional Services" },
  { value: "11", label: "Creative Industries" },
  { value: "12", label: "Renewable Energy and Environmental Conservation" },
  { value: "13", label: "Transport and Logistics" },
  { value: "14", label: "Food and Beverage" },
  { value: "15", label: "Textiles and Apparel" },
  { value: "16", label: "Automotive and Engineering Services" },
  { value: "17", label: "Beauty and Personal Care" },
  { value: "18", label: "Real Estate and Property Development" },
  { value: "19", label: "Consulting and Business Services" },
  { value: "20", label: "Social Enterprises and NGOs" },
  { value: "21", label: "Others, please specify" },
];

export default function CreatePersonalWallet() {
  const [active, setActive] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<{ [key: string]: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<CreatePersonalWalletFormData>({
    initialValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      phoneNumber: "",
      birthday: null,
      gender: "",
      mobile: "",
      idType: "",
      idNumber: "",
      kraPin: "",
      email: "",
      employmentStatus: "",
      monthlyIncome: "",
      businessIndustry: "",
      specifyIndustry: "",
      certificateOfGoodConduct: null,
      businessRegistrationCert: null,
      businessPermit: null,
      professionalCertificate: null,
      portfolio: null,
    },
    validate: (values) => {
      if (active === 0) {
        return {
          firstName: !values.firstName ? "First name is required" : null,
          lastName: !values.lastName ? "Last name is required" : null,
          //phoneNumber: !values.phoneNumber ? "Phone number is required" : null,
          email: !/^\S+@\S+$/.test(values.email || "") ? "Invalid email" : null,
          birthday: !values.birthday
            ? "Birthday is required"
            : (() => {
                const today = new Date();
                const birthDate = new Date(values.birthday);
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (
                  monthDiff < 0 ||
                  (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ) {
                  age--;
                }

                return age < 18 ? "You must be at least 18 years old" : null;
              })(),
          gender: !values.gender ? "Gender is required" : null,
          mobile: !values.mobile ? "Mobile number is required" : null,
          idType: !values.idType ? "ID type is required" : null,
          idNumber: !values.idNumber ? "ID number is required" : null,
          employmentStatus: !values.employmentStatus
            ? "Employment status is required"
            : null,
          monthlyIncome: !values.monthlyIncome
            ? "Monthly income is required"
            : null,
          businessIndustry: !values.businessIndustry
            ? "Business industry is required"
            : null,
          specifyIndustry:
            values.businessIndustry === "21" && !values.specifyIndustry
              ? "Please specify the industry"
              : null,
          kraPin: !values.kraPin?.trim()
            ? "KRA PIN is required"
            : values.kraPin.length !== 11
            ? "KRA PIN must be 11 characters"
            : null,
        };
      }
      return {};
    },
  });

  React.useEffect(() => {
    // Effect to run when 'active' changes
    if (active > 0) window.scrollTo(0, 0);
  }, [active]);
  const nextStep = () => {
    if (active === 0) {
      const validation = form.validate();
      if (validation.hasErrors) {
        notify.error("Please fill in all required fields");
        return;
      }
    }
    setActive((current) => (current < 2 ? current + 1 : current));
  };

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Personal information

      formData.append("firstName", form.values.firstName);
      formData.append("lastName", form.values.lastName);
      if (form.values.middleName) {
        formData.append("middleName", form.values.middleName);
      }
      // formData.append("phoneNumber", form.values.phoneNumber.slice(-9));
      formData.append(
        "birthday",
        form.values?.birthday
          ? new Date(form.values.birthday)?.toISOString().split("T")[0]
          : ""
      );

      // Gender conversion: 1 for male, 2 for female
      const genderCode =
        form.values.gender === "male"
          ? "1"
          : form.values.gender === "female"
          ? "0"
          : "3";
      formData.append("gender", genderCode);

      formData.append("countryCode", "254");
      formData.append("mobile", form.values.mobile.slice(-9));
      formData.append("idType", form.values.idType);
      formData.append("idNumber", form.values.idNumber);
      formData.append("kraPin", form.values.kraPin);
      formData.append("email", form.values.email);
      formData.append("employmentStatus", form.values.employmentStatus);
      formData.append("monthlyIncome", form.values.monthlyIncome);
      formData.append("businessIndustry", form.values.businessIndustry);
      if (form.values.specifyIndustry) {
        formData.append("specifyIndustry", form.values.specifyIndustry);
      }

      // Optional documents
      if (form.values.certificateOfGoodConduct) {
        formData.append(
          "certificateOfGoodConduct",
          form.values.certificateOfGoodConduct
        );
      }
      if (form.values.businessRegistrationCert) {
        formData.append(
          "businessRegistrationCert",
          form.values.businessRegistrationCert
        );
      }
      if (form.values.businessPermit) {
        formData.append("businessPermit", form.values.businessPermit);
      }
      if (form.values.professionalCertificate) {
        formData.append(
          "professionalCertificate",
          form.values.professionalCertificate
        );
      }
      if (form.values.portfolio) {
        formData.append("portfolio", form.values.portfolio);
      }

      const response = await createCurrentAccount(formData);
      //console.log(response);
      if (response.success) {
        if (response.message.includes("successfully")) {
          setShowSuccess(true);
        } else notify.error(response.message);
      } else {
        notify.error(response.message || "Failed to submit registration");
      }
    } catch (error) {
      notify.error("Failed to submit registration");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilePreview = (file: File | null, fieldName: string) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview((prev) => ({
          ...prev,
          [fieldName]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview((prev) => {
        const newPreview = { ...prev };
        delete newPreview[fieldName];
        return newPreview;
      });
    }
  };

  const PhotoUploadField = ({
    fieldName,
    label,
    required = false,
  }: {
    fieldName: keyof CreatePersonalWalletFormData;
    label: string;
    required?: boolean;
    allowCamera?: boolean;
  }) => (
    <div className="space-y-3">
      <Text size="sm" fw={500} className="flex items-center gap-2">
        <Upload size={16} />
        {label} {required && <span className="text-red-500">*</span>}
      </Text>

      <div className="flex gap-3">
        <FileInput
          placeholder="Choose file"
          accept="image/*"
          value={form.values[fieldName] as File | null}
          onChange={(file) => {
            form.setFieldValue(fieldName, file);
            handleFilePreview(file, fieldName);
          }}
          className="flex-1"
          leftSection={<Upload size={16} />}
          error={form.errors[fieldName]}
        />
      </div>

      {photoPreview[fieldName] && (
        <Card className="p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Text size="xs" c="dimmed">
              Preview
            </Text>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => {
                form.setFieldValue(fieldName, null);
                handleFilePreview(null, fieldName);
              }}
            >
              <X size={14} />
            </ActionIcon>
          </div>
          <Image
            src={photoPreview[fieldName]}
            alt="Preview"
            className="max-h-32 w-auto mx-auto rounded"
          />
        </Card>
      )}
    </div>
  );

  const handleResetForm = () => {
    form.reset();
    setPhotoPreview({});
    setActive(0);
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <RegistrationSuccess
        onClose={handleResetForm}
        phoneNumber={form.values.mobile}
      />
    );
  }

  return (
    <Container size="lg" py={{ base: "md", xl: "xl" }}>
      <Paper shadow="md" radius="lg" p="xl" className="bg-white">
        <div className="mb-8 text-center">
          <Title order={2} style={{ color: "#3D6B2C" }} className="mb-2">
            Create Your Personal Current Account
          </Title>
          <Text size="lg" c="dimmed">
            Complete your registration to start using digital payments
          </Text>
        </div>

        <Stepper
          active={active}
          onStepClick={setActive}
          allowNextStepsSelect={false}
          color="#3D6B2C"
          className="mb-8"
        >
          <Stepper.Step
            label="Personal Information"
            description="Required details"
            icon={<User size={18} />}
          >
            <div className="mt-6">
              <Grid gutter="lg">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="First Name"
                    placeholder="Enter first name"
                    leftSection={<User size={16} />}
                    required
                    {...form.getInputProps("firstName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Last Name"
                    placeholder="Enter last name"
                    leftSection={<User size={16} />}
                    required
                    {...form.getInputProps("lastName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Middle Name (Optional)"
                    placeholder="Enter middle name"
                    leftSection={<User size={16} />}
                    {...form.getInputProps("middleName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Gender"
                    placeholder="Select gender"
                    data={genderOptions}
                    required
                    {...form.getInputProps("gender")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateInput
                    label="Date of Birth"
                    placeholder="Pick date"
                    leftSection={<Calendar size={16} />}
                    required
                    {...form.getInputProps("birthday")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Email Address"
                    placeholder="Enter email"
                    leftSection={<Mail size={16} />}
                    required
                    {...form.getInputProps("email")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Phone Number"
                    placeholder="+254 700 000 000"
                    leftSection={<Phone size={16} />}
                    required
                    {...form.getInputProps("mobile")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Employment Status"
                    placeholder="Select employment status"
                    data={employmentStatusOptions}
                    leftSection={<Briefcase size={16} />}
                    required
                    {...form.getInputProps("employmentStatus")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Monthly Income"
                    placeholder="Select monthly income range"
                    data={monthlyIncomeOptions}
                    leftSection={<DollarSign size={16} />}
                    required
                    {...form.getInputProps("monthlyIncome")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Business Industry"
                    placeholder="Select business industry"
                    data={businessIndustryOptions}
                    leftSection={<Factory size={16} />}
                    required
                    {...form.getInputProps("businessIndustry")}
                  />
                </Grid.Col>
                {form.values.businessIndustry === "21" && (
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Specify Industry"
                      placeholder="Please specify your industry"
                      leftSection={<Building size={16} />}
                      required
                      {...form.getInputProps("specifyIndustry")}
                    />
                  </Grid.Col>
                )}
                <Grid.Col span={{ base: 12, sm: 6 }} display={"none"}>
                  <TextInput
                    label="Mobile Number"
                    placeholder="+254 700 000 000"
                    leftSection={<Phone size={16} />}
                    required
                    {...form.getInputProps("mobile")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="ID Type"
                    placeholder="Select ID type"
                    data={idTypeOptions}
                    leftSection={<CreditCard size={16} />}
                    required
                    {...form.getInputProps("idType")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="ID Number"
                    placeholder="Enter ID number"
                    leftSection={<FileText size={16} />}
                    required
                    {...form.getInputProps("idNumber")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="KRA PIN"
                    placeholder="A00668857W"
                    maxLength={11}
                    leftSection={<FileText size={16} />}
                    required
                    {...form.getInputProps("kraPin")}
                  />
                </Grid.Col>
              </Grid>
            </div>
          </Stepper.Step>

          <Stepper.Step
            label="Documents"
            description="Optional documents"
            icon={<FileCheck size={18} />}
          >
            <div className="mt-6">
              <Alert
                icon={<AlertCircle size={16} />}
                className="mb-6"
                color="blue"
                title="Optional Documents"
              >
                These documents are optional but may help speed up your
                verification process and increase your trust score.
              </Alert>

              <Stack gap="xl">
                <Card
                  className="p-6 border-2 border-gray-100 hover:shadow-lg"
                  radius="lg"
                  style={{ borderColor: "#3D6B2C" }}
                >
                  <Title
                    order={4}
                    style={{ color: "#3D6B2C" }}
                    className="mb-4 flex items-center gap-2"
                  >
                    <Building size={20} />
                    Legal & Business Documents
                  </Title>
                  <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <PhotoUploadField
                        fieldName="certificateOfGoodConduct"
                        label="Certificate of Good Conduct"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <PhotoUploadField
                        fieldName="businessRegistrationCert"
                        label="Business Registration Certificate"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <PhotoUploadField
                        fieldName="businessPermit"
                        label="Business Permit / Trade License"
                      />
                    </Grid.Col>
                  </Grid>
                </Card>

                <Card
                  className="p-6 border-2 border-gray-100 hover:shadow-lg"
                  radius="lg"
                  style={{ borderColor: "#F08C23" }}
                >
                  <Title
                    order={4}
                    style={{ color: "#F08C23" }}
                    className="mb-4 flex items-center gap-2"
                  >
                    <Award size={20} />
                    Professional & Experience Proof
                  </Title>
                  <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <PhotoUploadField
                        fieldName="professionalCertificate"
                        label="Professional Membership Certificate"
                      />
                      <Text size="xs" c="dimmed" mt="xs">
                        NCA, EBK, BORAQS, ECN, etc.
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <PhotoUploadField
                        fieldName="portfolio"
                        label="Portfolio of Completed Projects"
                      />
                    </Grid.Col>
                  </Grid>
                </Card>
              </Stack>
            </div>
          </Stepper.Step>

          <Stepper.Step
            label="Review"
            description="Confirm details"
            icon={<Eye size={18} />}
          >
            <div className="mt-6">
              <Card className="border border-gray-200" radius="lg">
                <Title
                  order={4}
                  style={{ color: "#3D6B2C" }}
                  className="mb-6 flex items-center gap-2"
                >
                  <CheckCircle size={20} />
                  Review Your Information
                </Title>

                <Stack gap="lg">
                  <Card className="bg-gray-50 p-4" radius="md">
                    <Text
                      fw={600}
                      style={{ color: "#3D6B2C" }}
                      className="mb-3"
                    >
                      Personal Information
                    </Text>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <strong>Name:</strong> {form.values.firstName}{" "}
                        {form.values.middleName} {form.values.lastName}
                      </div>
                      <div>
                        <strong>Gender:</strong>{" "}
                        {
                          genderOptions.find(
                            (g) => g.value === form.values.gender
                          )?.label
                        }
                      </div>
                      <div>
                        <strong>Email:</strong> {form.values.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {form.values.phoneNumber}
                      </div>
                      <div>
                        <strong>Mobile:</strong> {form.values.mobile}
                      </div>
                      <div>
                        <strong>Birthday:</strong>{" "}
                        {form.values.birthday
                          ? new Date(form.values.birthday)?.toLocaleDateString()
                          : null}
                      </div>
                      <div>
                        <strong>Employment Status:</strong>{" "}
                        {
                          employmentStatusOptions.find(
                            (e) => e.value === form.values.employmentStatus
                          )?.label
                        }
                      </div>
                      <div>
                        <strong>Monthly Income:</strong>{" "}
                        {
                          monthlyIncomeOptions.find(
                            (m) => m.value === form.values.monthlyIncome
                          )?.label
                        }
                      </div>
                      <div>
                        <strong>Business Industry:</strong>{" "}
                        {
                          businessIndustryOptions.find(
                            (b) => b.value === form.values.businessIndustry
                          )?.label
                        }
                      </div>
                      {form.values.businessIndustry === "21" &&
                        form.values.specifyIndustry && (
                          <div>
                            <strong>Specified Industry:</strong>{" "}
                            {form.values.specifyIndustry}
                          </div>
                        )}
                    </div>
                    <div className="mt-3">
                      <div className="text-sm">
                        <strong>KRA PIN:</strong> {form.values.kraPin}
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-blue-50 p-4" radius="md">
                    <Text
                      fw={600}
                      style={{ color: "#3D6B2C" }}
                      className="mb-3"
                    >
                      Identification
                    </Text>
                    <div className="text-sm space-y-1">
                      <div>
                        <strong>ID Type:</strong>{" "}
                        {
                          idTypeOptions.find(
                            (opt) => opt.value === form.values.idType
                          )?.label
                        }
                      </div>
                      <div>
                        <strong>ID Number:</strong> {form.values.idNumber}
                      </div>
                    </div>
                  </Card>

                  {/* Optional Documents Summary */}
                  {(form.values.certificateOfGoodConduct ||
                    form.values.businessRegistrationCert ||
                    form.values.businessPermit ||
                    form.values.professionalCertificate ||
                    form.values.portfolio) && (
                    <Card className="bg-orange-50 p-4" radius="md">
                      <Text
                        fw={600}
                        style={{ color: "#F08C23" }}
                        className="mb-3"
                      >
                        Optional Documents Uploaded
                      </Text>
                      <div className="flex flex-wrap gap-2">
                        {form.values.certificateOfGoodConduct && (
                          <Badge
                            variant="light"
                            color="green"
                            leftSection={<CheckCircle size={12} />}
                          >
                            Good Conduct Cert
                          </Badge>
                        )}
                        {form.values.businessRegistrationCert && (
                          <Badge
                            variant="light"
                            color="green"
                            leftSection={<CheckCircle size={12} />}
                          >
                            Business Registration
                          </Badge>
                        )}
                        {form.values.businessPermit && (
                          <Badge
                            variant="light"
                            color="green"
                            leftSection={<CheckCircle size={12} />}
                          >
                            Business Permit
                          </Badge>
                        )}
                        {form.values.professionalCertificate && (
                          <Badge
                            variant="light"
                            color="green"
                            leftSection={<CheckCircle size={12} />}
                          >
                            Professional Cert
                          </Badge>
                        )}
                        {form.values.portfolio && (
                          <Badge
                            variant="light"
                            color="green"
                            leftSection={<CheckCircle size={12} />}
                          >
                            Portfolio
                          </Badge>
                        )}
                      </div>
                    </Card>
                  )}
                </Stack>
              </Card>
            </div>
          </Stepper.Step>
        </Stepper>

        <Group justify="space-between" mt="xl">
          <div>
            {active > 0 && (
              <Button
                variant="light"
                onClick={prevStep}
                leftSection={<ArrowLeft size={16} />}
                className="hover:bg-gray-100"
              >
                Previous
              </Button>
            )}
          </div>

          <div>
            {active < 2 ? (
              <Button
                onClick={nextStep}
                rightSection={<ArrowRight size={16} />}
                style={{ backgroundColor: "#3D6B2C" }}
                className="hover:opacity-90"
                size="md"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                rightSection={<CheckCircle size={16} />}
                style={{ backgroundColor: "#3D6B2C" }}
                className="hover:opacity-90"
                size="md"
              >
                Submit Application
              </Button>
            )}
          </div>
        </Group>

        {isSubmitting && (
          <Box className="mt-4">
            <Progress value={100} animated color="#3D6B2C" />
            <Text size="sm" c="dimmed" ta="center" mt="xs">
              Submitting your application...
            </Text>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
