"use client";
import React, { useState, useRef, useCallback } from "react";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import {
  Container,
  Stepper,
  Button,
  Group,
  TextInput,
  Select,
  Textarea,
  FileInput,
  Paper,
  Title,
  Text,
  Grid,
  Stack,
  Badge,
  Card,
  Image,
  Modal,
  ActionIcon,
  Divider,
  Alert,
  Progress,
  Box,
} from "@mantine/core";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Camera,
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
} from "lucide-react";
import { createWalletWithData } from "@/api/wallet";
import RegistrationSuccess from "./RegistrationSuccess";
import { notify } from "@/lib/notifications";
import { toDataUrlFromFile } from "@/lib/FileHandlers";
import CameraCapture from "./CameraCapture";
import { optimizeIDPhoto, optimizeSelfiePhoto } from "@/lib/imageOptimizer";

// Maximum file size threshold (in MB) before optimization is applied
const MAX_FILE_SIZE_MB = 5;

interface CreateWalletFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  birthday: Date | null;
  gender: string;
  mobile: string;
  idType: string;
  idNumber: string;
  frontSidePhoto: File | null;
  backSidePhoto: File | null;
  selfiePhoto: File | null;
  kraPin: string;
  address: string;
  email: string;
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

const getIdLabels = (idType: string) => {
  switch (idType) {
    case "101": // National ID
      return {
        idNumber: "National ID Number",
        frontPhoto: "National ID Front Side Photo",
        backPhoto: "National ID Back Side Photo",
        showBackPhoto: true,
      };
    case "102": // Alien ID
      return {
        idNumber: "Alien ID Number",
        frontPhoto: "Alien ID Front Side Photo",
        backPhoto: "Alien ID Back Side Photo",
        showBackPhoto: true,
      };
    case "103": // Passport
      return {
        idNumber: "Passport Number",
        frontPhoto: "Passport Photo",
        backPhoto: "",
        showBackPhoto: false,
      };
    default:
      return {
        idNumber: "ID Number",
        frontPhoto: "ID Front Side Photo",
        backPhoto: "ID Back Side Photo",
        showBackPhoto: true,
      };
  }
};

