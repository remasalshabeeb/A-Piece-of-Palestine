import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  Alert, 
  CircularProgress,
  Container 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SendIcon from '@mui/icons-material/Send';
import ExtensionIcon from '@mui/icons-material/Extension';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import logoImage from '../assets/logo.png';
import welcomeImage from '../assets/welcome.png';
import api from '../api';

const LandingPage = () => {
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  name: '',
  email: '',
  subject: '',
  message: ''
});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      await api.post('/contact', formData);
      setStatus({ type: 'success', text: 'تم إرسال رسالتك بنجاح! ستصل إلى فريق الإدارة.' });
      setFormData({
  name: '',
  email: '',
  subject: '',
  message: ''
});
    } catch (err) {
      setStatus({ 
        type: 'error', 
        text: err.response?.data?.message || 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة لاحقاً.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#FDFBF7',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
        m: 0,
        p: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* شريط الإطار العلوي */}
      <Box
        sx={{
          width: '100%',
          height: '10px',
          background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)',
        }}
      />

      <Box sx={{ width: '100%', maxWidth: '1300px', mx: 'auto', px: { xs: 2, md: 4 }, py: 2 }}>
        
    {/* ======================= النافبار المصلح بالكامل ======================= */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            width: '100%',
            py: 1.5,
            borderBottom: '1px solid #F0EBE1',
            mb: 4,
          }}
        >
          {/* 1. أقصى اليمين: الشعار واسم المنصة */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={logoImage}
              alt="قطعة من فلسطين"
              sx={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '50%' }}
            />
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 'bold', color: '#2D5A27', fontSize: '16px', lineHeight: 1.1 }}>قطعة من فلسطين</Typography>
              <Typography sx={{ fontSize: '10px', color: '#8C9A92', letterSpacing: '0.8px' }}>A Piece of Palestine</Typography>
            </Box>
          </Box>

          {/* 2. المنتصف: روابط الصفحات */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center', mx: 'auto' }}>
            <Typography 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{ color: '#2D5A27', fontWeight: 'bold', cursor: 'pointer', fontSize: '14.5px', borderBottom: '2px solid #2D5A27', pb: '2px', whiteSpace: 'nowrap' }}
            >
              الرئيسية
            </Typography>
            <Typography 
              onClick={() => scrollToSection('about-section')} 
              sx={{ color: '#556B62', cursor: 'pointer', fontSize: '14.5px', whiteSpace: 'nowrap', '&:hover': { color: '#2D5A27' } }}
            >
              عن المشروع
            </Typography>
            <Typography 
              onClick={() => scrollToSection('journey-section')} 
              sx={{ color: '#556B62', cursor: 'pointer', fontSize: '14.5px', whiteSpace: 'nowrap', '&:hover': { color: '#2D5A27' } }}
            >
              رحلتنا
            </Typography>
            <Typography 
              onClick={() => scrollToSection('contact-section')} 
              sx={{ color: '#556B62', cursor: 'pointer', fontSize: '14.5px', whiteSpace: 'nowrap', '&:hover': { color: '#2D5A27' } }}
            >
              تواصل معنا
            </Typography>
          </Box>

          {/* 3. أقصى اليسار: تسجيل الدخول ثم إنشاء حساب متتاليين */}
          <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              startIcon={<LoginIcon sx={{ fontSize: '16px' }} />}
              sx={{
                borderColor: '#2D5A27',
                color: '#2D5A27',
                borderRadius: '8px',
                px: 2,
                py: 0.6,
                fontFamily: 'Cairo',
                fontWeight: 'bold',
                fontSize: '13px',
                whiteSpace: 'nowrap',
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
                py: 0.6,
                fontFamily: 'Cairo',
                fontWeight: 'bold',
                fontSize: '13px',
                boxShadow: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: '#C84B31' },
              }}
            >
              إنشاء حساب
            </Button>
          </Box>
        </Box>

        {/* ======================= قسم الترحيب ======================= */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 4, my: 4 }}>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                color: '#2D5A27',
                mb: 2,
                fontSize: { xs: '28px', md: '42px' },
                lineHeight: 1.3,
              }}
            >
              أهلاً بكم في <br />قطعة من فلسطين
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: '#556B62', fontSize: '16px', mb: 3, lineHeight: 1.8 }}
            >
              مساحة ممتعة للأطفال لاكتشاف حكايات فلسطين وتراثها، والتعرّف إلى جمال أرضها بطريقة تفاعلية مليئة بالمِعرفة.
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                backgroundColor: '#D9534F',
                color: '#FFF',
                borderRadius: '10px',
                px: 3.5,
                py: 1.1,
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

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src={welcomeImage}
              alt="أرض فلسطين"
              sx={{
                width: '100%',
                maxWidth: '520px',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '20px',
              }}
            />
          </Box>
        </Box>

        {/* ======================= البطاقات التعريفية السريعة ======================= */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5, my: 5 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', backgroundColor: '#FFF', border: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 'bold', color: '#2C3E35', fontSize: '16.5px', mb: 0.5 }}>كل قطعة لها حكاية</Typography>
              <Typography sx={{ color: '#8C9A92', fontSize: '13px' }}>رحلة تجمع بين الثقافة والمرح</Typography>
            </Box>
            <span style={{ fontSize: '26px' }}>🧩</span>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', backgroundColor: '#FFF', border: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 'bold', color: '#2C3E35', fontSize: '16.5px', mb: 0.5 }}>نتعلّم معاً</Typography>
              <Typography sx={{ color: '#8C9A92', fontSize: '13px' }}>معرفة تناسب الأطفال وتشجّع الفضول</Typography>
            </Box>
            <MenuBookIcon sx={{ color: '#E2B842', fontSize: '28px' }} />
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', backgroundColor: '#FFF', border: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 'bold', color: '#2C3E35', fontSize: '16.5px', mb: 0.5 }}>تراثنا يحكي</Typography>
              <Typography sx={{ color: '#8C9A92', fontSize: '13px' }}>اكتشف حكايات وأماكن من فلسطين</Typography>
            </Box>
            <span style={{ fontSize: '26px' }}>🏛️</span>
          </Paper>
        </Box>

        {/* ======================= قسم عن المشروع (Grid 2x2 صريح ومستقل بدون تداخل) ======================= */}
        <Box id="about-section" sx={{ py: 6, borderTop: '1px solid #F0EBE1' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2D5A27', textAlign: 'center', mb: 1.5 }}>
            عن مشروع قطعة من فلسطين
          </Typography>
          <Typography variant="body1" sx={{ color: '#556B62', textAlign: 'center', maxWidth: '750px', mx: 'auto', mb: 5, lineHeight: 1.8, fontSize: '15.5px' }}>
            منصة تفاعلية تعليمية تهدف إلى تعزيز الوعي الهوياتي والتراثي لدى أطفالنا. من خلال ربط المعلومة التاريخية باللعب والتفاعل الذكي، يستطيع الطفل اكتشاف المدن والرموز والتاريخ الفلسطيني قطعةً بعد قطعة.
          </Typography>

          {/* شبكة CSS Grid صريحة (اثنتان فوق واثنتان تحت) لعدم التداخل إطلاقاً */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, width: '100%' }}>
            
            <Paper elevation={0} sx={{ p: 3.5, textAlign: 'center', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #F0EBE1' }}>
              <Typography variant="h1" sx={{ fontSize: '36px', mb: 1 }}>🌱</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2D5A27', mb: 1, fontSize: '18px' }}>غرس الجذور</Typography>
              <Typography variant="body2" sx={{ color: '#8C9A92', lineHeight: 1.7, fontSize: '13.5px' }}>
                تعريف الجيل الجديد بحكايات مدنهم وقراهم وأشجار الزيتون والتراث العريق في إطار مبسط ومحبب.
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3.5, textAlign: 'center', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #F0EBE1' }}>
              <Typography variant="h1" sx={{ fontSize: '36px', mb: 1 }}>🎮</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2D5A27', mb: 1, fontSize: '18px' }}>التعلم باللعب (Gamification)</Typography>
              <Typography variant="body2" sx={{ color: '#8C9A92', lineHeight: 1.7, fontSize: '13.5px' }}>
                تحويل المعلومات إلى أسئلة وألغاز بازل مشوقة، حيث تكتمل اللوحة المعرفية مع كل إجابة صحيحة.
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3.5, textAlign: 'center', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #F0EBE1' }}>
              <Typography variant="h1" sx={{ fontSize: '36px', mb: 1 }}>🏅</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2D5A27', mb: 1, fontSize: '18px' }}>تحفيز ومكافآت</Typography>
              <Typography variant="body2" sx={{ color: '#8C9A92', lineHeight: 1.7, fontSize: '13.5px' }}>
                يحصل الطفل عند إكمال كل مرحلة على أوسمة ونقاط تميز تشجعه على استكمال جميع مراحل الرحلة.
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3.5, textAlign: 'center', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #F0EBE1' }}>
              <Typography variant="h1" sx={{ fontSize: '36px', mb: 1 }}>🏛️</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2D5A27', mb: 1, fontSize: '18px' }}>اكتشاف التراث</Typography>
              <Typography variant="body2" sx={{ color: '#8C9A92', lineHeight: 1.7, fontSize: '13.5px' }}>
                ربط الجغرافيا بالثقافة وتعميق معارف الأبناء بالرموز الوطنية والمعالم القديمة بكل إتقان.
              </Typography>
            </Paper>

          </Box>
        </Box>

        {/* ======================= قسم رحلتنا ======================= */}
        <Box id="journey-section" sx={{ py: 6, borderTop: '1px solid #F0EBE1' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2D5A27', textAlign: 'center', mb: 1.5 }}>
            رحلتنا التفاعلية
          </Typography>
          <Typography variant="body1" sx={{ color: '#556B62', textAlign: 'center', mb: 5 }}>
            كيف يخوض الطفل تجربته داخل المنصة؟
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#FFF', borderRadius: '16px', border: '2px dashed #2D5A27' }}>
              <MenuBookIcon sx={{ fontSize: '40px', color: '#2D5A27', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '16px' }}>1. اقرأ القصة</Typography>
              <Typography variant="body2" sx={{ color: '#8C9A92', fontSize: '13px' }}>يبدأ البطل بقراءة حكاية قصيرة وممتعة عن المرحلة.</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#FFF', borderRadius: '16px', border: '2px dashed #E2B842' }}>
              <QuizIcon sx={{ fontSize: '40px', color: '#E2B842', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '16px' }}>2. أجب عن الأسئلة</Typography>
              <Typography variant="body2" sx={{ color: '#8C9A92', fontSize: '13px' }}>يختبر معلوماته بأسئلة شيقة ومصممة بعناية.</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#FFF', borderRadius: '16px', border: '2px dashed #C84B31' }}>
              <ExtensionIcon sx={{ fontSize: '40px', color: '#C84B31', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '16px' }}>3. اجمع قطع البازل</Typography>
              <Typography variant="body2" sx={{ color: '#8C9A92', fontSize: '13px' }}>مع كل إجابة صحيحة تفتح قطعة جديدة من الصورة.</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#FFF', borderRadius: '16px', border: '2px dashed #2D5A27' }}>
              <EmojiEventsIcon sx={{ fontSize: '40px', color: '#2D5A27', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '16px' }}>4. اكمل البازل والوسام</Typography>
              <Typography variant="body2" sx={{ color: '#8C9A92', fontSize: '13px' }}>عند اكتمال القطع يفتح البازل الكامل ويكسب وسام المرحلة!</Typography>
            </Paper>
          </Box>
        </Box>

        {/* ======================= قسم تواصل معنا ======================= */}
        <Box id="contact-section" sx={{ py: 6, borderTop: '1px solid #F0EBE1' }}>
          <Container maxWidth="md">
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4.5 }, borderRadius: '20px', backgroundColor: '#FFF', border: '1px solid #F0EBE1' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2D5A27', textAlign: 'center', mb: 1 }}>
                تواصل معنا
              </Typography>
              <Typography variant="body1" sx={{ color: '#556B62', textAlign: 'center', mb: 3.5, fontSize: '14.5px' }}>
                يسعدنا تلقي استفساراتكم وآرائكم. أرسل لنا رسالة وستصل مباشرة إلى فريق الإدارة.
              </Typography>

              {status.text && (
                <Alert severity={status.type} sx={{ mb: 3, fontFamily: 'Cairo' }}>
                  {status.text}
                </Alert>
              )}

              <Box component="form" onSubmit={handleContactSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="الاسم الكامل"
                    variant="outlined"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    type="email"
                    variant="outlined"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                </Box>

                <TextField
  fullWidth
  label="موضوع الرسالة"
  name="subject"
  variant="outlined"
  required
  value={formData.subject}
  onChange={(e) =>
    setFormData({ ...formData, subject: e.target.value })
  }
  inputProps={{ maxLength: 150 }}
  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
/>

                <TextField
                  fullWidth
                  label="رسالتك أو ملاحظتك"
                  multiline
                  rows={4}
                  variant="outlined"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{
                      backgroundColor: '#2D5A27',
                      color: '#FFF',
                      borderRadius: '10px',
                      px: 5,
                      py: 1.1,
                      fontSize: '15px',
                      fontWeight: 'bold',
                      fontFamily: 'Cairo',
                      '&:hover': { backgroundColor: '#1E3D1A' },
                    }}
                  >
                    {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>

      </Box>

      {/* التذييل السفلي */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', py: 2, width: '100%', backgroundColor: '#FDFBF7' }}>
        <Typography sx={{ color: '#8C9A92', fontSize: '13px' }}>صنع من أجل أطفالنا</Typography>
        <FavoriteIcon sx={{ color: '#D9534F', fontSize: '15px' }} />
      </Box>

      {/* شريط الإطار السفلي */}
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