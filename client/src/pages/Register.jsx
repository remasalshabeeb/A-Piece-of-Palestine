import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import API from '../api';
import logoImage from '../assets/logo.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await API.post('/auth/register', { 
        name, 
        email, 
        password, 
        confirmPassword: password, // إرسال تأكيد كلمة المرور مطابقة لكلمة المرور
        phoneNumber: "0000000000", // قيمة افتراضية لرقم الهاتف إذا لم يكن مدخلاً في الفورم
        role 
      });
      
      alert('تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب، تأكد من المدخلات.');
    }
  };

  return (
    <Box sx={{ backgroundColor: '#FDFBF7', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
      <Box sx={{ width: '100%', height: '12px', background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)' }} />

      <Paper elevation={0} sx={{ p: 4, maxWidth: '420px', width: '90%', borderRadius: '20px', border: '1px solid #F0EBE1', backgroundColor: '#FFF', textAlign: 'center', boxShadow: '0px 8px 30px rgba(0,0,0,0.04)', my: 'auto' }}>
        <Box component="img" src={logoImage} alt="شعار قطعة من فلسطين" sx={{ width: '60px', height: '60px', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2D5A27', mb: 0.5 }}>إنشاء حساب جديد</Typography>
        <Typography variant="body2" sx={{ color: '#8C9A92', mb: 2 }}>انضم إلينا في رحلة اكتشاف فلسطين</Typography>

        {error && <Typography sx={{ color: '#D9534F', fontSize: '12px', mb: 2, textAlign: 'right' }}>{error}</Typography>}

        <form onSubmit>
          <TextField fullWidth label="الاسم الكامل" value={name} onChange={(e) => setName(e.target.value)} required sx={{ mb: 2 }} />
          <TextField fullWidth label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }} />
          <TextField fullWidth label="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 2 }} />

          <FormControl component="fieldset" sx={{ mb: 2, width: '100%', textAlign: 'right' }}>
            <FormLabel component="legend" sx={{ fontSize: '13px', color: '#2D5A27', fontWeight: 'bold' }}>التسجيل كـ:</FormLabel>
            <RadioGroup row value={role} onChange={(e) => setRole(e.target.value)} sx={{ justifyContent: 'center', gap: 2 }}>
              <FormControlLabel value="user" control={<Radio color="success" />} label="مستخدم (طفل)" />
              <FormControlLabel value="admin" control={<Radio color="error" />} label="مسؤول (أدمن)" />
            </RadioGroup>
          </FormControl>

          <Button type="submit" onClick={handleSubmit} fullWidth variant="contained" startIcon={<PersonAddIcon />} sx={{ backgroundColor: '#D9534F', color: '#FFF', py: 1.2, borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', fontFamily: 'Cairo', '&:hover': { backgroundColor: '#C84B31' } }}>
            إنشاء الحساب
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 3, color: '#556B62' }}>
          لديك حساب بالفعل؟ <Link to="/login" style={{ color: '#2D5A27', fontWeight: 'bold', textDecoration: 'none' }}>تسجيل الدخول</Link>
        </Typography>
      </Paper>

      <Box sx={{ width: '100%', height: '12px', background: 'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)' }} />
    </Box>
  );
};

Register.propTypes = {};

export default Register;