
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import API from '../api';
import logoImage from '../assets/logo.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setLoading(true);

    try {
      await API.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword
      });

      alert('تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن.');
      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'حدث خطأ أثناء إنشاء الحساب، تأكدي من البيانات.'
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
          إنشاء حساب جديد
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: '#8C9A92', mb: 2 }}
        >
          انضم إلينا في رحلة اكتشاف فلسطين
        </Typography>

        {error && (
          <Typography
            role="alert"
            sx={{
              color: '#D9534F',
              fontSize: '12px',
              mb: 2,
              textAlign: 'right'
            }}
          >
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="الاسم الكامل"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            inputProps={{ minLength: 3 }}
            sx={{ mb: 2 }}
          />

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
            helperText="8 أحرف على الأقل، مع حرف كبير وصغير ورقم ورمز خاص."
            inputProps={{ minLength: 8 }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="تأكيد كلمة المرور"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{
              backgroundColor: '#D9534F',
              color: '#FFF',
              py: 1.2,
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '16px',
              fontFamily: 'Cairo',
              '&:hover': { backgroundColor: '#C84B31' }
            }}
          >
            {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
          </Button>
        </form>

        <Typography
          variant="body2"
          sx={{ mt: 3, color: '#556B62' }}
        >
          لديك حساب بالفعل؟{' '}
          <Link
            to="/login"
            style={{
              color: '#2D5A27',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}
          >
            تسجيل الدخول
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

export default Register;