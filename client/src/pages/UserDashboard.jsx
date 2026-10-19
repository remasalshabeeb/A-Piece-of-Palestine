
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MapIcon from '@mui/icons-material/Map';
import ExtensionIcon from '@mui/icons-material/Extension';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';

import API from '../api';
import logoImage from '../assets/logo.png';
import welcomeImage from '../assets/welcome.png';

const GREEN = '#2D5A27';
const RED = '#C84B31';
const GOLD = '#D4AF37';
const CREAM = '#FDFBF7';
const TEXT = '#2C3E35';
const MUTED = '#8C9A92';
const BORDER = '#F0EBE1';

const QUESTIONS_PER_STAGE = 4;
const PIECES_PER_STAGE = 4;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const getStageImageUrl = (image) => {
  if (!image || typeof image !== 'string' || !image.trim()) {
    return welcomeImage;
  }

  const imageValue = image.trim();

  if (/^https?:\/\//i.test(imageValue) || imageValue.startsWith('data:')) {
    return imageValue;
  }

  const baseURL = (API.defaults?.baseURL || 'http://localhost:2905/api')
    .replace(/\/api\/?$/, '')
    .replace(/\/+$/, '');

  const imagePath = imageValue.startsWith('/')
    ? imageValue
    : `/${imageValue}`;

  return `${baseURL}${imagePath}`;
};

