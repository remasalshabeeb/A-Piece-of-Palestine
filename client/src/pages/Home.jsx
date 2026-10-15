import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1️⃣ استيراد useNavigate للتنقل
import { Box, Typography, LinearProgress } from '@mui/material';
import ExtensionIcon from '@mui/icons-material/Extension';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Home = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('جاري تحضير مغامرتك...');
  const navigate = useNavigate(); // 2️⃣ تعريف متغير التنقل

useEffect(() => {
    // زيادة تدريجية للـ Progress Bar خلال 10 ثوانٍ (10000 ميلي ثانية)
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          setLoadingText('أهلاً بك في عالم الحكايات!');
          
          // الانتقال التلقائي لصفحة /landing بعد اكتمال التحميل بـ 500 ميلي ثانية
          setTimeout(() => {
            navigate('/landing');
          }, 500);

          return 100;
        }
        // زيادة التقدم بمقدار أصغر (حوالي 5%) لتكتمل في 10 ثوانٍ تقريباً (تتكرر كل 50 ميلي ثانية)
        const diff = Math.random() * 5; 
        return Math.min(oldProgress + diff, 100);
      });
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, [navigate]);

  return (
    <Box
      sx={{
        backgroundColor: '#FDFBF7',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Cairo, sans-serif',
        padding: '16px 0',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '14px',
          background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      <Box sx={{ position: 'absolute', top: '5%', left: '8%', opacity: 0.6, color: '#C84B31', fontSize: 24 }}>★</Box>
      <Box sx={{ position: 'absolute', top: '8%', right: '12%', opacity: 0.6, color: '#4A90E2', fontSize: 30 }}>★</Box>
      <Box sx={{ position: 'absolute', top: '22%', left: '22%', opacity: 0.45, color: '#D4AF37', fontSize: 18 }}>★</Box>
      <Box sx={{ position: 'absolute', top: '35%', right: '5%', opacity: 0.5, color: '#2D5A27', fontSize: 26 }}>★</Box>
      <Box sx={{ position: 'absolute', top: '48%', left: '5%', opacity: 0.5, color: '#D4AF37', fontSize: 22 }}>★</Box>
      <Box sx={{ position: 'absolute', top: '62%', right: '15%', opacity: 0.55, color: '#C84B31', fontSize: 20 }}>★</Box>
      <Box sx={{ position: 'absolute', bottom: '8%', left: '18%', opacity: 0.6, color: '#4A90E2', fontSize: 28 }}>★</Box>
      <Box sx={{ position: 'absolute', bottom: '12%', right: '8%', opacity: 0.5, color: '#D4AF37', fontSize: 24 }}>★</Box>
      <Box sx={{ position: 'absolute', top: '75%', left: '42%', opacity: 0.4, color: '#2D5A27', fontSize: 18 }}>★</Box>
      <Box sx={{ position: 'absolute', top: '15%', right: '35%', opacity: 0.4, color: '#821515', fontSize: 16 }}>★</Box>
      <Box sx={{ position: 'absolute', bottom: '35%', right: '28%', opacity: 0.45, color: '#4A90E2', fontSize: 20 }}>★</Box>
      <Box sx={{ position: 'absolute', top: '88%', right: '38%', opacity: 0.4, color: '#C84B31', fontSize: 16 }}>★</Box>
      <Box sx={{ position: 'absolute', top: '14%', left: '35%', opacity: 0.6, fontSize: 24, transform: 'rotate(-15deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', top: '18%', right: '25%', opacity: 0.65, fontSize: 28, transform: 'rotate(20deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', top: '32%', left: '8%', opacity: 0.55, fontSize: 22, transform: 'rotate(12deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', top: '40%', left: '25%', opacity: 0.4, fontSize: 18, transform: 'rotate(-20deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', top: '52%', right: '10%', opacity: 0.6, fontSize: 26, transform: 'rotate(15deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', top: '65%', left: '10%', opacity: 0.6, fontSize: 28, transform: 'rotate(-12deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', bottom: '18%', right: '25%', opacity: 0.55, fontSize: 22, transform: 'rotate(25deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', bottom: '7%', left: '42%', opacity: 0.45, fontSize: 20, transform: 'rotate(-10deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', top: '28%', right: '40%', opacity: 0.35, fontSize: 18, transform: 'rotate(18deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', bottom: '40%', left: '38%', opacity: 0.4, fontSize: 24, transform: 'rotate(-25deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', top: '82%', right: '12%', opacity: 0.5, fontSize: 24, transform: 'rotate(10deg)' }}>🧩</Box>
      <Box sx={{ position: 'absolute', top: '5%', left: '48%', opacity: 0.35, fontSize: 18, transform: 'rotate(15deg)' }}>🧩</Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 1,
          marginTop: 'auto',
          marginBottom: 'auto',
          width: '100%',
          maxWidth: '500px',
          px: 2,
        }}
      >
        <Box
          sx={{
            width: '90px',
            height: '90px',
            backgroundColor: '#FFF',
            borderRadius: '20px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 24px auto',
            border: '1px solid #F0EBE1',
          }}
        >
          <Typography sx={{ fontSize: '40px' }}>🌿</Typography>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#2C3E35',
            mb: 1,
          }}
        >
          قطعة من فلسطين
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{
            color: '#8C9A92',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontSize: '11px',
            mb: 3,
          }}
        >
          A PIECE OF PALESTINE
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#556B62',
            fontSize: '15px',
            mb: 4,
          }}
        >
          اجمع القطع ... واكتشف الحكاية
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1.5,
            mb: 4,
          }}
        >
          <Box sx={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px dashed #B0AEA5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B0AEA5' }}>...</Box>
          <Box sx={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#5B92E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}><ExtensionIcon fontSize="small" /></Box>
          <Box sx={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#437C56', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}><ExtensionIcon fontSize="small" /></Box>
          <Box sx={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#E2B842', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}><ExtensionIcon fontSize="small" /></Box>
          <Box sx={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#D9534F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}><ExtensionIcon fontSize="small" /></Box>
        </Box>

        <Box sx={{ width: '80%', margin: '0 auto' }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              backgroundColor: '#E5E0D5',
              borderRadius: '10px',
              height: '8px',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#437C56',
                borderRadius: '10px',
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: '#8C9A92',
              display: 'block',
              mt: 1.5,
              fontSize: '12px',
            }}
          >
            {loadingText}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', zIndex: 1 }}>
        <Typography sx={{ color: '#8C9A92', fontSize: '12px' }}>صنع بحب من أجل أطفالنا</Typography>
        <FavoriteIcon sx={{ color: '#D9534F', fontSize: '14px' }} />
      </Box>

      <Box
        sx={{
          width: '100%',
          height: '14px',
          background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)',
          position: 'absolute',
          bottom: 0,
          left: 0,
        }}
      />
    </Box>
  );
};

export default Home;