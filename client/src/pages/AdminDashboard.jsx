
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExtensionIcon from '@mui/icons-material/Extension';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import RateReviewIcon from '@mui/icons-material/RateReview';
import MessageIcon from '@mui/icons-material/Message';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InboxIcon from '@mui/icons-material/Inbox';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

import logoImage from '../assets/logo.png';
import API from '../api';

const COLORS = {
  green: '#2D5A27',
  darkGreen: '#1E3D1A',
  red: '#C84B31',
  gold: '#D4AF37',
  cream: '#FDFBF7',
  text: '#2C3E35',
  muted: '#8C9A92',
  border: '#F0EBE1',
  paleGreen: '#EDF5ED',
  paleGold: '#FDF8EC',
  paleRed: '#FDF2F2'
};

const ROLE_LABELS = {
  admin: 'أدمن',
  contentManager: 'مدير محتوى',
  user: 'مستخدم'
};

const ROLE_COLORS = {
  admin: 'error',
  contentManager: 'warning',
  user: 'success'
};

const EMPTY_FORM = {
  name: '',
  email: '',
  phoneNumber: '',
  role: 'user'
};

const headerCellSx = {
  fontWeight: 'bold',
  color: COLORS.green,
  whiteSpace: 'nowrap'
};

const stripeSx = {
  width: '100%',
  height: 10,
  flexShrink: 0,
  background:
    'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)'
};

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error;
  }

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (err?.response?.status) {
    return `${fallback} (HTTP ${err.response.status})`;
  }

  return err?.message || fallback;
};

