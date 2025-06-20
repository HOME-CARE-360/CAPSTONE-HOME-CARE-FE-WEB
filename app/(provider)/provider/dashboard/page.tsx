import { ChartAreaInteractive } from '@/components/chartAreaInteractive';
import { DataTable, columns } from '@/components/dataTable';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';

import data from './data.json';

export default function ProviderDashboard() {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} columns={columns} />
          </div>
        </div>
      </div>
    </>
  );
}