const UserDashboard = () => {
  const navigate = useNavigate();

  const [stages, setStages] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedStages, setCompletedStages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [activeDialog, setActiveDialog] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const [nameInput, setNameInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const [imageError, setImageError] = useState('');

  const [ratingValue, setRatingValue] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const profileImageKey = `profileImage:${
    user.id || user._id || user.email || 'guest'
  }`;

  const [profileImage, setProfileImage] = useState(() => {
    try {
      const initialUser = JSON.parse(localStorage.getItem('user') || '{}');
      const key = `profileImage:${
        initialUser.id ||
        initialUser._id ||
        initialUser.email ||
        'guest'
      }`;

      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const [stagesResponse, progressResponse] = await Promise.all([
          API.get('/stages'),
          API.get('/progress/me'),
        ]);

        if (cancelled) return;

        const stagesData = stagesResponse.data;
        const stagesList = Array.isArray(stagesData)
          ? stagesData
          : Array.isArray(stagesData?.stages)
            ? stagesData.stages
            : Array.isArray(stagesData?.data)
              ? stagesData.data
              : [];

        const progressData = progressResponse.data;
        const progressList = Array.isArray(progressData?.progress)
          ? progressData.progress
          : Array.isArray(progressData?.progressRecords)
            ? progressData.progressRecords
            : Array.isArray(progressData?.data)
              ? progressData.data
              : Array.isArray(progressData)
                ? progressData
                : [];

        setStages(
          [...stagesList].sort(
            (a, b) => Number(a.order || 0) - Number(b.order || 0),
          ),
        );

        setProgressRecords(progressList);

        setTotalPoints(
          Number(
            progressData?.totalPoints ??
              progressData?.points ??
              progressList.reduce(
                (sum, record) =>
                  sum +
                  Number(
                    record?.score ??
                      record?.pointsEarned ??
                      record?.points ??
                      0,
                  ),
                0,
              ),
          ) || 0,
        );

        setCompletedStages(
          Number(
            progressData?.completedStages ??
              progressList.filter(
                (record) =>
                  record?.isCompleted === true ||
                  record?.completed === true,
              ).length,
          ) || 0,
        );
      } catch (err) {
        if (cancelled) return;

        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokens');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          navigate('/login', { replace: true });
          return;
        }

        setError(
          'تعذر تحميل بيانات رحلتك. تأكدي من تشغيل الخادم ثم حاولي مجددًا.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  const getProgressForStage = (stageId) =>
    progressRecords.find(
      (record) =>
        String(record.stageId?._id || record.stageId) === String(stageId),
    );

  const getCorrectAnswersCount = (record) =>
    (Array.isArray(record?.answeredQuestions)
      ? record.answeredQuestions
      : []
    ).filter((answer) => answer?.isCorrect).length;

  const getCollectedPiecesCount = (record) =>
    new Set(
      (Array.isArray(record?.collectedPieces)
        ? record.collectedPieces
        : []
      )
        .map((piece) =>
          typeof piece === 'string'
            ? piece
            : piece?.pieceId?._id || piece?.pieceId || piece?._id,
        )
        .filter(Boolean)
        .map(String),
    ).size;

  const totalCollectedPieces = progressRecords.reduce(
    (sum, record) => sum + getCollectedPiecesCount(record),
    0,
  );

  const overallProgress =
    stages.length > 0
      ? Math.min(100, Math.round((completedStages / stages.length) * 100))
      : 0;

  const getStageStatus = (stage, index) => {
    const record = getProgressForStage(stage._id);

    if (record?.isCompleted || record?.completed) return 'مكتملة';

    if (index === 0) return 'متاحة';

    const previousRecord = getProgressForStage(stages[index - 1]?._id);

    return previousRecord?.isCompleted || previousRecord?.completed
      ? 'متاحة'
      : 'مقفلة';
  };

  const nextStage =
    stages.find(
      (stage, index) =>
        getStageStatus(stage, index) === 'متاحة' &&
        !(
          getProgressForStage(stage._id)?.isCompleted ||
          getProgressForStage(stage._id)?.completed
        ),
    ) || null;

  const nextStageRecord = nextStage
    ? getProgressForStage(nextStage._id)
    : null;

  const openStage = (stage, index) => {
    if (!stage?._id) return;

    const status = getStageStatus(stage, index);

    if (status === 'مقفلة') return;

    navigate(`/user/stages/${stage._id}/intro`);
  };

  const clearDialogFields = () => {
    setSettingsError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setDeletePassword('');
    setDeleteConfirmation('');
    setImageError('');
  };

  const openSettingsDialog = (dialog) => {
    setSettingsAnchor(null);
    clearDialogFields();
    setSettingsSuccess('');
    setActiveDialog(dialog);

    if (dialog === 'name') {
      setNameInput(user.name || '');
    }
  };

  const closeSettingsDialog = () => {
    if (savingSettings) return;
    setActiveDialog('');
    clearDialogFields();
  };

  const updateLocalUser = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);

    try {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch {
      // لا نوقف الواجهة إذا تعذر تحديث التخزين المحلي.
    }
  };

  const handleUpdateName = async () => {
    const cleanName = nameInput.trim();

    if (cleanName.length < 3 || cleanName.length > 100) {
      setSettingsError('يجب أن يتراوح الاسم بين 3 و100 أحرف.');
      return;
    }

    try {
      setSavingSettings(true);
      setSettingsError('');

      const response = await API.patch('/auth/me/name', {
        name: cleanName,
      });

      updateLocalUser({
        ...(response.data?.user || {}),
        name: response.data?.user?.name || cleanName,
      });

      setActiveDialog('');
      setSettingsSuccess('تم تغيير الاسم بنجاح.');
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        return;
      }

      setSettingsError(
        err.response?.data?.message || 'تعذر تغيير الاسم.',
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSettingsError('يرجى تعبئة جميع حقول كلمة المرور.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSettingsError('كلمتا المرور الجديدتان غير متطابقتين.');
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setSettingsError(
        'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل، وتحتوي على حرف كبير وصغير ورقم ورمز خاص.',
      );
      return;
    }

    try {
      setSavingSettings(true);
      setSettingsError('');

      await API.patch('/auth/me/password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      handleLogout();
    } catch (err) {
      setSettingsError(
        err.response?.data?.message || 'تعذر تغيير كلمة المرور.',
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setSettingsError('أدخلي كلمة المرور الحالية.');
      return;
    }

    if (deleteConfirmation !== 'DELETE') {
      setSettingsError('اكتبي DELETE كما هو للتأكيد.');
      return;
    }

    try {
      setSavingSettings(true);
      setSettingsError('');

      await API.delete('/auth/me', {
        data: {
          password: deletePassword,
          confirmation: deleteConfirmation,
        },
      });

      handleLogout();
    } catch (err) {
      setSettingsError(
        err.response?.data?.message || 'تعذر حذف الحساب.',
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const handleImageSelection = (event) => {
    const file = event.target.files?.[0];

    setImageError('');

    if (!file) return;

    event.target.value = '';

    if (!file.type.startsWith('image/')) {
      setImageError('اختاري ملف صورة صالحًا.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError('حجم الصورة يجب ألا يتجاوز 2 ميجابايت.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        if (typeof reader.result !== 'string') {
          setImageError('تعذرت قراءة الصورة.');
          return;
        }

        localStorage.setItem(profileImageKey, reader.result);
        setProfileImage(reader.result);
        setImageError('');
      } catch {
        setImageError('تعذر حفظ الصورة. اختاري صورة أصغر حجمًا.');
      }
    };

    reader.onerror = () => {
      setImageError('تعذرت قراءة الصورة. حاولي مرة أخرى.');
    };

    reader.readAsDataURL(file);
  };

  const handleSubmitRating = async () => {
    setRatingError('');
    setRatingSuccess(false);

    if (ratingValue < 1 || ratingValue > 5) {
      setRatingError('اختاري عدد النجوم أولًا.');
      return;
    }

    try {
      setRatingSubmitting(true);

      await API.post('/ratings', {
        rating: ratingValue,
        comment: ratingComment.trim(),
      });

      setRatingSuccess(true);
      setRatingComment('');
    } catch (err) {
      if (err.response?.status === 401) {
        setRatingError('انتهت جلسة الدخول. سجّلي الدخول مجددًا.');
        return;
      }

      setRatingError(
        err.response?.data?.message ||
          'تعذر إرسال التقييم. تأكدي من تشغيل الخادم ووجود مسار التقييم.',
      );
    } finally {
      setRatingSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const quickLinks = [
    {
      title: 'خريطة المراحل',
      icon: <MapIcon sx={{ color: GREEN, fontSize: 30 }} />,
      bg: '#EDF5ED',
      action: () => scrollToSection('stages-section'),
    },
    {
      title: 'مجموعتي',
      icon: <ExtensionIcon sx={{ color: GOLD, fontSize: 30 }} />,
      bg: '#FDF8EC',
      action: () => scrollToSection('collection-section'),
    },
    {
      title: 'إنجازاتي',
      icon: <EmojiEventsIcon sx={{ color: RED, fontSize: 30 }} />,
      bg: '#FDF2F2',
      action: () => scrollToSection('stats-section'),
    },
    {
      title: 'ملفي الشخصي',
      icon: <PersonIcon sx={{ color: '#3B82F6', fontSize: 30 }} />,
      bg: '#EFF6FF',
      action: () => openSettingsDialog('profile'),
    },
  ];

  const decorativeBorder = {
    width: '100%',
    height: '12px',
    flexShrink: 0,
    background:
      'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)',
  };

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: CREAM,
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'clip',
        fontFamily: 'Cairo, sans-serif',
        color: TEXT,
        boxSizing: 'border-box',
        '& *': { boxSizing: 'border-box' },
      }}
    >
      <Box sx={decorativeBorder} />

      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: 1440,
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 5, lg: 6 },
          py: { xs: 2.5, md: 4 },
          flex: 1,
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => window.location.reload()}
              >
                إعادة المحاولة
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {settingsSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setSettingsSuccess('')}
          >
            {settingsSuccess}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: GREEN }} />
            <Typography sx={{ color: MUTED }}>
              جارٍ تجهيز رحلتك في فلسطين...
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              component="header"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                mb: { xs: 3, md: 4 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  component="img"
                  src={logoImage}
                  alt="شعار قطعة من فلسطين"
                  sx={{
                    width: 48,
                    height: 48,
                    objectFit: 'contain',
                    borderRadius: '50%',
                  }}
                />

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: GREEN,
                      fontSize: { xs: 16, sm: 19 },
                      lineHeight: 1.4,
                    }}
                  >
                    قطعة من فلسطين
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: MUTED }}>
                    A Piece of Palestine
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  gap: 2.5,
                }}
              >
                {[
                  'الرئيسية',
                  'خريطة المراحل',
                  'مجموعتي',
                  'إنجازاتي',
                  'قيّمي رحلتك',
                ].map((label, index) => (
                  <Typography
                    key={label}
                    onClick={() => {
                      if (index === 0) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (index === 1) {
                        scrollToSection('stages-section');
                      } else if (index === 2) {
                        scrollToSection('collection-section');
                      } else if (index === 3) {
                        scrollToSection('stats-section');
                      } else {
                        scrollToSection('rating-section');
                      }
                    }}
                    sx={{
                      color: index === 0 ? GREEN : '#556B62',
                      fontWeight: index === 0 ? 800 : 500,
                      fontSize: 14,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      pb: 0.7,
                      borderBottom:
                        index === 0
                          ? `2px solid ${GREEN}`
                          : '2px solid transparent',
                      '&:hover': { color: GREEN },
                    }}
                  >
                    {label}
                  </Typography>
                ))}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: { xs: 1, sm: 1.5 },
                }}
              >
                <Box
                  sx={{
                    backgroundColor: '#FEF3C7',
                    color: '#B77909',
                    px: 1.7,
                    py: 1,
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.7,
                    border: '1px solid #FDE68A',
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  <StarIcon sx={{ color: '#F59E0B', fontSize: 21 }} />
                  {totalPoints}
                </Box>

                <IconButton
                  aria-label="إعدادات الحساب"
                  onClick={(event) =>
                    setSettingsAnchor(event.currentTarget)
                  }
                  sx={{
                    width: 42,
                    height: 42,
                    backgroundColor: '#FFF',
                    border: `1px solid ${BORDER}`,
                    color: '#556B62',
                    '&:hover': { backgroundColor: '#EDF5ED' },
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={settingsAnchor}
                  open={Boolean(settingsAnchor)}
                  onClose={() => setSettingsAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        minWidth: 220,
                        borderRadius: 3,
                        border: `1px solid ${BORDER}`,
                        boxShadow: '0 8px 28px rgba(0,0,0,0.09)',
                      },
                    },
                  }}
                >
                  <MenuItem onClick={() => openSettingsDialog('name')}>
                    <EditIcon sx={{ ml: 1.5, color: GREEN }} />
                    تغيير الاسم
                  </MenuItem>

                  <MenuItem onClick={() => openSettingsDialog('password')}>
                    <LockResetIcon sx={{ ml: 1.5, color: GREEN }} />
                    تغيير كلمة المرور
                  </MenuItem>

                  <MenuItem onClick={() => openSettingsDialog('profile')}>
                    <PhotoCameraIcon sx={{ ml: 1.5, color: GREEN }} />
                    الصورة الشخصية
                  </MenuItem>

                  <Divider />

                  <MenuItem
                    onClick={() => openSettingsDialog('delete')}
                    sx={{ color: RED }}
                  >
                    <DeleteForeverIcon sx={{ ml: 1.5 }} />
                    إلغاء الحساب
                  </MenuItem>
                </Menu>

                <Avatar
                  src={profileImage || undefined}
                  alt={user.name || 'الصورة الشخصية'}
                  sx={{
                    width: 42,
                    height: 42,
                    border: `2px solid ${GREEN}`,
                    backgroundColor: '#EDF5ED',
                    color: GREEN,
                    fontWeight: 800,
                  }}
                >
                  {(user.name || 'م').trim().charAt(0)}
                </Avatar>

                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  aria-label="تسجيل الخروج"
                  sx={{
                    minHeight: 42,
                    color: RED,
                    borderColor: '#E8C5BA',
                    borderRadius: '12px',
                    px: { xs: 1.2, sm: 2 },
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 700,
                    fontSize: { xs: 12, sm: 14 },
                    whiteSpace: 'nowrap',
                    '& .MuiButton-startIcon': { ml: 0.5, mr: 0 },
                    '&:hover': {
                      backgroundColor: '#FDF2F2',
                      borderColor: RED,
                    },
                  }}
                >
                  تسجيل الخروج
                </Button>
              </Box>
            </Box>

            {/* الواجهة الترحيبية */}
            <Paper
              id="home-section"
              elevation={0}
              sx={{
                width: '100%',
                minHeight: { xs: 300, md: 320 },
                borderRadius: { xs: '20px', md: '28px' },
                backgroundImage: `
                  linear-gradient(
                    to left,
                    rgba(19, 39, 23, 0.88),
                    rgba(19, 39, 23, 0.45)
                  ),
                  url(${welcomeImage})
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: { xs: 3, sm: 4, md: 5 },
                mb: 4,
                overflow: 'hidden',
                scrollMarginTop: 110,
                boxShadow: '0 12px 32px rgba(45, 90, 39, 0.12)',
              }}
            >
              <Box
                sx={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#D97706',
                  color: '#FFF',
                  px: 2,
                  py: 0.8,
                  borderRadius: '20px',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                🌟 مرحلتك التالية
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', md: 'flex-end' },
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 3,
                  mt: 4,
                }}
              >
                <Box sx={{ maxWidth: 650 }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      color: '#FFF',
                      fontSize: { xs: 28, sm: 34, md: 42 },
                      mb: 1.5,
                      lineHeight: 1.4,
                    }}
                  >
                    {nextStage
                      ? nextStage.title
                      : 'أحسنتِ! أكملتِ جميع المراحل'}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#F3F4F6',
                      fontSize: { xs: 13, sm: 15 },
                      lineHeight: 2,
                      maxWidth: 560,
                    }}
                  >
                    أجيبي عن الأسئلة، واجمعي قطع البازل، واكتشفي حكايات
                    فلسطين الجميلة خطوةً بخطوة.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'flex-start', md: 'flex-end' },
                    gap: 1.5,
                  }}
                >
                  <Typography sx={{ color: '#FFF', fontSize: 12 }}>
                    {nextStage
                      ? `${getCorrectAnswersCount(nextStageRecord)} من ${QUESTIONS_PER_STAGE} أسئلة صحيحة`
                      : 'أنهيتِ جميع المراحل المتاحة'}
                  </Typography>

                  <Button
                    variant="contained"
                    endIcon={<ArrowBackIcon />}
                    disabled={!nextStage}
                    onClick={() => {
                      if (nextStage) {
                        navigate(`/user/stages/${nextStage._id}/intro`);
                      }
                    }}
                    sx={{
                      backgroundColor: RED,
                      color: '#FFF',
                      borderRadius: '13px',
                      px: 3,
                      py: 1.3,
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 800,
                      fontSize: 15,
                      '&:hover': { backgroundColor: '#A83B26' },
                      '&.Mui-disabled': {
                        backgroundColor: '#8C9A92',
                        color: '#FFF',
                      },
                    }}
                  >
                    {nextStage ? 'ابدئي الرحلة' : 'اكتملت الرحلة'}
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* الإحصائيات */}
            <Paper
              id="stats-section"
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: '22px',
                backgroundColor: '#FFF',
                border: `1px solid ${BORDER}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 3,
                mb: 5,
                scrollMarginTop: 110,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    backgroundColor: '#EDF5ED',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 25,
                  }}
                >
                  🌿
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 800, color: TEXT, fontSize: 16 }}>
                    رحلتك في فلسطين
                  </Typography>
                  <Typography sx={{ color: MUTED, fontSize: 12, mt: 0.5 }}>
                    أكمل التحديات لاكتشاف الخريطة
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 180,
                  maxWidth: 300,
                  display: { xs: 'none', md: 'block' },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: MUTED }}>
                    التقدم العام
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 800, color: GREEN }}>
                    {completedStages} من {stages.length}
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={overallProgress}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: '#E5E0D5',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: GREEN,
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  gap: { xs: 3, sm: 4 },
                  textAlign: 'center',
                  flex: { xs: 1, sm: 'initial' },
                }}
              >
                {[
                  {
                    value: totalCollectedPieces,
                    label: 'قطع مجمعة',
                    color: RED,
                  },
                  {
                    value: completedStages,
                    label: 'مراحل مكتملة',
                    color: GOLD,
                  },
                  {
                    value: totalPoints,
                    label: 'نقاط',
                    color: GREEN,
                  },
                ].map((stat) => (
                  <Box key={stat.label}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: stat.color,
                        fontSize: 21,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: MUTED,
                        mt: 0.3,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* الاختصارات */}
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: 21, md: 25 },
                fontWeight: 900,
                color: GREEN,
                mb: 2.5,
              }}
            >
              ماذا تريدين أن تكتشفي اليوم؟
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                gap: { xs: 1.5, sm: 2.5 },
                mb: 5,
              }}
            >
              {quickLinks.map((item) => (
                <Paper
                  key={item.title}
                  component="button"
                  type="button"
                  onClick={item.action}
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    minWidth: 0,
                    borderRadius: '20px',
                    backgroundColor: '#FFF',
                    border: `1px solid ${BORDER}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontFamily: 'Cairo, sans-serif',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: item.bg,
                      borderRadius: '17px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.8,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: TEXT,
                      fontSize: { xs: 13, sm: 15 },
                    }}
                  >
                    {item.title}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* مجموعتي */}
            <Box id="collection-section" sx={{ scrollMarginTop: 110, mb: 5 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: 21, md: 25 },
                  fontWeight: 900,
                  color: GREEN,
                  mb: 2.5,
                }}
              >
                مجموعتي
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: '22px',
                  backgroundColor: '#FFF',
                  border: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  flexWrap: 'wrap',
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    flexShrink: 0,
                    backgroundColor: '#EDF5ED',
                    color: GREEN,
                    borderRadius: '17px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ExtensionIcon sx={{ fontSize: 32 }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Typography sx={{ fontWeight: 900, color: TEXT, mb: 0.7 }}>
                    قطع البازل التي جمعتِها
                  </Typography>
                  <Typography sx={{ color: MUTED, fontSize: 13, lineHeight: 1.9 }}>
                    استمري في الإجابة عن الأسئلة لتجميع قطع جديدة وإكمال حكايات فلسطين.
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', minWidth: 90 }}>
                  <Typography sx={{ color: GREEN, fontSize: 28, fontWeight: 900 }}>
                    {totalCollectedPieces}
                  </Typography>
                  <Typography sx={{ color: MUTED, fontSize: 12 }}>
                    قطعة مجمّعة
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* المراحل */}
            <Box
              id="stages-section"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                mb: 2.5,
                scrollMarginTop: 110,
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: 21, md: 25 },
                  fontWeight: 900,
                  color: GREEN,
                }}
              >
                مراحل مغامرتك
              </Typography>

              <Typography
                sx={{
                  color: RED,
                  fontWeight: 800,
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                }}
              >
                {stages.length} مراحل
              </Typography>
            </Box>

            {stages.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  textAlign: 'center',
                  borderRadius: '19px',
                  border: `1px solid ${BORDER}`,
                  backgroundColor: '#FFF',
                }}
              >
                <Typography sx={{ color: TEXT, fontWeight: 800, mb: 1 }}>
                  لا توجد مراحل منشورة حتى الآن
                </Typography>
                <Typography sx={{ color: MUTED, fontSize: 13 }}>
                  ستظهر المراحل هنا عندما ينشرها مدير المحتوى.
                </Typography>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(3, minmax(0, 1fr))',
                  },
                  gap: 2.5,
                  mb: 5,
                }}
              >
                {stages.map((stage, index) => {
                  const record = getProgressForStage(stage._id);
                  const correctAnswers = getCorrectAnswersCount(record);
                  const collectedPieces = getCollectedPiecesCount(record);

                  const stageProgress = Math.min(
                    100,
                    Math.round(
                      (correctAnswers / QUESTIONS_PER_STAGE) * 100,
                    ),
                  );

                  const status = getStageStatus(stage, index);
                  const locked = status === 'مقفلة';
                  const available = status === 'متاحة';

                  return (
                    <Paper
                      key={stage._id}
                      component="article"
                      elevation={0}
                      onClick={() => openStage(stage, index)}
                      onKeyDown={(event) => {
                        if (
                          available &&
                          (event.key === 'Enter' || event.key === ' ')
                        ) {
                          event.preventDefault();
                          openStage(stage, index);
                        }
                      }}
                      role={available ? 'button' : undefined}
                      tabIndex={available ? 0 : undefined}
                      aria-label={
                        available
                          ? `ابدئي مرحلة ${stage.title}`
                          : `${stage.title} - ${status}`
                      }
                      sx={{
                        borderRadius: '19px',
                        border: `1px solid ${BORDER}`,
                        overflow: 'hidden',
                        backgroundColor: '#FFF',
                        cursor: available ? 'pointer' : 'default',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': available
                          ? {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                            }
                          : {},
                        '&:focus-visible': {
                          outline: `3px solid ${GOLD}`,
                          outlineOffset: 3,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 175,
                          position: 'relative',
                          overflow: 'hidden',
                          backgroundColor: '#F5EEDC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          component="img"
                          src={getStageImageUrl(stage.image)}
                          alt={stage.title || 'صورة المرحلة'}
                          loading="lazy"
                          onError={(event) => {
                            const img = event.currentTarget;

                            if (img.dataset.fallbackApplied === 'true') return;

                            img.dataset.fallbackApplied = 'true';
                            img.src = welcomeImage;
                          }}
                          sx={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                          }}
                        />

                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backgroundColor: locked ? '#FFFFFFE8' : GREEN,
                            color: locked ? MUTED : '#FFF',
                            px: 1.5,
                            py: 0.7,
                            borderRadius: '9px',
                            fontSize: 11,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            zIndex: 2,
                          }}
                        >
                          {locked && <LockIcon sx={{ fontSize: 14 }} />}
                          {status}
                        </Box>

                        {locked && (
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              backgroundColor: 'rgba(253, 251, 247, 0.35)',
                            }}
                          />
                        )}
                      </Box>

                      <Box sx={{ p: 2.5 }}>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: TEXT,
                            fontSize: 17,
                            mb: 1.5,
                          }}
                        >
                          {stage.title}
                        </Typography>

                        {locked ? (
                          <Typography
                            sx={{
                              color: MUTED,
                              fontSize: 12,
                              lineHeight: 1.8,
                            }}
                          >
                            أكملي المرحلة السابقة لاكتشافها.
                          </Typography>
                        ) : (
                          <>
                            <LinearProgress
                              variant="determinate"
                              value={stageProgress}
                              sx={{
                                height: 7,
                                borderRadius: 5,
                                backgroundColor: '#E5E0D5',
                                mb: 1.2,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: GREEN,
                                  borderRadius: 5,
                                },
                              }}
                            />

                            <Typography
                              sx={{
                                color: MUTED,
                                fontSize: 12,
                                lineHeight: 1.8,
                              }}
                            >
                              {correctAnswers} من {QUESTIONS_PER_STAGE} أسئلة صحيحة
                              {' • '}
                              {collectedPieces} من {PIECES_PER_STAGE} قطع
                            </Typography>

                            {stage.description && (
                              <Typography
                                sx={{
                                  color: MUTED,
                                  fontSize: 12,
                                  mt: 1,
                                  lineHeight: 1.8,
                                }}
                              >
                                {stage.description}
                              </Typography>
                            )}

                            {available && (
                              <Typography
                                sx={{
                                  color: GREEN,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  mt: 1.5,
                                }}
                              >
                                اضغطي هنا لبدء المرحلة ←
                              </Typography>
                            )}
                          </>
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}

            {/* قيّمي رحلتك */}
            <Box
              id="rating-section"
              sx={{
                scrollMarginTop: 110,
                mb: 5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 4 },
                  borderRadius: '22px',
                  background:
                    'linear-gradient(120deg, #FFFFFF 0%, #FBF6E8 100%)',
                  border: `1px solid ${BORDER}`,
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <FavoriteIcon sx={{ color: RED, fontSize: 38, mb: 1 }} />

                  <Typography
                    sx={{
                      fontSize: { xs: 22, md: 27 },
                      fontWeight: 900,
                      color: GREEN,
                      mb: 1,
                    }}
                  >
                    قيّمي رحلتك
                  </Typography>

                  <Typography sx={{ color: MUTED, lineHeight: 1.9 }}>
                    كيف كانت تجربتك في اكتشاف حكايات فلسطين؟ رأيك يساعدنا على تطوير اللعبة.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 1,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconButton
                      key={star}
                      aria-label={`${star} من 5 نجوم`}
                      onClick={() => {
                        setRatingValue(star);
                        setRatingError('');
                        setRatingSuccess(false);
                      }}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      sx={{
                        color:
                          star <= (hoveredRating || ratingValue)
                            ? GOLD
                            : '#D8D9D2',
                      }}
                    >
                      <StarIcon sx={{ fontSize: { xs: 35, sm: 43 } }} />
                    </IconButton>
                  ))}
                </Box>

                <Typography
                  sx={{
                    textAlign: 'center',
                    color: MUTED,
                    fontSize: 13,
                    mb: 2.5,
                  }}
                >
                  {ratingValue
                    ? `تقييمك: ${ratingValue} من 5 نجوم`
                    : 'اختاري عدد النجوم'}
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="ملاحظاتك (اختياري)"
                  placeholder="ما الذي أعجبك في الرحلة؟ وما الذي تقترحين تحسينه؟"
                  value={ratingComment}
                  onChange={(event) => setRatingComment(event.target.value)}
                  inputProps={{ maxLength: 1000 }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#FFFFFF',
                    },
                  }}
                />

                {ratingError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {ratingError}
                  </Alert>
                )}

                {ratingSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    شكرًا لكِ! تم إرسال تقييمك بنجاح، وسيظهر بعد اعتماده من الإدارة.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    disabled={ratingSubmitting}
                    onClick={handleSubmitRating}
                    startIcon={
                      ratingSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <StarIcon />
                      )
                    }
                    sx={{
                      minWidth: 190,
                      py: 1.3,
                      px: 3,
                      borderRadius: '12px',
                      backgroundColor: GREEN,
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 800,
                      '&:hover': {
                        backgroundColor: '#21451D',
                      },
                    }}
                  >
                    {ratingSubmitting ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
                  </Button>
                </Box>

                <Typography
                  sx={{
                    textAlign: 'center',
                    color: MUTED,
                    fontSize: 12,
                    mt: 2,
                  }}
                >
                  تُراجع التقييمات قبل اعتمادها من الإدارة.
                </Typography>
              </Paper>
            </Box>
          </>
        )}
      </Box>

      {/* نوافذ إعدادات الحساب */}
      <Dialog
        open={Boolean(activeDialog)}
        onClose={closeSettingsDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'Cairo, sans-serif',
            fontWeight: 900,
            color: GREEN,
          }}
        >
          {activeDialog === 'name' && 'تغيير الاسم'}
          {activeDialog === 'password' && 'تغيير كلمة المرور'}
          {activeDialog === 'delete' && 'إلغاء الحساب'}
          {activeDialog === 'profile' && 'الصورة الشخصية'}

          <IconButton
            onClick={closeSettingsDialog}
            disabled={savingSettings}
            aria-label="إغلاق النافذة"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {settingsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {settingsError}
            </Alert>
          )}

          <Stack spacing={2} sx={{ mt: 1 }}>
            {activeDialog === 'name' && (
              <TextField
                label="الاسم الجديد"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                fullWidth
                inputProps={{ maxLength: 100 }}
              />
            )}

            {activeDialog === 'password' && (
              <>
                <TextField
                  label="كلمة المرور الحالية"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  fullWidth
                />

                <TextField
                  label="كلمة المرور الجديدة"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  fullWidth
                />

                <TextField
                  label="تأكيد كلمة المرور الجديدة"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  fullWidth
                />

                <Alert severity="info">
                  يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وتشمل حرفًا
                  كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا.
                </Alert>
              </>
            )}

            {activeDialog === 'delete' && (
              <>
                <Alert severity="warning">
                  حذف الحساب نهائي. تأكدي قبل المتابعة.
                </Alert>

                <TextField
                  label="كلمة المرور الحالية"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  fullWidth
                />

                <TextField
                  label="اكتبي DELETE للتأكيد"
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  fullWidth
                />
              </>
            )}

            {activeDialog === 'profile' && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    src={profileImage || undefined}
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: '#EDF5ED',
                      color: GREEN,
                      border: `2px solid ${GREEN}`,
                      fontSize: 36,
                    }}
                  >
                    {(user.name || 'م').trim().charAt(0)}
                  </Avatar>
                </Box>

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  sx={{ fontFamily: 'Cairo, sans-serif' }}
                >
                  اختيار صورة من الجهاز
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelection}
                  />
                </Button>

                {imageError && (
                  <Alert severity="error">{imageError}</Alert>
                )}

                {profileImage && !imageError && (
                  <Alert severity="success">تم حفظ الصورة.</Alert>
                )}
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={closeSettingsDialog}
            disabled={savingSettings}
          >
            إغلاق
          </Button>

          {activeDialog !== 'profile' && (
            <Button
              variant="contained"
              disabled={savingSettings}
              onClick={
                activeDialog === 'name'
                  ? handleUpdateName
                  : activeDialog === 'password'
                    ? handleUpdatePassword
                    : handleDeleteAccount
              }
              sx={{
                backgroundColor: activeDialog === 'delete' ? RED : GREEN,
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 800,
                '&:hover': {
                  backgroundColor:
                    activeDialog === 'delete' ? '#A83B26' : '#21451D',
                },
              }}
            >
              {savingSettings ? (
                <CircularProgress size={22} color="inherit" />
              ) : activeDialog === 'delete' ? (
                'حذف الحساب نهائيًا'
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* التذييل */}
      <Box
        component="footer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.8,
          py: 2.5,
          px: 2,
          backgroundColor: '#FAF7F0',
          borderTop: '1px solid #F0EBE1',
        }}
      >
        <Typography sx={{ color: MUTED, fontSize: 12 }}>
          صُنع بحب من أجل أطفالنا
        </Typography>
        <FavoriteIcon sx={{ color: RED, fontSize: 15 }} />
      </Box>

      <Box sx={decorativeBorder} />
    </Box>
  );
};

export default UserDashboard;