const normalizeList = (data, keys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return null;
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // General notifications
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Users
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User dialogs
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogType, setDialogType] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Content revision requests
  const [revisions, setRevisions] = useState([]);
  const [revisionsLoading, setRevisionsLoading] = useState(false);
  const [revisionsError, setRevisionsError] = useState('');
  const [reviewDialog, setReviewDialog] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  // Contact messages
  const [contactMessages, setContactMessages] = useState([]);
  const [contactMessagesLoading, setContactMessagesLoading] =
    useState(false);
  const [contactMessagesError, setContactMessagesError] = useState('');
  const [reviewingContactId, setReviewingContactId] = useState(null);
  const [contactResponses, setContactResponses] = useState({});

  // Ratings
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsError, setRatingsError] = useState('');
  const [reviewingRatingId, setReviewingRatingId] = useState(null);
  const [ratingResponses, setRatingResponses] = useState({});

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  // =========================================================
  // USERS
  // =========================================================

  const fetchUsers = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError('');

      const response = await API.get('/admin/users');
      const receivedUsers = normalizeList(response.data, ['users', 'data']);

      if (!receivedUsers) {
        throw new Error(
          'استجابة الخادم لا تحتوي على قائمة المستخدمين المتوقعة.'
        );
      }

      setUsers(receivedUsers);
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        setError('انتهت صلاحية الدخول. سجّلي الدخول مجددًا.');
      } else if (status === 403) {
        setError('هذا الحساب لا يملك صلاحية إدارة المستخدمين.');
      } else {
        setError(getErrorMessage(err, 'تعذر تحميل المستخدمين.'));
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  // =========================================================
  // CONTENT REVIEWS
  // =========================================================

  const fetchRevisions = useCallback(async () => {
    try {
      setRevisionsLoading(true);
      setRevisionsError('');

      const response = await API.get('/content-revisions/pending');
      const items = normalizeList(response.data, [
        'revisions',
        'requests',
        'data'
      ]);

      if (!items) {
        throw new Error(
          'استجابة الخادم لا تحتوي على قائمة طلبات المراجعة المتوقعة.'
        );
      }

      setRevisions(items);
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        setRevisionsError('انتهت صلاحية الدخول. سجّلي الدخول مجددًا.');
      } else if (status === 403) {
        setRevisionsError('لا تملكين صلاحية مراجعة المحتوى بهذا الحساب.');
      } else {
        setRevisionsError(
          getErrorMessage(err, 'تعذر تحميل طلبات المراجعة.')
        );
      }
    } finally {
      setRevisionsLoading(false);
    }
  }, []);

  const submitRevisionReview = async (decision) => {
    if (!reviewDialog?._id || reviewingId) return;

    if (!['approve', 'reject'].includes(decision)) {
      showMessage('قرار المراجعة غير صحيح.', 'error');
      return;
    }

    const revisionId = reviewDialog._id;

    try {
      setReviewingId(revisionId);
      setRevisionsError('');

      await API.patch(`/content-revisions/${revisionId}/review`, {
        decision: decision === 'approve' ? 'approved' : 'rejected',
        comment: reviewComment.trim()
      });

      setReviewDialog(null);
      setReviewComment('');

      showMessage(
        decision === 'approve'
          ? 'تمت الموافقة على الطلب بنجاح.'
          : 'تم رفض الطلب بنجاح.'
      );

      await fetchRevisions();
    } catch (err) {
      console.error('Content revision review failed:', err.response?.data || err);

      showMessage(
        getErrorMessage(err, 'تعذرت مراجعة الطلب.'),
        'error'
      );
    } finally {
      setReviewingId(null);
    }
  };

  const closeReviewDialog = () => {
    if (reviewingId) return;

    setReviewDialog(null);
    setReviewComment('');
  };

  // =========================================================
  // CONTACT MESSAGES
  // =========================================================

  const fetchContactMessages = useCallback(async () => {
    try {
      setContactMessagesLoading(true);
      setContactMessagesError('');

      const response = await API.get('/admin/contact/pending');
      const receivedMessages = normalizeList(response.data, [
        'messages',
        'contacts',
        'data'
      ]);

      if (!receivedMessages) {
        throw new Error(
          'استجابة الخادم لا تحتوي على قائمة الرسائل المتوقعة.'
        );
      }

      setContactMessages(receivedMessages);
    } catch (err) {
      console.error('Fetch contact messages failed:', err.response?.data || err);

      const status = err.response?.status;

      if (status === 401) {
        setContactMessagesError(
          'انتهت صلاحية الدخول أو رمز الدخول غير صالح. سجّلي الدخول مجددًا.'
        );
      } else if (status === 403) {
        setContactMessagesError(
          'هذا الحساب لا يملك صلاحية الاطلاع على رسائل المستخدمين.'
        );
      } else {
        setContactMessagesError(
          getErrorMessage(err, 'تعذر تحميل رسائل المستخدمين.')
        );
      }
    } finally {
      setContactMessagesLoading(false);
    }
  }, []);

  const handleContactMessageReview = async (contactId, status) => {
    if (reviewingContactId) return;

    if (!['approved', 'rejected'].includes(status)) {
      showMessage('حالة المراجعة غير صحيحة.', 'error');
      return;
    }

    try {
      setReviewingContactId(contactId);
      setContactMessagesError('');

      await API.patch(`/admin/contact/${contactId}/review`, {
        status,
        adminResponse: (contactResponses[contactId] || '').trim()
      });

      setContactMessages((previous) =>
        previous.filter((item) => item._id !== contactId)
      );

      setContactResponses((previous) => {
        const updated = { ...previous };
        delete updated[contactId];
        return updated;
      });

      showMessage(
        status === 'approved'
          ? 'تمت الموافقة على الرسالة.'
          : 'تم رفض الرسالة.'
      );

      await fetchContactMessages();
    } catch (err) {
      console.error('Review contact message failed:', err.response?.data || err);

      showMessage(
        getErrorMessage(err, 'تعذّرت مراجعة الرسالة.'),
        'error'
      );
    } finally {
      setReviewingContactId(null);
    }
  };

  // =========================================================
  // RATINGS
  // =========================================================

  const fetchRatings = useCallback(async () => {
    try {
      setRatingsLoading(true);
      setRatingsError('');

      const response = await API.get('/ratings/pending');
      const receivedRatings = normalizeList(response.data, [
        'ratings',
        'data'
      ]);

      if (!receivedRatings) {
        throw new Error(
          'استجابة الخادم لا تحتوي على قائمة التقييمات المتوقعة.'
        );
      }

      setRatings(receivedRatings);
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        setRatingsError('انتهت صلاحية الدخول. سجّلي الدخول مجددًا.');
      } else if (status === 403) {
        setRatingsError('هذا الحساب لا يملك صلاحية مراجعة التقييمات.');
      } else {
        setRatingsError(
          getErrorMessage(err, 'تعذر تحميل التقييمات.')
        );
      }
    } finally {
      setRatingsLoading(false);
    }
  }, []);

  const handleRatingReview = async (ratingId, status) => {
    if (reviewingRatingId) return;

    if (!['approved', 'rejected'].includes(status)) {
      showMessage('حالة مراجعة التقييم غير صحيحة.', 'error');
      return;
    }

    try {
      setReviewingRatingId(ratingId);
      setRatingsError('');

      await API.patch(`/ratings/${ratingId}/review`, {
  status,
  adminResponse: (ratingResponses[ratingId] || '').trim()
});

      setRatings((previous) =>
        previous.filter((rating) => rating._id !== ratingId)
      );

      setRatingResponses((previous) => {
        const updated = { ...previous };
        delete updated[ratingId];
        return updated;
      });

      showMessage(
        status === 'approved'
          ? 'تمت الموافقة على التقييم.'
          : 'تم رفض التقييم.'
      );

      await fetchRatings();
    } catch (err) {
      console.error('Review rating failed:', err.response?.data || err);

      showMessage(
        getErrorMessage(err, 'تعذّرت مراجعة التقييم.'),
        'error'
      );
    } finally {
      setReviewingRatingId(null);
    }
  };

  // =========================================================
  // EFFECTS
  // =========================================================

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (activeSection === 'reviews') fetchRevisions();
  }, [activeSection, fetchRevisions]);

  useEffect(() => {
    if (activeSection === 'messages') fetchContactMessages();
  }, [activeSection, fetchContactMessages]);

  useEffect(() => {
    if (activeSection === 'ratings') fetchRatings();
  }, [activeSection, fetchRatings]);

  // =========================================================
  // USER DIALOGS AND ACTIONS
  // =========================================================

  const closeDialog = () => {
    if (saving) return;

    setDialogType('');
    setSelectedUser(null);
    setForm(EMPTY_FORM);
  };

  const openDetails = (user) => {
    setSelectedUser(user);
    setDialogType('details');
    setMessage('');
  };

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

  const openRoleDialog = (user) => {
    setSelectedUser(user);

    setForm({
      ...EMPTY_FORM,
      role: user.role || 'user'
    });

    setDialogType('role');
    setMessage('');
  };

  const handleEdit = async () => {
    if (!selectedUser || saving) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email) {
      showMessage('الاسم والبريد الإلكتروني مطلوبان.', 'error');
      return;
    }

    try {
      setSaving(true);

      await API.put(`/user/${selectedUser._id}`, {
        name,
        email,
        phoneNumber: form.phoneNumber.trim()
      });

      setDialogType('');
      setSelectedUser(null);
      setForm(EMPTY_FORM);

      showMessage('تم تعديل بيانات المستخدم بنجاح.');
      await fetchUsers(false);
    } catch (err) {
      console.error('Update user failed:', err.response?.data || err);

      showMessage(
        getErrorMessage(err, 'تعذر تعديل المستخدم.'),
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || saving) return;

    if (!['admin', 'contentManager', 'user'].includes(form.role)) {
      showMessage('الصلاحية المختارة غير صحيحة.', 'error');
      return;
    }

    if (selectedUser.role === form.role) {
      showMessage('هذه هي صلاحية المستخدم الحالية.', 'error');
      return;
    }

    try {
      setSaving(true);

      await API.put(`/admin/users/${selectedUser._id}/role`, {
        role: form.role
      });

      setDialogType('');
      setSelectedUser(null);
      setForm(EMPTY_FORM);

      showMessage('تم تحديث صلاحية المستخدم بنجاح.');
      await fetchUsers(false);
    } catch (err) {
      console.error('Change user role failed:', err.response?.data || err);

      showMessage(
        getErrorMessage(err, 'تعذر تغيير صلاحية المستخدم.'),
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `هل تريدين حذف حساب "${user.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/admin/users/${user._id}`);

      setUsers((previous) =>
        previous.filter((item) => item._id !== user._id)
      );

      showMessage('تم حذف المستخدم بنجاح.');
    } catch (err) {
      console.error('Delete user failed:', err.response?.data || err);

      showMessage(
        getErrorMessage(err, 'تعذر حذف المستخدم.'),
        'error'
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const adminCount = users.filter(
    (user) => user.role === 'admin'
  ).length;

  const managerCount = users.filter(
    (user) => user.role === 'contentManager'
  ).length;

  const regularUserCount = users.filter(
    (user) => user.role === 'user'
  ).length;

  const statCards = [
    {
      title: 'إجمالي المستخدمين',
      value: users.length,
      icon: <PeopleIcon />,
      color: COLORS.green,
      background: COLORS.paleGreen
    },
    {
      title: 'الأدمن',
      value: adminCount,
      icon: <AdminPanelSettingsIcon />,
      color: COLORS.red,
      background: COLORS.paleRed
    },
    {
      title: 'مديرو المحتوى',
      value: managerCount,
      icon: <ExtensionIcon />,
      color: '#9A7410',
      background: COLORS.paleGold
    },
    {
      title: 'المستخدمون',
      value: regularUserCount,
      icon: <DashboardIcon />,
      color: '#3B82F6',
      background: '#EFF6FF'
    }
  ];

  // =========================================================
  // SIDEBAR
  // =========================================================

  const sidebarItems = [
    { id: 'home', label: 'الرئيسية', icon: <HomeIcon /> },
    { id: 'users', label: 'إدارة المستخدمين', icon: <PeopleIcon /> },
    { id: 'reviews', label: 'مراجعة الطلبات', icon: <RateReviewIcon /> },
    { id: 'messages', label: 'رسائل المستخدمين', icon: <MessageIcon /> },
    { id: 'ratings', label: 'تقييمات المستخدمين', icon: <FavoriteIcon /> }
  ];

  const navigateTo = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
    setMessage('');
  };

  const renderSidebar = () => (
    <>
      {sidebarOpen && (
        <Box
          onClick={() => setSidebarOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            bgcolor: 'rgba(0,0,0,0.35)',
            display: { xs: 'block', md: 'none' }
          }}
        />
      )}

      <Box
        component="aside"
        sx={{
          position: { xs: 'fixed', md: 'relative' },
          top: 0,
          right: 0,
          zIndex: 1201,
          width: 260,
          flex: '0 0 260px',
          alignSelf: 'stretch',
          boxSizing: 'border-box',
          height: { xs: '100dvh', md: 'auto' },
          minHeight: { xs: '100dvh', md: '100vh' },
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: COLORS.green,
          color: '#FFFFFF',
          transform: {
            xs: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
            md: 'translateX(0)'
          },
          transition: 'transform 0.25s ease'
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3, p: 1 }}
        >
          <Box>
            <Typography fontWeight="bold" fontSize={18}>
              قطعة من فلسطين
            </Typography>
            <Typography fontSize={12} sx={{ opacity: 0.75 }}>
              لوحة المدير العام
            </Typography>
          </Box>

          <IconButton
            aria-label="إغلاق القائمة"
            onClick={() => setSidebarOpen(false)}
            sx={{
              color: '#FFFFFF',
              display: { xs: 'inline-flex', md: 'none' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider
          sx={{
            borderColor: 'rgba(255,255,255,0.2)',
            mb: 2
          }}
        />

        <Stack spacing={1}>
          {sidebarItems.map((item) => {
            const selected = activeSection === item.id;

            return (
              <Button
                key={item.id}
                fullWidth
                startIcon={item.icon}
                onClick={() => navigateTo(item.id)}
                sx={{
                  justifyContent: 'flex-start',
                  gap: 1,
                  px: 2,
                  py: 1.4,
                  color: '#FFFFFF',
                  fontFamily: 'Cairo, sans-serif',
                  fontWeight: selected ? 'bold' : 'normal',
                  bgcolor: selected
                    ? 'rgba(255,255,255,0.16)'
                    : 'transparent',
                  borderRight: selected
                    ? `4px solid ${COLORS.gold}`
                    : '4px solid transparent',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.12)'
                  },
                  '& .MuiButton-startIcon': {
                    marginLeft: 1,
                    marginRight: 0
                  }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Typography
          sx={{
            fontSize: 11,
            textAlign: 'center',
            opacity: 0.7,
            py: 2
          }}
        >
          إدارة آمنة للمحتوى والمستخدمين
        </Typography>
      </Box>
    </>
  );

  // =========================================================
  // HOME
  // =========================================================

  const renderHome = () => (
    <>
      <Typography
        variant="h5"
        sx={{ color: COLORS.green, fontWeight: 'bold', mb: 1 }}
      >
        الرئيسية
      </Typography>

      <Typography sx={{ color: COLORS.muted, mb: 3 }}>
        نظرة عامة على حسابات مشروع قطعة من فلسطين.
      </Typography>

      {error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchUsers()}
              disabled={loading}
            >
              إعادة المحاولة
            </Button>
          }
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))'
          },
          gap: 3
        }}
      >
        {statCards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              p: 3,
              minWidth: 0,
              boxSizing: 'border-box',
              borderRadius: '16px',
              border: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              bgcolor: '#FFFFFF'
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: COLORS.muted, fontSize: 12 }}>
                {card.title}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontWeight: 'bold',
                  fontSize: 26,
                  color: COLORS.text
                }}
              >
                {loading ? '—' : card.value}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 50,
                height: 50,
                flexShrink: 0,
                bgcolor: card.background,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color
              }}
            >
              {card.icon}
            </Box>
          </Paper>
        ))}
      </Box>

      {[
        {
          title: 'طلبات مراجعة المحتوى',
          description:
            'انتقلي إلى مراجعة الطلبات للاطلاع على المراحل والأسئلة المعلّقة.',
          button: 'عرض الطلبات',
          section: 'reviews',
          outlined: false
        },
        {
          title: 'رسائل المستخدمين',
          description: 'الاطلاع على رسائل التواصل الواردة ومراجعتها.',
          button: 'عرض الرسائل',
          section: 'messages',
          outlined: true
        },
        {
          title: 'تقييمات المستخدمين',
          description:
            'مراجعة تقييمات المستخدمين والموافقة على المناسب منها قبل نشره.',
          button: 'عرض التقييمات',
          section: 'ratings',
          outlined: true
        }
      ].map((item) => (
        <Paper
          key={item.section}
          elevation={0}
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            border: `1px solid ${COLORS.border}`
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography fontWeight="bold" sx={{ color: COLORS.green }}>
                {item.title}
              </Typography>
              <Typography
                sx={{ color: COLORS.muted, fontSize: 13, mt: 0.5 }}
              >
                {item.description}
              </Typography>
            </Box>

            <Button
              variant={item.outlined ? 'outlined' : 'contained'}
              onClick={() => navigateTo(item.section)}
              sx={{
                bgcolor: item.outlined ? 'transparent' : COLORS.green,
                borderColor: COLORS.green,
                color: item.outlined ? COLORS.green : '#FFFFFF',
                fontFamily: 'Cairo, sans-serif',
                '&:hover': {
                  bgcolor: item.outlined ? COLORS.paleGreen : COLORS.darkGreen
                }
              }}
            >
              {item.button}
            </Button>
          </Stack>
        </Paper>
      ))}
    </>
  );

  // =========================================================
  // USERS PAGE
  // =========================================================

  const renderUsers = () => (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', color: COLORS.green }}
          >
            إدارة المستخدمين
          </Typography>
          <Typography
            sx={{ color: COLORS.muted, fontSize: 13, mt: 0.5 }}
          >
            إدارة الحسابات والأدوار والصلاحيات.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchUsers()}
          disabled={loading}
          sx={{
            borderColor: COLORS.green,
            color: COLORS.green,
            fontFamily: 'Cairo, sans-serif'
          }}
        >
          تحديث القائمة
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${COLORS.border}`,
          overflowX: 'auto'
        }}
      >
        <Table sx={{ minWidth: 760 }}>
          <TableHead sx={{ bgcolor: '#F9F6F0' }}>
            <TableRow>
              <TableCell align="right" sx={headerCellSx}>
                اسم المستخدم
              </TableCell>
              <TableCell align="right" sx={headerCellSx}>
                البريد الإلكتروني
              </TableCell>
              <TableCell align="center" sx={headerCellSx}>
                الصلاحية
              </TableCell>
              <TableCell align="center" sx={headerCellSx}>
                رقم الهاتف
              </TableCell>
              <TableCell align="center" sx={headerCellSx}>
                الإجراءات
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <CircularProgress sx={{ color: COLORS.green }} />
                  <Typography sx={{ mt: 1, color: COLORS.muted }}>
                    جارٍ تحميل المستخدمين...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 5, color: COLORS.muted }}
                >
                  لا يوجد مستخدمون لعرضهم.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 'bold', color: COLORS.text }}
                  >
                    {user.name || 'بدون اسم'}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {user.email || 'غير متوفر'}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={ROLE_LABELS[user.role] || user.role || 'غير محدد'}
                      color={ROLE_COLORS[user.role] || 'default'}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">
                    {user.phoneNumber || 'غير متوفر'}
                  </TableCell>

                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        py: 0.5
                      }}
                    >
                      <Tooltip title="التفاصيل">
                        <IconButton
                          size="small"
                          onClick={() => openDetails(user)}
                          aria-label="عرض التفاصيل"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="تعديل البيانات">
                        <IconButton
                          size="small"
                          onClick={() => openEdit(user)}
                          aria-label="تعديل المستخدم"
                          sx={{ color: COLORS.green }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="حذف المستخدم">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(user)}
                          aria-label="حذف المستخدم"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openRoleDialog(user)}
                        sx={{
                          fontFamily: 'Cairo, sans-serif',
                          fontSize: 11,
                          borderColor: COLORS.green,
                          color: COLORS.green
                        }}
                      >
                        الصلاحية
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  // =========================================================
  // CONTENT REVIEWS PAGE
  // =========================================================

  const renderReviews = () => (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ color: COLORS.green, fontWeight: 'bold' }}
          >
            مراجعة طلبات المحتوى
          </Typography>
          <Typography
            sx={{ color: COLORS.muted, mt: 0.5, fontSize: 13 }}
          >
            مراجعة المراحل والأسئلة المقدمة من مديري المحتوى.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRevisions}
          disabled={revisionsLoading}
          sx={{ borderColor: COLORS.green, color: COLORS.green }}
        >
          تحديث الطلبات
        </Button>
      </Stack>

      {revisionsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {revisionsError}
        </Alert>
      )}

      {revisionsLoading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress sx={{ color: COLORS.green }} />
          <Typography sx={{ mt: 2, color: COLORS.muted }}>
            جارٍ تحميل الطلبات...
          </Typography>
        </Box>
      ) : revisions.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 3
          }}
        >
          <PendingActionsIcon
            sx={{ fontSize: 48, color: COLORS.gold, mb: 1 }}
          />
          <Typography fontWeight="bold">
            لا توجد طلبات معلّقة
          </Typography>
          <Typography
            sx={{ color: COLORS.muted, mt: 1, fontSize: 13 }}
          >
            ستظهر هنا طلبات المراحل والأسئلة عندما يرسلها مدير المحتوى.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {revisions.map((revision) => {
            const data = revision.proposedData || {};
            const title = data.question || data.title || 'طلب محتوى جديد';
            const isQuestion = revision.contentType === 'question';

            return (
              <Paper
                key={revision._id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${COLORS.border}`
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                  spacing={2}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 1, flexWrap: 'wrap', rowGap: 1 }}
                    >
                      <Chip
                        size="small"
                        label={isQuestion ? 'سؤال' : 'مرحلة'}
                        sx={{
                          bgcolor: COLORS.paleGold,
                          color: COLORS.green
                        }}
                      />
                      <Chip
                        size="small"
                        label={revision.action === 'update' ? 'تعديل' : 'إنشاء'}
                        variant="outlined"
                      />
                      <Chip size="small" label="معلّق" color="warning" />
                    </Stack>

                    <Typography
                      fontWeight="bold"
                      sx={{
                        mb: 1,
                        overflowWrap: 'anywhere',
                        color: COLORS.text
                      }}
                    >
                      {title}
                    </Typography>

                    <Typography
                      sx={{
                        color: COLORS.muted,
                        fontSize: 13,
                        overflowWrap: 'anywhere',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {data.description || ''}
                    </Typography>

                    <Typography sx={{ mt: 2, fontSize: 12 }}>
                      مقدم الطلب: {revision.submittedBy?.name || 'غير معروف'}
                    </Typography>
                    <Typography sx={{ color: COLORS.muted, fontSize: 12 }}>
                      البريد: {revision.submittedBy?.email || 'غير متوفر'}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    disabled={Boolean(reviewingId)}
                    onClick={() => {
                      setReviewDialog(revision);
                      setReviewComment('');
                    }}
                    sx={{
                      bgcolor: COLORS.green,
                      fontFamily: 'Cairo, sans-serif',
                      flexShrink: 0,
                      '&:hover': { bgcolor: COLORS.darkGreen }
                    }}
                  >
                    مراجعة الطلب
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </>
  );

  // =========================================================
  // CONTACT MESSAGES PAGE
  // =========================================================

  const renderMessages = () => (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ color: COLORS.green, fontWeight: 'bold' }}
          >
            رسائل المستخدمين
          </Typography>
          <Typography sx={{ color: COLORS.muted, mt: 0.5, fontSize: 13 }}>
            الرسائل الواردة من نماذج التواصل.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchContactMessages}
          disabled={contactMessagesLoading}
          sx={{ borderColor: COLORS.green, color: COLORS.green }}
        >
          تحديث الرسائل
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${COLORS.border}`
        }}
      >
        <Typography sx={{ color: COLORS.muted, fontSize: 13 }}>
          الرسائل المعلّقة
        </Typography>
        <Typography
          sx={{ color: COLORS.green, fontSize: 28, fontWeight: 'bold' }}
        >
          {contactMessages.length}
        </Typography>
      </Paper>

      {contactMessagesError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchContactMessages}
              disabled={contactMessagesLoading}
            >
              إعادة المحاولة
            </Button>
          }
        >
          {contactMessagesError}
        </Alert>
      )}

      {contactMessagesLoading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress sx={{ color: COLORS.green }} />
          <Typography sx={{ mt: 2, color: COLORS.muted }}>
            جارٍ تحميل الرسائل...
          </Typography>
        </Box>
      ) : contactMessages.length === 0 && !contactMessagesError ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${COLORS.border}`
          }}
        >
          <InboxIcon sx={{ fontSize: 48, color: COLORS.gold, mb: 1 }} />
          <Typography fontWeight="bold">لا توجد رسائل معلّقة</Typography>
          <Typography sx={{ color: COLORS.muted, mt: 1, fontSize: 13 }}>
            ستظهر هنا الرسائل الجديدة التي يرسلها الزوار.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {contactMessages.map((contact) => (
            <Paper
              key={contact._id}
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                minWidth: 0
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}
                  >
                    <Chip
                      label="رسالة جديدة"
                      size="small"
                      sx={{
                        bgcolor: COLORS.paleGold,
                        color: COLORS.green
                      }}
                    />
                    <Chip label="معلّقة" size="small" color="warning" />
                  </Stack>

                  <Typography
                    sx={{
                      color: COLORS.green,
                      fontWeight: 'bold',
                      fontSize: 18,
                      overflowWrap: 'anywhere'
                    }}
                  >
                    {contact.subject || 'بدون عنوان'}
                  </Typography>

                  <Typography sx={{ mt: 1, fontWeight: 'bold' }}>
                    {contact.name || 'بدون اسم'}
                  </Typography>

                  <Typography
                    sx={{
                      color: COLORS.muted,
                      fontSize: 13,
                      overflowWrap: 'anywhere'
                    }}
                  >
                    {contact.email || 'لا يوجد بريد إلكتروني'}
                  </Typography>

                  <Typography
                    sx={{ color: COLORS.muted, fontSize: 12, mt: 0.5 }}
                  >
                    تاريخ الإرسال:{' '}
                    {contact.createdAt
                      ? new Date(contact.createdAt).toLocaleString('ar-JO')
                      : 'غير متوفر'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    sx={{
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      lineHeight: 1.9
                    }}
                  >
                    {contact.message}
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="رد أو ملاحظة إدارية (اختياري)"
                    placeholder="اكتبي ردًا أو ملاحظة..."
                    value={contactResponses[contact._id] || ''}
                    disabled={Boolean(reviewingContactId)}
                    onChange={(event) =>
                      setContactResponses((previous) => ({
                        ...previous,
                        [contact._id]: event.target.value
                      }))
                    }
                    sx={{ mt: 3 }}
                  />
                </Box>

                <Stack
                  direction={{ xs: 'row', sm: 'column' }}
                  spacing={1}
                  sx={{ flexShrink: 0 }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    disabled={Boolean(reviewingContactId)}
                    onClick={() =>
                      handleContactMessageReview(contact._id, 'approved')
                    }
                  >
                    {reviewingContactId === contact._id
                      ? 'جارٍ الحفظ...'
                      : 'موافقة'}
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    disabled={Boolean(reviewingContactId)}
                    onClick={() =>
                      handleContactMessageReview(contact._id, 'rejected')
                    }
                  >
                    رفض
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </>
  );

  // =========================================================
  // RATINGS PAGE
  // =========================================================

  const renderRatings = () => (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ color: COLORS.green, fontWeight: 'bold' }}
          >
            تقييمات المستخدمين
          </Typography>
          <Typography sx={{ color: COLORS.muted, mt: 0.5, fontSize: 13 }}>
            مراجعة التقييمات قبل إظهارها للعامة.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRatings}
          disabled={ratingsLoading}
          sx={{ borderColor: COLORS.green, color: COLORS.green }}
        >
          تحديث التقييمات
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${COLORS.border}`
        }}
      >
        <Typography sx={{ color: COLORS.muted, fontSize: 13 }}>
          التقييمات التي تنتظر المراجعة
        </Typography>
        <Typography
          sx={{ color: COLORS.green, fontSize: 28, fontWeight: 'bold' }}
        >
          {ratings.length}
        </Typography>
      </Paper>

      {ratingsError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchRatings}
              disabled={ratingsLoading}
            >
              إعادة المحاولة
            </Button>
          }
        >
          {ratingsError}
        </Alert>
      )}

      {ratingsLoading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress sx={{ color: COLORS.green }} />
          <Typography sx={{ mt: 2, color: COLORS.muted }}>
            جارٍ تحميل التقييمات...
          </Typography>
        </Box>
      ) : ratings.length === 0 && !ratingsError ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${COLORS.border}`
          }}
        >
          <RateReviewIcon sx={{ fontSize: 48, color: COLORS.gold, mb: 1 }} />
          <Typography fontWeight="bold">
            لا توجد تقييمات معلّقة
          </Typography>
          <Typography sx={{ color: COLORS.muted, mt: 1, fontSize: 13 }}>
            ستظهر هنا التقييمات الجديدة التي يرسلها المستخدمون.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {ratings.map((rating) => {
            const user =
              rating.userId && typeof rating.userId === 'object'
                ? rating.userId
                : null;

            const stars = Math.min(
              5,
              Math.max(0, Number(rating.rating) || 0)
            );

            return (
              <Paper
                key={rating._id}
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  border: `1px solid ${COLORS.border}`,
                  minWidth: 0
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                  spacing={2}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 1.5, flexWrap: 'wrap', rowGap: 1 }}
                    >
                      <Chip
                        label="تقييم جديد"
                        size="small"
                        sx={{
                          bgcolor: COLORS.paleGold,
                          color: COLORS.green
                        }}
                      />
                      <Chip label="معلّق" size="small" color="warning" />
                    </Stack>

                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        color: COLORS.text,
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {user?.name || 'مستخدم'}
                    </Typography>

                    {user?.email && (
                      <Typography
                        sx={{
                          color: COLORS.muted,
                          fontSize: 13,
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {user.email}
                      </Typography>
                    )}

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{ mt: 1.5 }}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <FavoriteIcon
                          key={index}
                          sx={{
                            fontSize: 22,
                            color: index < stars ? COLORS.red : '#D9D9D9'
                          }}
                        />
                      ))}

                      <Typography
                        sx={{
                          mr: 1,
                          color: COLORS.muted,
                          fontSize: 13
                        }}
                      >
                        ({stars}/5)
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{
                        mt: 2,
                        lineHeight: 1.9,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {rating.comment || 'لم يكتب المستخدم تعليقًا.'}
                    </Typography>

                    <Typography
                      sx={{ color: COLORS.muted, fontSize: 12, mt: 1.5 }}
                    >
                      تاريخ الإرسال:{' '}
                      {rating.createdAt
                        ? new Date(rating.createdAt).toLocaleString('ar-JO')
                        : 'غير متوفر'}
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="رد الإدارة (اختياري)"
                      placeholder="اكتبي ردًا عند الحاجة..."
                      value={ratingResponses[rating._id] || ''}
                      disabled={Boolean(reviewingRatingId)}
                      onChange={(event) =>
                        setRatingResponses((previous) => ({
                          ...previous,
                          [rating._id]: event.target.value
                        }))
                      }
                      sx={{ mt: 2 }}
                    />
                  </Box>

                  <Stack
                    direction={{ xs: 'row', sm: 'column' }}
                    spacing={1}
                    sx={{ flexShrink: 0 }}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      disabled={Boolean(reviewingRatingId)}
                      onClick={() =>
                        handleRatingReview(rating._id, 'approved')
                      }
                    >
                      {reviewingRatingId === rating._id
                        ? 'جارٍ الحفظ...'
                        : 'موافقة'}
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      disabled={Boolean(reviewingRatingId)}
                      onClick={() =>
                        handleRatingReview(rating._id, 'rejected')
                      }
                    >
                      رفض
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </>
  );

  // =========================================================
  // MAIN RENDER
  // =========================================================

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        bgcolor: COLORS.cream,
        color: COLORS.text,
        fontFamily: 'Cairo, sans-serif'
      }}
    >
      <Box sx={stripeSx} />

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'stretch',
          minWidth: 0
        }}
      >
        {renderSidebar()}

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            width: { xs: '100%', md: 'calc(100% - 260px)' },
            maxWidth: 1600,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{
              mb: 3,
              pb: 2,
              borderBottom: `1px solid ${COLORS.border}`
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ minWidth: 0 }}
            >
              <Box
                component="img"
                src={logoImage}
                alt="شعار قطعة من فلسطين"
                sx={{
                  width: 46,
                  height: 46,
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    color: COLORS.green,
                    fontSize: { xs: 15, sm: 20 }
                  }}
                >
                  لوحة تحكم الأدمن
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: COLORS.muted,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  إدارة محتوى ومستخدمي قطعة من فلسطين
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="فتح القائمة">
                <IconButton
                  onClick={() => setSidebarOpen(true)}
                  aria-label="فتح القائمة الجانبية"
                  sx={{
                    color: COLORS.green,
                    display: { xs: 'inline-flex', md: 'none' }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  fontFamily: 'Cairo, sans-serif',
                  borderRadius: 2,
                  minWidth: 0,
                  px: { xs: 1, sm: 2 },
                  '& .MuiButton-startIcon': {
                    marginLeft: { xs: 0, sm: 1 }
                  }
                }}
              >
                <Box
                  component="span"
                  sx={{ display: { xs: 'none', sm: 'inline' } }}
                >
                  تسجيل الخروج
                </Box>
              </Button>
            </Stack>
          </Stack>

          {message && (
            <Alert
              severity={messageType}
              onClose={() => setMessage('')}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {message}
            </Alert>
          )}

          {activeSection === 'home' && renderHome()}
          {activeSection === 'users' && renderUsers()}
          {activeSection === 'reviews' && renderReviews()}
          {activeSection === 'messages' && renderMessages()}
          {activeSection === 'ratings' && renderRatings()}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          py: 2,
          px: 2
        }}
      >
        <Typography sx={{ color: COLORS.muted, fontSize: 12 }}>
          لوحة التحكم الخاصة بمشروع قطعة من فلسطين
        </Typography>
        <FavoriteIcon sx={{ color: COLORS.red, fontSize: 14 }} />
      </Box>

      <Box sx={stripeSx} />

      {/* User dialogs */}
      <Dialog
        open={Boolean(dialogType)}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        dir="rtl"
      >
        <DialogTitle
          sx={{
            fontFamily: 'Cairo, sans-serif',
            color: COLORS.green,
            fontWeight: 'bold'
          }}
        >
          {dialogType === 'edit'
            ? 'تعديل بيانات المستخدم'
            : dialogType === 'role'
              ? 'تغيير صلاحية المستخدم'
              : 'تفاصيل المستخدم'}
        </DialogTitle>

        <DialogContent>
          {dialogType === 'edit' && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="الاسم"
                fullWidth
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value
                  }))
                }
              />

              <TextField
                label="البريد الإلكتروني"
                type="email"
                fullWidth
                value={form.email}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    email: event.target.value
                  }))
                }
              />

              <TextField
                label="رقم الهاتف"
                fullWidth
                value={form.phoneNumber}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    phoneNumber: event.target.value
                  }))
                }
              />
            </Stack>
          )}

          {dialogType === 'role' && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography>
                اختاري الصلاحية الجديدة للحساب:{' '}
                <strong>{selectedUser?.name}</strong>
              </Typography>

              <FormControl fullWidth>
                <InputLabel id="user-role-label">الصلاحية</InputLabel>
                <Select
                  labelId="user-role-label"
                  label="الصلاحية"
                  value={form.role}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      role: event.target.value
                    }))
                  }
                >
                  <MenuItem value="user">مستخدم (User)</MenuItem>
                  <MenuItem value="contentManager">
                    مدير محتوى (Content Manager)
                  </MenuItem>
                  <MenuItem value="admin">أدمن (Admin)</MenuItem>
                </Select>
              </FormControl>

              <Alert severity="info">
                تأكدي من اختيار الدور المناسب قبل الحفظ.
              </Alert>
            </Stack>
          )}

          {dialogType === 'details' && selectedUser && (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <Typography>
                <strong>الاسم:</strong> {selectedUser.name}
              </Typography>

              <Typography sx={{ overflowWrap: 'anywhere' }}>
                <strong>البريد الإلكتروني:</strong> {selectedUser.email}
              </Typography>

              <Typography>
                <strong>الصلاحية:</strong>{' '}
                {ROLE_LABELS[selectedUser.role] || selectedUser.role}
              </Typography>

              <Typography>
                <strong>رقم الهاتف:</strong>{' '}
                {selectedUser.phoneNumber || 'غير متوفر'}
              </Typography>

              <Typography sx={{ overflowWrap: 'anywhere' }}>
                <strong>معرّف الحساب:</strong> {selectedUser._id}
              </Typography>

              <Typography>
                <strong>حالة الحساب:</strong>{' '}
                {selectedUser.isActive === false ? 'غير نشط' : 'نشط'}
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={closeDialog} disabled={saving}>
            إغلاق
          </Button>

          {dialogType === 'edit' && (
            <Button
              variant="contained"
              onClick={handleEdit}
              disabled={saving}
              sx={{
                bgcolor: COLORS.green,
                '&:hover': { bgcolor: COLORS.darkGreen }
              }}
            >
              {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </Button>
          )}

          {dialogType === 'role' && (
            <Button
              variant="contained"
              onClick={handleRoleChange}
              disabled={saving}
              sx={{
                bgcolor: COLORS.green,
                '&:hover': { bgcolor: COLORS.darkGreen }
              }}
            >
              {saving ? 'جارٍ الحفظ...' : 'تأكيد الصلاحية'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Content review dialog */}
      <Dialog
        open={Boolean(reviewDialog)}
        onClose={closeReviewDialog}
        fullWidth
        maxWidth="md"
        dir="rtl"
      >
        <DialogTitle sx={{ color: COLORS.green, fontWeight: 'bold' }}>
          مراجعة طلب المحتوى
        </DialogTitle>

        <DialogContent>
          {reviewDialog && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', rowGap: 1 }}
              >
                <Chip
                  label={
                    reviewDialog.contentType === 'question' ? 'سؤال' : 'مرحلة'
                  }
                  sx={{ bgcolor: COLORS.paleGold, color: COLORS.green }}
                />
                <Chip
                  label={
                    reviewDialog.action === 'update' ? 'تعديل' : 'إنشاء'
                  }
                  variant="outlined"
                />
              </Stack>

              <Typography fontWeight="bold">
                مقدم الطلب: {reviewDialog.submittedBy?.name || 'غير معروف'}
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#FAFAF8',
                  maxHeight: 360,
                  overflow: 'auto'
                }}
              >
                <Typography
                  component="pre"
                  sx={{
                    m: 0,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    direction: 'ltr',
                    textAlign: 'left'
                  }}
                >
                  {JSON.stringify(reviewDialog.proposedData || {}, null, 2)}
                </Typography>
              </Paper>

              <Alert severity="info">
                تحققي من بيانات المحتوى قبل الموافقة. لا تعرض هذه اللوحة
                الإجابة الصحيحة ضمن الأسئلة العامة للاعبين.
              </Alert>

              <TextField
                label="ملاحظة للمراجعة (اختياري)"
                multiline
                minRows={3}
                fullWidth
                value={reviewComment}
                disabled={Boolean(reviewingId)}
                onChange={(event) => setReviewComment(event.target.value)}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button
            onClick={closeReviewDialog}
            disabled={Boolean(reviewingId)}
          >
            إلغاء
          </Button>

          <Button
            color="error"
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => submitRevisionReview('reject')}
            disabled={Boolean(reviewingId) || !reviewDialog?._id}
          >
            {reviewingId ? 'جارٍ الإرسال...' : 'رفض الطلب'}
          </Button>

          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={() => submitRevisionReview('approve')}
            disabled={Boolean(reviewingId) || !reviewDialog?._id}
            sx={{
              bgcolor: COLORS.green,
              '&:hover': { bgcolor: COLORS.darkGreen }
            }}
          >
            {reviewingId ? 'جارٍ الإرسال...' : 'الموافقة على الطلب'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
