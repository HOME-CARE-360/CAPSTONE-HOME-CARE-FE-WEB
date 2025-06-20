'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateService } from '@/hooks/useServiceManager';
import { useCategories } from '@/hooks/useCategory';
import { useUploadImage } from '@/hooks/useImage';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { Skeleton } from '@/components/ui/skeleton';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.number().min(0, 'Base price must be greater than 0'),
  virtualPrice: z.number().min(0, 'Virtual price must be greater than 0'),
  durationMinutes: z.number().min(1, 'Duration must be greater than 0'),
  categories: z.array(z.number()).default([]),
  images: z.array(z.string()).default([]),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface AutocompleteSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
  options: Array<{ id: number; name: string; parentCategory?: { name: string } | null }>;
  placeholder?: string;
}

function AutocompleteSelect({ value, onChange, options, placeholder }: AutocompleteSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ id: number; name: string }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize selected items from value prop
  useEffect(() => {
    if (value && value.length > 0) {
      const items = value
        .map(id => {
          const option = options.find(opt => opt.id === id);
          return option ? { id: option.id, name: option.name } : null;
        })
        .filter(Boolean) as Array<{ id: number; name: string }>;
      setSelectedItems(items);
    } else {
      setSelectedItems([]);
    }
  }, [value, options]);

  // Filter options based on search term
  const filteredOptions = options.filter(
    option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedItems.some(item => item.id === option.id)
  );

  // Handle option selection
  const handleSelect = (option: { id: number; name: string }) => {
    const newSelectedItems = [...selectedItems, option];
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems.map(item => item.id));
    setSearchTerm('');
    setIsOpen(false);
  };

  // Handle removing selected item
  const handleRemove = (id: number) => {
    const newSelectedItems = selectedItems.filter(item => item.id !== id);
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems.map(item => item.id));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="min-h-[40px] border border-input bg-background rounded-md px-3 py-2">
        {/* Selected items */}
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedItems.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm"
            >
              <span>{item.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="hover:bg-primary/80 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Search input */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedItems.length === 0 ? placeholder : 'Search categories...'}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-2 p-1 hover:bg-accent rounded-sm"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No categories found</div>
          ) : (
            <div>
              {filteredOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full px-3 py-2 text-left hover:bg-accent text-sm flex flex-col"
                >
                  <span className="font-medium">{option.name}</span>
                  {option.parentCategory && (
                    <span className="text-xs text-muted-foreground">
                      {option.parentCategory.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CreateServicePage() {
  const [images, setImages] = useState<string[]>([]);
  const { mutate: createService, isPending } = useCreateService();
  const { data: categoryData, isLoading: isCategoryLoading } = useCategories();
  const { mutate: uploadImage } = useUploadImage();

  // Show all categories
  const allCategories = categoryData?.categories || [];

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      virtualPrice: 0,
      durationMinutes: 30,
      categories: [],
      images: [],
    },
  });

  const onSubmit = (data: ServiceFormValues) => {
    createService({
      ...data,
      images,
      basePrice: Number(data.basePrice),
      virtualPrice: Number(data.virtualPrice),
      durationMinutes: Number(data.durationMinutes),
      categories: data.categories.map(String),
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      uploadImage(file, {
        onSuccess: data => {
          // Add the final URL to images array
          setImages(prev => [...prev, data.url]);
        },
      });
    } catch (error) {
      console.error('Image upload error:', error);
    }
  };

  if (isCategoryLoading) {
    return (
      <>
        <SiteHeader title="Quản lý dịch vụ" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Thêm dịch vụ" />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create New Service</CardTitle>
          <CardDescription>Add a new service to your business offerings</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter service name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your service (minimum 20 characters)"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" min={0} step={1000} {...field} />
                      </FormControl>
                      <FormDescription>Regular price for this service</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="virtualPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Virtual Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" min={0} step={1000} {...field} />
                      </FormControl>
                      <FormDescription>Optional discounted price</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" min={1} {...field} />
                    </FormControl>
                    <FormDescription>How long does this service take?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <FormControl>
                      <AutocompleteSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={allCategories}
                        placeholder="Select categories..."
                      />
                    </FormControl>
                    <FormDescription>
                      Search and select multiple categories for your service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Service Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={images}
                    onChange={setImages}
                    onRemove={url => setImages(images.filter(i => i !== url))}
                    onUpload={handleImageUpload}
                  />
                </FormControl>
                <FormDescription>Upload up to 5 images</FormDescription>
                <FormMessage />
              </FormItem>

              <CardFooter className="px-0 pb-0">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Creating...' : 'Create Service'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
