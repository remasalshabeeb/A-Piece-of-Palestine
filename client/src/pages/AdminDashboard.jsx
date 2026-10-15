import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stack, Alert, Grid
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ExtensionIcon from '@mui/icons-material/Extension';
import QuizIcon from '@mui/icons-material/Quiz';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import logoImage from '../assets/logo.png';
import API from '../api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogType, setDialogType] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phoneNumber: '', role: 'user'
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في جلب بيانات لوحة التحكم (تأكد من صلاحيات الأدمن وتسجيل الدخول)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEdit = (user) => {
    setSelectedUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'user'
    });
    setDialogType('edit');
    setMessage('');
  };

  const openDetails = (user) => {
    setSelectedUser(user);
    setDialogType('details');
    setMessage('');
  };

  const closeDialog = () => {
    setDialogType('');
    setSelectedUser(null);
  };

  const handleEdit = async () => {
    if (!selectedUser) return;

    if (!form.name.trim() || !form.email.trim()) {
      setMessage('الاسم والبريد الإلكتروني مطلوبان.');
      return;
    }

    try {
      setSaving(true);
      const response = await API.put(`/user/${selectedUser._id}`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber
      });

      setUsers((previous) =>
        previous.map((user) =>
          user._id === selectedUser._id
            ? { ...user, ...response.data.updatedUser }
            : user
        )
      );
      setMessage('تم تحديث بيانات المستخدم بنجاح.');
      closeDialog();
    } catch (err) {
      setMessage(err.response?.data?.message || 'فشل تعديل بيانات المستخدم.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      const newRole = form.role;
      const response = await API.put(
        `/admin/users/${selectedUser._id}/role`,
        { role: newRole }
      );

      setUsers((previous) =>
        previous.map((user) =>
          user._id === selectedUser._id
            ? { ...user, ...response.data.updatedUser }
            : user
        )
      );
      setMessage('تم تحديث صلاحية المستخدم بنجاح.');
      closeDialog();
    } catch (err) {
      setMessage(err.response?.data?.message || 'فشل تغيير الصلاحية.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `هل أنتِ متأكدة من حذف حساب ${user.name}؟ لا يمكن التراجع عن هذه العملية.`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/admin/users/${user._id}`);
      setUsers((previous) =>
        previous.filter((item) => item._id !== user._id)
      );
      setMessage('تم حذف المستخدم بنجاح.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'فشل حذف المستخدم.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <Box sx={{
      backgroundColor: '#FDFBF7', minHeight: '100vh', width: '100%',
      overflowX: 'hidden', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', fontFamily: 'Cairo, sans-serif', direction: 'rtl'
    }}>
      {/* شريط زخرفي علوي */}
      <Box sx={{
        width: '100%', height: '14px',
        background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)'
      }} />

      <Box sx={{ width: '100%', px: { xs: 3, md: 6 }, py: 3, flex: 1, boxSizing: 'border-box' }}>
        
        {/* الترويسة العلوية */}
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 2, mb: 4, pb: 2, borderBottom: '1px solid #F0EBE1'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={logoImage}
              alt="قطعة من فلسطين"
              sx={{ width: '45px', height: '45px', objectFit: 'contain', borderRadius: '50%' }}
            />
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 'bold', color: '#2D5A27', fontSize: '18px' }}>
                لوحة تحكم الأدمن
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#8C9A92' }}>
                إدارة محتوى ومستخدمي "قطعة من فلسطين"
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: '8px' }}
          >
            تسجيل الخروج
          </Button>
        </Box>

        {message && (
          <Alert severity={message.includes('فشل') || message.includes('مطلوب') ? 'error' : 'success'}
            onClose={() => setMessage('')} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {/* كروت الإحصائيات */}
        <Grid container spacing={3} sx={{ mb: 4 }} direction="row-reverse">
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ color: '#8C9A92', fontSize: '12px' }}>إجمالي المستخدمين</Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: '#2C3E35' }}>
                  {users.length}
                </Typography>
              </Box>
              <Box sx={{ width: '50px', height: '50px', backgroundColor: '#EDF5ED', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PeopleIcon sx={{ color: '#2D5A27' }} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ color: '#8C9A92', fontSize: '12px' }}>المراحل المتاحة</Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: '#2C3E35' }}>6</Typography>
              </Box>
              <Box sx={{ width: '50px', height: '50px', backgroundColor: '#FDF8EC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ExtensionIcon sx={{ color: '#E2B842' }} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ color: '#8C9A92', fontSize: '12px' }}>إجمالي الأسئلة</Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: '#2C3E35' }}>45</Typography>
              </Box>
              <Box sx={{ width: '50px', height: '50px', backgroundColor: '#FDF2F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QuizIcon sx={{ color: '#D9534F' }} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ color: '#8C9A92', fontSize: '12px' }}>نسبة الإنجاز العام</Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: '#2C3E35' }}>78%</Typography>
              </Box>
              <Box sx={{ width: '50px', height: '50px', backgroundColor: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DashboardIcon sx={{ color: '#3B82F6' }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* عنوان القسم وأزرار الإجراءات */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2D5A27' }}>
            قائمة المستخدمين المسجلين في النظام
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button onClick={fetchUsers} variant="outlined" disabled={loading} sx={{ fontFamily: 'Cairo' }}>
              تحديث القائمة
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ backgroundColor: '#2D5A27', fontFamily: 'Cairo', borderRadius: '10px', '&:hover': { backgroundColor: '#1E3D1A' } }}
            >
              إضافة مرحلة جديدة
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* جدول البيانات */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #F0EBE1', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead sx={{ backgroundColor: '#F9F6F0' }}>
              <TableRow>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2D5A27' }}>اسم المستخدم</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2D5A27' }}>البريد الإلكتروني</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#2D5A27' }}>الصلاحية</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#2D5A27' }}>رقم الهاتف</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#2D5A27' }}>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress sx={{ color: '#2D5A27' }} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#8C9A92' }}>
                    لا يوجد مستخدمون مسجلون حالياً
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2C3E35' }}>{user.name}</TableCell>
                    <TableCell align="right">{user.email}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={user.role} 
                        color={user.role === 'admin' ? 'error' : 'success'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">{user.phoneNumber || 'غير متوفر'}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" spacing={0.5} flexWrap="wrap">
                        <Button size="small" onClick={() => openDetails(user)} startIcon={<VisibilityIcon />} sx={{ fontFamily: 'Cairo' }}>
                          التفاصيل
                        </Button>
                        <Button size="small" onClick={() => openEdit(user)} startIcon={<EditIcon />} sx={{ color: '#2D5A27', fontFamily: 'Cairo' }}>
                          تعديل
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(user)} startIcon={<DeleteIcon />} sx={{ fontFamily: 'Cairo' }}>
                          حذف
                        </Button>
                        <Button size="small" variant="outlined" sx={{ fontFamily: 'Cairo', fontSize: '11px' }}
                          onClick={() => {
                            setSelectedUser(user);
                            setForm({ ...form, role: user.role === 'admin' ? 'user' : 'admin' });
                            setDialogType('role');
                            setMessage('');
                          }}>
                          {user.role === 'admin' ? 'جعله مستخدمًا' : 'جعله مديرًا'}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>

      {/* التذييل السفلي */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', py: 2, width: '100%' }}>
        <Typography sx={{ color: '#8C9A92', fontSize: '12px' }}>لوحة التحكم الخاصة بمشروع قطعة من فلسطين</Typography>
        <FavoriteIcon sx={{ color: '#D9534F', fontSize: '14px' }} />
      </Box>

      {/* شريط زخرفي سفلي */}
      <Box sx={{
        width: '100%', height: '14px',
        background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)'
      }} />

      {/* النوافذ المنبثقة (Dialogs) لتعديل المستخدمين والصلاحيات */}
      <Dialog open={Boolean(dialogType)} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
          {dialogType === 'edit' ? 'تعديل بيانات المستخدم'
            : dialogType === 'role' ? 'تأكيد تغيير الصلاحية'
            : 'تفاصيل المستخدم'}
        </DialogTitle>

        <DialogContent>
          {dialogType === 'edit' && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField label="الاسم" fullWidth value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField label="البريد الإلكتروني" type="email" fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <TextField label="رقم الهاتف" fullWidth value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </Stack>
          )}

          {dialogType === 'role' && (
            <Box sx={{ pt: 1, fontFamily: 'Cairo' }}>
              هل أنت متأكدة من تغيير صلاحية المستخدم
              {' '}<Box component="span" sx={{ fontWeight: 'bold', color: '#2D5A27' }}>{selectedUser?.name}</Box>{' '}
              إلى {form.role === 'admin' ? 'مدير (Admin)' : 'مستخدم عادي (User)'}؟
            </Box>
          )}

          {dialogType === 'details' && selectedUser && (
            <Stack spacing={1.5} sx={{ pt: 1, fontFamily: 'Cairo' }}>
              <Typography><strong>الاسم:</strong> {selectedUser.name}</Typography>
              <Typography><strong>البريد الإلكتروني:</strong> {selectedUser.email}</Typography>
              <Typography><strong>الصلاحية:</strong> {selectedUser.role}</Typography>
              <Typography><strong>الهاتف:</strong> {selectedUser.phoneNumber || 'غير متوفر'}</Typography>
              <Typography><strong>معرّف الحساب:</strong> {selectedUser._id}</Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog} sx={{ fontFamily: 'Cairo' }}>إغلاق</Button>
          {dialogType === 'edit' && (
            <Button variant="contained" onClick={handleEdit} disabled={saving} sx={{ backgroundColor: '#2D5A27', fontFamily: 'Cairo' }}>
              {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </Button>
          )}
          {dialogType === 'role' && (
            <Button variant="contained" onClick={handleRoleChange} disabled={saving} sx={{ backgroundColor: '#2D5A27', fontFamily: 'Cairo' }}>
              {saving ? 'جارٍ الحفظ...' : 'تأكيد التغيير'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;