'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '@/lib/api/services/fetchService';
import { useServices } from '@/hooks/useService';
import { ServiceTable } from './_components/ServiceTable';
import { ServiceForm } from './_components/ServiceForm';
import { ServiceFormValues } from '@/utils/validation/services.schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Service extends ServiceFormValues {
  id?: string;
}

export default function ManageServices() {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);

  // Fetch services
  const { data, isLoading, error } = useServices({});

  useEffect(() => {
    if (data?.services) {
      const uniqueCategories = Array.from(
        new Map(
          data.services
            .flatMap(service => service.categories)
            .map(category => [category.name, category])
        ).values()
      );
      setCategories(uniqueCategories);
    }
  }, [data]);

  const handleSubmit = async (data: ServiceFormValues) => {
    try {
      if (editingService) {
        // TODO: Implement update service API call
        console.log('Update service:', { ...data, id: editingService.id });
      } else {
        // TODO: Implement create service API call
        console.log('Create service:', data);
      }
      setEditingService(null);
      setOpen(false);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Service</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <ServiceForm
              editingService={editingService}
              categories={categories}
              onSubmit={handleSubmit}
              onCancel={() => {
                setEditingService(null);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services List</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceTable
            data={data?.services || []}
            isLoading={isLoading}
            error={error}
            limit={10}
            page={1}
            totalPages={1}
            totalItems={data?.services?.length || 0}
            categories={categories}
            searchFilters={{
              page: 1,
              limit: 10,
            }}
            onFilterChange={() => {}}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
