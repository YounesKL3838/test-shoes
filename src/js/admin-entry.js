/**
 * ShoeStyle Admin — نقطة الدخول المستقلة لصفحة لوحة التحكم (/admin.html)
 * مرتبطة مباشرة مع Supabase ومع واجهة المتجر (/index.html)
 */
import {
  adminState,
  initAdminFromSupabase,
  renderAdminDashboard,
  setupAdminEvents,
} from './admin.js';
import { subscribeRealtimeSync } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderAdminDashboard();
  setupAdminEvents();

  // جلب أحدث البيانات من Supabase عند فتح لوحة التحكم
  await initAdminFromSupabase();

  // الاستماع لأي طلب جديد أو تحديث قادم من واجهة المتجر (index.html) عبر Supabase Realtime
  subscribeRealtimeSync(async () => {
    adminState.reloadFromStorage();
    await initAdminFromSupabase();
    renderAdminDashboard();
  });
});
