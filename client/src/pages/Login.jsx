
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import API from '../api';
import logoImage from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      const token = response.data.tokens;
      const user = response.data.user;
      const userRole = user?.role;

      // لا نقبل تسجيل الدخول دون توكن ودور معروف
      if (!token || !user || !userRole) {
        throw new Error('بيانات تسجيل الدخول المستلمة من الخادم غير مكتملة.');
      }

      // حفظ بيانات الجلسة
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', userRole);

      // التوجيه بناءً على الدور الحقيقي من الخادم
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'contentManager') {
        navigate('/content/dashboard');
      } else if (userRole === 'user') {
        navigate('/user/dashboard');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');

        setError('نوع الحساب غير معروف. يرجى التواصل مع المسؤول.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'حدث خطأ أثناء تسجيل الدخول، تأكدي من البيانات.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#FDFBF7',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        direction: 'rtl',
        fontFamily: 'Cairo, sans-serif'
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '12px',
          background:
            'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)'
        }}
      />

      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: '420px',
          width: '90%',
          borderRadius: '20px',
          border: '1px solid #F0EBE1',
          backgroundColor: '#FFF',
          textAlign: 'center',
          boxShadow: '0px 8px 30px rgba(0,0,0,0.04)',
          my: 'auto'
        }}
      >
        <Box
          component="img"
          src={logoImage}
          alt="شعار قطعة من فلسطين"
          sx={{ width: '60px', height: '60px', mb: 1 }}
        />

        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', color: '#2D5A27', mb: 0.5 }}
        >
          تسجيل الدخول
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: '#8C9A92', mb: 3 }}
        >
          أهلاً بك مجدداً في قطعة من فلسطين
        </Typography>

        {error && (
          <Typography
            role="alert"
            sx={{ color: '#D9534F', fontSize: '13px', mb: 2 }}
          >
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            variant="contained"
            startIcon={<LoginIcon />}
            sx={{
              backgroundColor: '#2D5A27',
              color: '#FFF',
              py: 1.2,
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '16px',
              fontFamily: 'Cairo',
              '&:hover': { backgroundColor: '#1E3D1A' }
            }}
          >
            {loading ? 'جارٍ تسجيل الدخول...' : 'دخول'}
          </Button>
        </form>

        <Typography
          variant="body2"
          sx={{ mt: 3, color: '#556B62' }}
        >
          ليس لديك حساب؟{' '}
          <Link
            to="/register"
            style={{
              color: '#D9534F',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}
          >
            أنشئ حساباً جديداً
          </Link>
        </Typography>
      </Paper>

      <Box
        sx={{
          width: '100%',
          height: '12px',
          background:
            'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)'
        }}
      />
    </Box>
  );
};

export default Login;