export default function CreateWallet() {
  const [active, setActive] = useState(0);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [photoCameraOpen, setPhotoCameraOpen] = useState(false);
  const [currentPhotoField, setCurrentPhotoField] = useState<
    keyof CreateWalletFormData | null
  >(null);
  const [photoPreview, setPhotoPreview] = useState<{ [key: string]: string }>(
    {}
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateWalletFormData>({
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
      frontSidePhoto: null,
      backSidePhoto: null,
      selfiePhoto: null,
      kraPin: "",
      address: "",
      email: "",
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
          middleName: !values.middleName ? "Middle name is required" : null,
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
          /* kraPin: !values.kraPin?.trim()
            ? "KRA PIN is required"
            : values.kraPin.length !== 11
            ? "KRA PIN must be 11 characters"
            : null,
          address: !values.address ? "Address is required" : null,*/
          frontSidePhoto: !values.frontSidePhoto
            ? "Front side photo is required"
            : null,
          backSidePhoto:
            values.idType !== "103" && !values.backSidePhoto
              ? "Back side photo is required"
              : null,
          selfiePhoto: !values.selfiePhoto ? "Selfie photo is required" : null,
        };
      }
      return {};
    },
  });

  // Get dynamic labels based on selected ID type
  const idLabels = getIdLabels(form.values.idType);

  // Clear backSidePhoto when passport is selected
  React.useEffect(() => {
    if (form.values.idType === "103" && form.values.backSidePhoto) {
      form.setFieldValue("backSidePhoto", null);
      setPhotoPreview((prev) => {
        const newPreview = { ...prev };
        delete newPreview["backSidePhoto"];
        return newPreview;
      });
    }
  }, [form.values.idType]);

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraModalOpen(true);
    } catch (error) {
      console.error(error);
      notify.error("Unable to access camera. Please use file upload instead.");
    }
  };

  const takePhoto = useCallback(() => {
    if (!cameraStream || !videoRef.current || !canvasRef.current) {
      notify.error("Camera not ready. Please try again.");
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Check if video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        notify.error("Video not ready. Please wait a moment and try again.");
        return;
      }

      // Check if video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        notify.error(
          "Camera not initialized properly. Please close and try again."
        );
        return;
      }

      const context = canvas.getContext("2d");

      if (!context) {
        notify.error("Unable to capture photo. Please try again.");
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and create file
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "selfie-photo.jpg", {
              type: "image/jpeg",
            });
            form.setFieldValue("selfiePhoto", file);
            handleFilePreview(file, "selfiePhoto");
            stopCamera();
            setCameraModalOpen(false);
          } else {
            notify.error("Failed to create photo. Please try again.");
          }
        },
        "image/jpeg",
        0.8
      );
    } catch (error) {
      console.error("Error taking photo:", error);
      notify.error("Unable to capture photo. Please try again.");
    }
  }, [cameraStream, form]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const openPhotoCamera = (fieldName: keyof CreateWalletFormData) => {
    setCurrentPhotoField(fieldName);
    setPhotoCameraOpen(true);
  };

  const handlePhotoCapture = (file: File) => {
    if (currentPhotoField) {
      form.setFieldValue(currentPhotoField, file);
      handleFilePreview(file, currentPhotoField);
    }
  };

  const getPhotoCameraInstructions = () => {
    if (!currentPhotoField) return "";

    if (currentPhotoField === "frontSidePhoto") {
      return "Position the front side of your ID card clearly in the frame";
    } else if (currentPhotoField === "backSidePhoto") {
      return "Position the back side of your ID card clearly in the frame";
    }
    return "Position the subject clearly in the frame";
  };
  React.useEffect(() => {
    // Effect to run when 'active' changes
    if (active > 0) window.scrollTo(0, 0);
  }, [active]);

  // Cleanup camera stream on unmount
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);
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
    setSubmitError(null); // Clear any previous errors
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
      formData.append("address", form.values.address);
      formData.append("email", form.values.email);

      // Required photos - optimize if larger than threshold
      if (form.values.frontSidePhoto) {
        let photoToUpload = form.values.frontSidePhoto;
        const fileSizeMB = photoToUpload.size / (1024 * 1024);

        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          notify.info("Optimizing front ID photo...");
          photoToUpload = await optimizeIDPhoto(photoToUpload);
        }

        const base64 = await toDataUrlFromFile(photoToUpload);
        formData.append("frontSidePhoto", (base64 as string).split(",")[1]);
      }

      if (form.values.backSidePhoto) {
        let photoToUpload = form.values.backSidePhoto;
        const fileSizeMB = photoToUpload.size / (1024 * 1024);

        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          notify.info("Optimizing back ID photo...");
          photoToUpload = await optimizeIDPhoto(photoToUpload);
        }

        const base64 = await toDataUrlFromFile(photoToUpload);
        formData.append(
          "backSidePhoto",
          (base64 as string).split(",")[1] as string
        );
      }

      if (form.values.selfiePhoto) {
        let photoToUpload = form.values.selfiePhoto;
        const fileSizeMB = photoToUpload.size / (1024 * 1024);

        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          notify.info("Optimizing selfie photo...");
          photoToUpload = await optimizeSelfiePhoto(photoToUpload);
        }

        const base64 = await toDataUrlFromFile(photoToUpload);
        formData.append(
          "selfiePhoto",
          (base64 as string).split(",")[1] as string
        );
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

      const response = await createWalletWithData(formData);
      //console.log(response);
      if (response.success) {
        if (response.message.includes("successfully")) {
          setShowSuccess(true);
        } else {
          notify.error(response.message);
          setSubmitError(
            response.message || "Registration failed. Please try again."
          );
        }
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          "Failed to submit registration. Please try again.";
        notify.error(errorMessage);
        setSubmitError(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        "Failed to submit registration. Please check your information and try again.";
      notify.error("Failed to submit registration");
      setSubmitError(errorMessage);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const PhotoUploadField = ({
    fieldName,
    label,
    required = false,
    allowCamera = false,
    description = "",
  }: {
    fieldName: keyof CreateWalletFormData;
    label: string;
    required?: boolean;
    allowCamera?: boolean;
    description?: string;
  }) => {
    const acceptedTypes = "image/jpeg,image/jpg,image/png";
    const file = form.values[fieldName] as File | null;
    const isSelfieField = fieldName === "selfiePhoto";
    const isPhotoField =
      fieldName === "frontSidePhoto" || fieldName === "backSidePhoto";

    return (
      <div className="space-y-3">
        <Text size="sm" fw={500} className="flex items-center gap-2">
          <Upload size={16} />
          {label} {required && <span className="text-red-500">*</span>}
        </Text>
        {description && (
          <Text size="xs" c="dimmed" className="italic !py-1">
            {description}
          </Text>
        )}
        {fieldName === "selfiePhoto" && (
          <Alert color="blue" className="mb-3">
            <Text size="xs">
              📷 Upload an image file or take a selfie photo using your camera.
              Please ensure good lighting and look directly at the camera.
            </Text>
          </Alert>
        )}

        <div className="flex gap-3">
          <FileInput
            placeholder="Choose file"
            accept={acceptedTypes}
            value={file}
            onChange={(file) => {
              form.setFieldValue(fieldName, file);
              handleFilePreview(file, fieldName);
            }}
            className="flex-1"
            leftSection={<Upload size={16} />}
            error={form.errors[fieldName]}
          />

          {allowCamera && isSelfieField && (
            <ActionIcon
              variant="light"
              size="lg"
              onClick={startCamera}
              style={{ backgroundColor: "#3D6B2C", color: "white" }}
              className="hover:opacity-80 transition-opacity"
              title="Take Photo"
            >
              <Camera size={18} />
            </ActionIcon>
          )}

          {isPhotoField && (
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => openPhotoCamera(fieldName)}
              style={{ backgroundColor: "#F08C23", color: "white" }}
              className="hover:opacity-80 transition-opacity"
              title="Take Photo"
            >
              <Camera size={18} />
            </ActionIcon>
          )}
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
  };

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
        idType={form.values.idType}
      />
    );
  }

  return (
    <Container size="lg" py={{ base: "md", xl: "xl" }}>
      <Paper shadow="md" radius="lg" p="xl" className="bg-white">
        <div className="mb-8 text-center">
          <Title order={2} style={{ color: "#3D6B2C" }} className="mb-2">
            Create Your Keyman Wallet
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
                    label="Middle Name"
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
                    label={idLabels.idNumber}
                    placeholder={`Enter ${idLabels.idNumber.toLowerCase()}`}
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
                <Grid.Col span={12}>
                  <Textarea
                    label="Address"
                    placeholder="Enter your full address"
                    leftSection={<MapPin size={16} />}
                    minRows={3}
                    required
                    {...form.getInputProps("address")}
                  />
                </Grid.Col>

                <Grid.Col span={12}>
                  <Divider
                    label="Required Photos"
                    labelPosition="center"
                    className="my-6"
                    color="#3D6B2C"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <PhotoUploadField
                    fieldName="frontSidePhoto"
                    label={idLabels.frontPhoto}
                    required
                    description="Kindly take a photo of front side of your ID."
                  />
                </Grid.Col>
                {idLabels.showBackPhoto && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <PhotoUploadField
                      fieldName="backSidePhoto"
                      label={idLabels.backPhoto}
                      required
                      description="Kindly take a photo of back side of your ID."
                    />
                  </Grid.Col>
                )}
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <PhotoUploadField
                    fieldName="selfiePhoto"
                    label="Selfie Photo"
                    required
                    allowCamera
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
                    </div>
                    <div className="mt-3">
                      <div className="text-sm">
                        <strong>Address:</strong> {form.values.address}
                      </div>
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

                  <Card className="bg-green-50 p-4" radius="md">
                    <Text
                      fw={600}
                      style={{ color: "#3D6B2C" }}
                      className="mb-3"
                    >
                      Uploaded Documents
                    </Text>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {photoPreview.frontSidePhoto && (
                        <div className="text-center">
                          <Text size="xs" c="dimmed" mb="xs">
                            {idLabels.frontPhoto}
                          </Text>
                          <Image
                            src={photoPreview.frontSidePhoto}
                            alt={idLabels.frontPhoto}
                            className="max-h-24 w-auto mx-auto rounded shadow-sm"
                          />
                        </div>
                      )}
                      {photoPreview.backSidePhoto && idLabels.showBackPhoto && (
                        <div className="text-center">
                          <Text size="xs" c="dimmed" mb="xs">
                            {idLabels.backPhoto}
                          </Text>
                          <Image
                            src={photoPreview.backSidePhoto}
                            alt={idLabels.backPhoto}
                            className="max-h-24 w-auto mx-auto rounded shadow-sm"
                          />
                        </div>
                      )}
                      {photoPreview.selfiePhoto && (
                        <div className="text-center">
                          <Text size="xs" c="dimmed" mb="xs">
                            Selfie Photo
                          </Text>
                          <Image
                            src={photoPreview.selfiePhoto}
                            alt="Selfie"
                            className="max-h-24 w-auto mx-auto rounded shadow-sm"
                          />
                        </div>
                      )}
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

        {/* Error Alert */}
        {submitError && (
          <Alert
            color="red"
            mt="md"
            icon={<AlertCircle size={16} />}
            withCloseButton
            onClose={() => setSubmitError(null)}
          >
            <Text size="sm" fw={500}>
              Registration Error
            </Text>
            <Text size="sm" mt="xs">
              {submitError}
            </Text>
          </Alert>
        )}

        {/* Camera Modal */}
        <Modal
          opened={cameraModalOpen}
          onClose={() => {
            stopCamera();
            setCameraModalOpen(false);
          }}
          title={
            <div className="flex items-center gap-2">
              <Camera size={20} />
              Take Selfie Photo
            </div>
          }
          centered
          size="md"
        >
          <div className="text-center">
            <Alert color="blue" className="mb-4">
              <Text size="sm">
                📷 Position yourself clearly in the frame and look directly at
                the camera. Click the capture button when {`you're`} ready.
              </Text>
            </Alert>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-sm mx-auto rounded-lg mb-4 shadow-lg"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <Group justify="center" gap="md">
              <Button
                variant="light"
                onClick={() => {
                  stopCamera();
                  setCameraModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={takePhoto}
                style={{ backgroundColor: "#3D6B2C" }}
                leftSection={<Camera size={16} />}
              >
                Take Photo
              </Button>
            </Group>
          </div>
        </Modal>

        {isSubmitting && (
          <Box className="mt-4">
            <Progress value={100} animated color="#3D6B2C" />
            <Text size="sm" c="dimmed" ta="center" mt="xs">
              Submitting your application...
            </Text>
          </Box>
        )}
      </Paper>

      {/* Photo Camera Modal for ID Photos */}
      <CameraCapture
        opened={photoCameraOpen}
        onClose={() => {
          setPhotoCameraOpen(false);
          setCurrentPhotoField(null);
        }}
        onCapture={handlePhotoCapture}
        title={
          currentPhotoField === "frontSidePhoto"
            ? "Capture Front ID Photo"
            : currentPhotoField === "backSidePhoto"
            ? "Capture Back ID Photo"
            : "Take Photo"
        }
        facingMode="environment"
        instructionText={getPhotoCameraInstructions()}
        clickSoundUrl="/camera.mp3"
      />
    </Container>
  );
}
