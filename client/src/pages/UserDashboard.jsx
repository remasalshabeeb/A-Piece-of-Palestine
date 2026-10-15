import React from 'react';
import { Box, Typography, Button, Paper, LinearProgress } from '@mui/material';
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

import logoImage from '../assets/logo.png';
import welcomeImage from '../assets/welcome.png';

const GREEN = '#2D5A27';
const RED = '#C84B31';
const GOLD = '#D4AF37';
const CREAM = '#FDFBF7';
const TEXT = '#2C3E35';
const MUTED = '#8C9A92';
const BORDER = '#F0EBE1';

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // حذف بيانات المصادقة المحفوظة
    localStorage.removeItem('token');
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');

    // العودة إلى صفحة تسجيل الدخول
    navigate('/login', { replace: true });
  };

  const quickLinks = [
    {
      title: 'خريطة المراحل',
      icon: <MapIcon sx={{ color: GREEN, fontSize: 30 }} />,
      bg: '#EDF5ED',
    },
    {
      title: 'مجموعتي',
      icon: <ExtensionIcon sx={{ color: '#D4AF37', fontSize: 30 }} />,
      bg: '#FDF8EC',
    },
    {
      title: 'إنجازاتي',
      icon: <EmojiEventsIcon sx={{ color: RED, fontSize: 30 }} />,
      bg: '#FDF2F2',
    },
    {
      title: 'ملفي الشخصي',
      icon: <PersonIcon sx={{ color: '#3B82F6', fontSize: 30 }} />,
      bg: '#EFF6FF',
    },
  ];

  const stages = [
    {
      title: 'حكاية الزيتونة',
      status: 'جارٍ الآن',
      description: '2 من 5 أسئلة • 4 من 9 قطع',
      progress: 50,
      image: true,
    },
    {
      title: 'ألوان التطريز',
      status: 'مقفلة',
      description: 'أكمِل المرحلة السابقة لاكتشافها',
      emoji: '🧵',
      locked: true,
    },
    {
      title: 'القدس',
      status: 'مقفلة',
      description: 'أكمِل المرحلة السابقة لاكتشافها',
      emoji: '🕌',
      locked: true,
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
        '& *': {
          boxSizing: 'border-box',
        },
      }}
    >
      {/* الحدود التراثية العلوية */}
      <Box sx={decorativeBorder} />

      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: '1440px',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 5, lg: 6 },
          py: { xs: 2.5, md: 4 },
          flex: 1,
        }}
      >
        {/* الناف بار */}
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
          {/* الشعار واسم المشروع */}
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

              <Typography
                sx={{
                  fontSize: 10,
                  color: MUTED,
                  letterSpacing: '0.8px',
                }}
              >
                A Piece of Palestine
              </Typography>
            </Box>
          </Box>

          {/* روابط التنقل */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: 3,
            }}
          >
            {['الرئيسية', 'خريطة المراحل', 'مجموعتي', 'إنجازاتي'].map(
              (label, index) => (
                <Typography
                  key={label}
                  onClick={() => {
                    if (index === 0) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    '&:hover': {
                      color: GREEN,
                    },
                  }}
                >
                  {label}
                </Typography>
              ),
            )}
          </Box>

          {/* النجوم والملف الشخصي والخروج */}
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
              120
            </Box>

            <Box
              role="button"
              aria-label="الإعدادات"
              tabIndex={0}
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,
                backgroundColor: '#FFF',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${BORDER}`,
                cursor: 'pointer',
                color: '#556B62',
                '&:hover': {
                  backgroundColor: '#F5EEDC',
                },
              }}
            >
              <SettingsIcon fontSize="small" />
            </Box>

            <Box
              component="img"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
              alt="الصورة الشخصية"
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${GREEN}`,
              }}
            />

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
                '& .MuiButton-startIcon': {
                  ml: 0.5,
                  mr: 0,
                },
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

        {/* البانر الرئيسي */}
        <Paper
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
                حكاية الزيتونة
              </Typography>

              <Typography
                sx={{
                  color: '#F3F4F6',
                  fontSize: { xs: 13, sm: 15 },
                  lineHeight: 2,
                  maxWidth: 560,
                }}
              >
                أجب عن الأسئلة، اجمع قطع البازل، واكتشف حكاية شجرة الزيتون
                التي تحمل في جذورها قصة فلسطين.
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
                2 من 5 أسئلة
              </Typography>

              <Button
                variant="contained"
                endIcon={<ArrowBackIcon />}
                sx={{
                  backgroundColor: RED,
                  color: '#FFF',
                  borderRadius: '13px',
                  px: 3,
                  py: 1.3,
                  fontFamily: 'Cairo, sans-serif',
                  fontWeight: 800,
                  fontSize: 15,
                  boxShadow: '0 5px 16px rgba(217, 83, 79, 0.3)',
                  '&:hover': {
                    backgroundColor: '#A83C27',
                  },
                }}
              >
                ابدأ الرحلة
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* إحصائيات الرحلة */}
        <Paper
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
                1 من 3
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={35}
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
              { value: '4', label: 'قطع مجمعة', color: RED },
              { value: '1', label: 'وسام', color: '#D4AF37' },
              { value: '120', label: 'نجمة', color: GREEN },
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
          ماذا تريد أن تكتشف اليوم؟
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

        {/* مراحل المغامرة */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mb: 2.5,
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
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            عرض الكل ←
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2.5,
            mb: 4,
          }}
        >
          {stages.map((stage) => (
            <Paper
              key={stage.title}
              elevation={0}
              sx={{
                borderRadius: '19px',
                border: `1px solid ${BORDER}`,
                overflow: 'hidden',
                backgroundColor: '#FFF',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
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
                {stage.image ? (
                  <Box
                    component="img"
                    src={welcomeImage}
                    alt={stage.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Typography sx={{ fontSize: 58 }}>
                    {stage.emoji}
                  </Typography>
                )}

                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: stage.locked ? '#FFFFFFE8' : GREEN,
                    color: stage.locked ? MUTED : '#FFF',
                    px: 1.5,
                    py: 0.7,
                    borderRadius: '9px',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {stage.locked && <LockIcon sx={{ fontSize: 14 }} />}
                  {stage.status}
                </Box>

                {stage.locked && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(253, 251, 247, 0.18)',
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

                {stage.locked ? (
                  <Typography
                    sx={{
                      color: MUTED,
                      fontSize: 12,
                      lineHeight: 1.8,
                    }}
                  >
                    {stage.description}
                  </Typography>
                ) : (
                  <>
                    <LinearProgress
                      variant="determinate"
                      value={stage.progress}
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
                      }}
                    >
                      {stage.description}
                    </Typography>
                  </>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

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

      {/* الحدود التراثية السفلية */}
      <Box sx={decorativeBorder} />
    </Box>
  );
};

export default UserDashboard;