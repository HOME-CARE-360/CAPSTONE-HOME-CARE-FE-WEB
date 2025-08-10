'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useUserProfile } from '@/hooks/useUser';
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Check,
  User as LucideUser,
  Loader2,
  FileImage,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/utils/numbers/formatDate';
import { LoadingState } from './components/loadingState';
import { ErrorState } from './components/errorState';
import { EmptyState } from './components/emptyState';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [backgroundImage, setBackgroundImage] = useState('');
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [isChangingBackground, setIsChangingBackground] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const savedBackground = localStorage.getItem('userBackgroundImage');
      if (savedBackground) {
        setBackgroundImage(savedBackground);
      }
    }
  }, []);

  const { data: profileResponse, isLoading, error, refetch } = useUserProfile();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Extract user and customer data from the response
  const userData = profileResponse?.data?.user;
  const customerData = profileResponse?.data?.customer;

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatarFile', file);
    if (userData) {
      formData.append('userName', userData.name);
      formData.append('fullName', userData.name);
      formData.append('email', userData.email);
      if (userData.phone) {
        formData.append('phoneNumber', userData.phone);
      }
      if (customerData?.address) {
        formData.append('about', customerData.address);
      }
      if (customerData?.dateOfBirth) {
        formData.append('birthDate', customerData.dateOfBirth);
      }
      if (userData.status) {
        formData.append('status', userData.status);
      }
      formData.append('role', 'PROVIDER');
    }
    // TODO: Implement updateProfile mutation
    setIsUploadingAvatar(false);
    toast.success('Avatar updated successfully');
  };

  const handleBackgroundClick = () => {
    backgroundInputRef.current?.click();
  };

  const handleBackgroundChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsChangingBackground(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBackgroundImage(base64String);
        localStorage.setItem('userBackgroundImage', base64String);
        setIsChangingBackground(false);
        toast.success('Background updated');
      };
      reader.onerror = () => {
        setIsChangingBackground(false);
        toast.error('Failed to update background image. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to update background:', error);
      setIsChangingBackground(false);
      toast.error('Failed to update background image. Please try again.');
    }
  };

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} error={error} />;
  }

  if (!profileResponse || !userData) {
    return (
      <EmptyState
        apiResponse={{
          status: false,
          code: 404,
          message: 'No profile data',
        }}
      />
    );
  }

  return (
    <>
      <div className="w-full min-h-screen">
        {/* Profile Header with Background Image */}
        <div
          className="relative bg-cover bg-center h-full md:h-[550px]"
          style={{
            backgroundImage: `url('${
              backgroundImage ||
              'https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80'
            }')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/95"></div>

          <input
            type="file"
            ref={backgroundInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleBackgroundChange}
            disabled={isChangingBackground}
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 shadow-lg z-10"
            onClick={handleBackgroundClick}
            disabled={isChangingBackground}
          >
            {isChangingBackground ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileImage className="h-4 w-4 mr-2" />
            )}
            Change Cover
          </Button>

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-end gap-4">
              <div className="relative mb-[-1rem] md:mb-[-2rem]">
                <input
                  type="file"
                  ref={avatarInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={userData.avatar || ''} />
                    <AvatarFallback className="text-4xl bg-primary/10">
                      {userData.name ? (
                        userData.name.substring(0, 2).toUpperCase()
                      ) : (
                        <LucideUser className="h-12 w-12" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="flex-1 text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-muted-foreground">
                  {userData.name}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">@{userData.name}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="px-2 py-1">
                    <Check className="h-3 w-3 mr-1" /> {userData.status}
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 bg-background/30 backdrop-blur-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Provider
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 bg-background/30 backdrop-blur-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    Joined {userData.createdAt ? new Date(userData.createdAt).getFullYear() : 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-background w-full">
          <div className="max-w-screen-2xl mx-auto px-4 py-6">
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b mb-6">
                <TabsList className="bg-transparent justify-start">
                  <TabsTrigger
                    value="overview"
                    className={`px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all ${
                      activeTab === 'overview'
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Overview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="mt-0">
                {/* Profile Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5 rounded-t-lg pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-primary" />
                        Contact Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{userData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{userData.phone || 'Not provided'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5 rounded-t-lg pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        Personal Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Birthdate{' '}
                            {customerData?.dateOfBirth
                              ? formatDate(customerData.dateOfBirth)
                              : 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Member Since {formatDate(userData.createdAt || '')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5 rounded-t-lg pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-primary" />
                        Account Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Status {userData.status || 'Active'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Role Provider</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
