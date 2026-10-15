import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import API from '../api';
import logoImage from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await API.post('/auth/login', { email, password });
      
const token = response.data.tokens;      // استخراج الدور سواء جاء داخل user أو بشكل مباشر من السيرفر
      const userRole = response.data.user?.role || response.data.role || role;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(response.data.user || { role: userRole }));
      localStorage.setItem('role', userRole);

      // التوجيه بناءً على الدور (أدمن أو مستخدم)
      if (userRole.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول، تأكد من البيانات.');
    }
  };

  return (
    <Box sx={{ backgroundColor: '#FDFBF7', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
      <Box sx={{ width: '100%', height: '12px', background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)' }} />

      <Paper elevation={0} sx={{ p: 4, maxWidth: '420px', width: '90%', borderRadius: '20px', border: '1px solid #F0EBE1', backgroundColor: '#FFF', textAlign: 'center', boxShadow: '0px 8px 30px rgba(0,0,0,0.04)', my: 'auto' }}>
        <Box component="img" src={logoImage} alt="شعار قطعة من فلسطين" sx={{ width: '60px', height: '60px', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2D5A27', mb: 0.5 }}>تسجيل الدخول</Typography>
        <Typography variant="body2" sx={{ color: '#8C9A92', mb: 3 }}>أهلاً بك مجدداً في قطعة من فلسطين</Typography>

        {error && <Typography sx={{ color: '#D9534F', fontSize: '13px', mb: 2 }}>{error}</Typography>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }} />
          <TextField fullWidth label="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 2 }} />

          <FormControl component="fieldset" sx={{ mb: 2, width: '100%', textAlign: 'right' }}>
            <FormLabel component="legend" sx={{ fontSize: '13px', color: '#2D5A27', fontWeight: 'bold' }}>نوع الحساب:</FormLabel>
            <RadioGroup row value={role} onChange={(e) => setRole(e.target.value)} sx={{ justifyContent: 'center', gap: 2 }}>
              <FormControlLabel value="user" control={<Radio color="success" />} label="مستخدم (طفل)" />
              <FormControlLabel value="admin" control={<Radio color="error" />} label="مسؤول (أدمن)" />
            </RadioGroup>
          </FormControl>

          <Button type="submit" fullWidth variant="contained" startIcon={<LoginIcon />} sx={{ backgroundColor: '#2D5A27', color: '#FFF', py: 1.2, borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', fontFamily: 'Cairo', '&:hover': { backgroundColor: '#1E3D1A' } }}>
            دخول
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 3, color: '#556B62' }}>
          ليس لديك حساب؟ <Link to="/register" style={{ color: '#D9534F', fontWeight: 'bold', textDecoration: 'none' }}>أنشئ حساباً جديداً</Link>
        </Typography>
      </Paper>

      <Box sx={{ width: '100%', height: '12px', background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)' }} />
    </Box>
  );
};

export default Login;