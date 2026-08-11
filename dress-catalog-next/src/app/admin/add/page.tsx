import AdminShell from '@/components/admin/AdminShell';
import AdminDressForm from '@/components/admin/AdminDressForm';
import { requireAdminSession } from '@/lib/admin-auth';
import { createDress } from '../../actions';

export default async function AdminAddDressPage() {
  await requireAdminSession();
  return <AdminShell><AdminDressForm createDressAction={createDress} /></AdminShell>;
}
