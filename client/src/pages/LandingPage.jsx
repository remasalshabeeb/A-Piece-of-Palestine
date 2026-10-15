import React from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import logoImage from '../assets/logo.png';
import welcomeImage from '../assets/welcome.png';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: '#FDFBF7',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'Cairo, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        direction: 'rtl',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '10px',
          background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)',
        }}
      />

      <Box sx={{ width: '100%', px: { xs: 3, md: 6 }, py: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth: '1400px', mx: 'auto' }}>
        
        {/* شريط التنقل */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            py: 1.5,
            borderBottom: '1px solid #F0EBE1',
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={logoImage}
              alt="قطعة من فلسطين"
              sx={{ width: '45px', height: '45px', objectFit: 'contain', borderRadius: '50%' }}
            />
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 'bold', color: '#2D5A27', fontSize: '17px', lineHeight: 1.1 }}>قطعة من فلسطين</Typography>
              <Typography sx={{ fontSize: '10px', color: '#8C9A92', letterSpacing: '0.8px' }}>A Piece of Palestine</Typography>
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
            <Typography sx={{ color: '#2D5A27', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', borderBottom: '2px solid #2D5A27', pb: '2px' }}>الرئيسية</Typography>
            <Typography sx={{ color: '#556B62', cursor: 'pointer', fontSize: '15px', '&:hover': { color: '#2D5A27' } }}>عن المشروع</Typography>
            <Typography sx={{ color: '#556B62', cursor: 'pointer', fontSize: '15px', '&:hover': { color: '#2D5A27' } }}>رحلتنا</Typography>
            <Typography sx={{ color: '#556B62', cursor: 'pointer', fontSize: '15px', '&:hover': { color: '#2D5A27' } }}>تواصل معنا</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              startIcon={<LoginIcon sx={{ fontSize: '16px' }} />}
              sx={{
                borderColor: '#2D5A27',
                color: '#2D5A27',
                borderRadius: '8px',
                px: 2,
                py: 0.5,
                textTransform: 'none',
                fontFamily: 'Cairo',
                fontWeight: 'bold',
                fontSize: '13px',
                '&:hover': { backgroundColor: 'rgba(45, 90, 39, 0.05)', borderColor: '#2D5A27' },
              }}
            >
              تسجيل الدخول
            </Button>

            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              startIcon={<PersonAddIcon sx={{ fontSize: '16px' }} />}
              sx={{
                backgroundColor: '#D9534F',
                color: '#FFF',
                borderRadius: '8px',
                px: 2,
                py: 0.5,
                textTransform: 'none',
                fontFamily: 'Cairo',
                fontWeight: 'bold',
                fontSize: '13px',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#C84B31' },
              }}
            >
              إنشاء حساب
            </Button>
          </Box>
        </Box>

        {/* قسم الترحيب الرئيسي */}
        <Grid container spacing={4} sx={{ alignItems: 'center', justifyContent: 'space-between', my: 'auto', width: '100%', mx: 0 }}>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                color: '#2D5A27',
                mb: 2.5,
                fontSize: { xs: '30px', md: '44px' },
                lineHeight: 1.3,
              }}
            >
              أهلاً بكم في <br />قطعة من فلسطين
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#556B62',
                fontSize: '16px',
                mb: 3.5,
                lineHeight: 1.8,
              }}
            >
              مساحة ممتعة للأطفال لاكتشاف حكايات فلسطين وتراثها، والتعرّف إلى جمال أرضها بطريقة تفاعلية مليئة بالمِعرفة.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: '#D9534F',
                  color: '#FFF',
                  borderRadius: '10px',
                  px: 3.5,
                  py: 1.1,
                  textTransform: 'none',
                  fontFamily: 'Cairo',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  boxShadow: '0px 4px 12px rgba(217, 83, 79, 0.3)',
                  '&:hover': { backgroundColor: '#C84B31' },
                }}
              >
                ابدأ رحلتك ←
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src={welcomeImage}
              alt="أرض فلسطين"
              sx={{
                width: '100%',
                maxWidth: '560px',
                height: 'auto',
                maxHeight: '360px',
                objectFit: 'contain',
                borderRadius: '20px',
              }}
            />
          </Grid>
        </Grid>

        {/* البطاقات السفلية */}
        <Grid container spacing={3} sx={{ direction: 'row-reverse', justifyContent: 'center', width: '100%', mx: 0, mt: 4 }}>
          <Grid item xs={12} sm={6} md={3.8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', backgroundColor: '#FFF', border: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ textAlign: 'right', flex: 1, ml: 2 }}>
                <Typography sx={{ fontWeight: 'bold', color: '#2C3E35', fontSize: '18px', mb: 0.6 }}>كل قطعة لها حكاية</Typography>
                <Typography sx={{ color: '#8C9A92', fontSize: '13.5px' }}>رحلة تجمع بين الثقافة والمرح</Typography>
              </Box>
              <span style={{ fontSize: '28px' }}>🧩</span>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3.8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', backgroundColor: '#FFF', border: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ textAlign: 'right', flex: 1, ml: 2 }}>
                <Typography sx={{ fontWeight: 'bold', color: '#2C3E35', fontSize: '18px', mb: 0.6 }}>نتعلّم معاً</Typography>
                <Typography sx={{ color: '#8C9A92', fontSize: '13.5px' }}>معرفة تناسب الأطفال وتشجّع الفضول</Typography>
              </Box>
              <MenuBookIcon sx={{ color: '#E2B842', fontSize: '30px' }} />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3.8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', backgroundColor: '#FFF', border: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ textAlign: 'right', flex: 1, ml: 2 }}>
                <Typography sx={{ fontWeight: 'bold', color: '#2C3E35', fontSize: '18px', mb: 0.6 }}>تراثنا يحكي</Typography>
                <Typography sx={{ color: '#8C9A92', fontSize: '13.5px' }}>اكتشف حكايات وأماكن من فلسطين</Typography>
              </Box>
              <span style={{ fontSize: '28px' }}>🏛️</span>
            </Paper>
          </Grid>
        </Grid>

      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', py: 1.5, width: '100%' }}>
        <Typography sx={{ color: '#8C9A92', fontSize: '12px' }}>صنع من أجل أطفالنا</Typography>
        <FavoriteIcon sx={{ color: '#D9534F', fontSize: '14px' }} />
      </Box>

      <Box
        sx={{
          width: '100%',
          height: '10px',
          background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)',
        }}
      />
    </Box>
  );
};

export default LandingPage;