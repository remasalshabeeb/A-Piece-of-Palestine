
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import API from '../api';
import logoImage from '../assets/logo.png';

const GREEN = '#2D5A27';
const RED = '#C84B31';
const GOLD = '#D4AF37';
const CREAM = '#FDFBF7';
const TEXT = '#2C3E35';
const MUTED = '#8C9A92';
const BORDER = '#F0EBE1';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const emptyStage = {
  title: '',
  description: '',
  difficulty: 'easy',
  order: '',
  pieceId: '',
};

const createEmptyQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  points: 10,
  order: 1,
  pieceId: '',
});

const getId = (value) =>
  String(value?._id || value?.id || value || '');

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const Symbol = ({ children, color = 'inherit', size = 22 }) => (
  <Box
    component="span"
    aria-hidden="true"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color,
      fontSize: size,
      lineHeight: 1,
      minWidth: size,
    }}
  >
    {children}
  </Box>
);

const ContentManagerDashboard = () => {
  const navigate = useNavigate();

  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [questions, setQuestions] = useState([]);

  const [stageForm, setStageForm] = useState(emptyStage);
  const [stageImageFile, setStageImageFile] = useState(null);
  const [stageImagePreview, setStageImagePreview] = useState('');

  // نموذج إضافة سؤال جديد
  const [questionForm, setQuestionForm] = useState(
    createEmptyQuestion(),
  );

  // نموذج تعديل سؤال موجود
  const [editingQuestionId, setEditingQuestionId] = useState('');
  const [editingQuestionForm, setEditingQuestionForm] = useState(
    createEmptyQuestion(),
  );

  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingStage, setSavingStage] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [savingQuestionEdit, setSavingQuestionEdit] = useState(false);

  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');
  const [stageError, setStageError] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [editQuestionError, setEditQuestionError] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    navigate('/login', { replace: true });
  }, [navigate]);

  const handleUnauthorized = useCallback(
    (error) => {
      if (error.response?.status === 401) {
        handleLogout();
        return true;
      }

      return false;
    },
    [handleLogout],
  );

  const loadStages = useCallback(async () => {
    try {
      setLoading(true);
      setPageError('');

      const response = await API.get('/stages/manage');
      const loadedStages = response.data.stages || [];

      setStages(loadedStages);

      setSelectedStageId((currentId) => {
        if (
          currentId &&
          loadedStages.some((stage) => getId(stage) === currentId)
        ) {
          return currentId;
        }

        const availableStage = loadedStages.find(
          (stage) =>
            stage.approvalStatus === 'approved' &&
            stage.isActive !== false,
        );

        return availableStage ? getId(availableStage) : '';
      });
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setPageError(
        getErrorMessage(
          error,
          'تعذر تحميل المراحل. تحققي من تشغيل الخادم وصلاحيات الحساب.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  const selectedStage = stages.find(
    (stage) => getId(stage) === selectedStageId,
  );

  const canAddQuestions =
    Boolean(selectedStage) &&
    selectedStage.approvalStatus === 'approved' &&
    selectedStage.isActive !== false;

  const loadQuestions = useCallback(async () => {
    if (!selectedStageId || !canAddQuestions) {
      setQuestions([]);
      return;
    }

    try {
      setLoadingQuestions(true);
      setQuestionError('');

      const response = await API.get(
        `/stages/${selectedStageId}/questions/manage`,
      );

      setQuestions(response.data.questions || []);
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setQuestionError(
        getErrorMessage(error, 'تعذر تحميل أسئلة المرحلة.'),
      );
    } finally {
      setLoadingQuestions(false);
    }
  }, [selectedStageId, canAddQuestions, handleUnauthorized]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const updateStageField = (field, value) => {
    setStageForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleStageImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setStageError('');
    setPageSuccess('');

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setStageImageFile(null);
      setStageImagePreview('');
      event.target.value = '';

      setStageError(
        'اختاري صورة بصيغة JPG أو PNG أو WEBP أو GIF.',
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setStageImageFile(null);
      setStageImagePreview('');
      event.target.value = '';

      setStageError('يجب ألا يتجاوز حجم الصورة 5 ميغابايت.');
      return;
    }

    setStageImageFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStageImagePreview(reader.result);
      } else {
        setStageImagePreview('');
        setStageError('تعذرت معاينة الصورة. اختاري صورة أخرى.');
      }
    };

    reader.onerror = () => {
      setStageImageFile(null);
      setStageImagePreview('');
      setStageError('تعذرت قراءة الصورة. اختاري صورة أخرى.');
    };

    reader.readAsDataURL(file);
  };

  const removeStageImage = () => {
    setStageImageFile(null);
    setStageImagePreview('');

    const fileInput = document.getElementById('stage-image-upload');

    if (fileInput) fileInput.value = '';
  };

  // تحديث نموذج إضافة سؤال
  const updateQuestionField = (field, value) => {
    setQuestionForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateOption = (index, value) => {
    setQuestionForm((current) => {
      const options = [...current.options];
      const previousOption = options[index];

      options[index] = value;

      return {
        ...current,
        options,
        correctAnswer:
          current.correctAnswer === previousOption
            ? ''
            : current.correctAnswer,
      };
    });
  };

  // تحديث نموذج تعديل سؤال
  const updateEditingQuestionField = (field, value) => {
    setEditingQuestionForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateEditingOption = (index, value) => {
    setEditingQuestionForm((current) => {
      const options = [...current.options];
      const previousOption = options[index];

      options[index] = value;

      return {
        ...current,
        options,
        correctAnswer:
          current.correctAnswer === previousOption
            ? ''
            : current.correctAnswer,
      };
    });
  };

  // التحقق من بيانات السؤال قبل الإضافة أو التعديل
  const validateQuestionForm = (form) => {
    const questionText = form.question.trim();
    const options = form.options.map((option) => option.trim());
    const correctAnswer = form.correctAnswer.trim();
    const points = Number(form.points);
    const order = Number(form.order);
    const pieceId = form.pieceId.trim();

    if (questionText.length < 3 || questionText.length > 1000) {
      return 'يجب أن يتراوح نص السؤال بين 3 و1000 حرف.';
    }

    if (options.length < 2 || options.some((option) => !option)) {
      return 'يرجى تعبئة جميع خيارات الإجابة.';
    }

    if (options.some((option) => option.length > 300)) {
      return 'لا يمكن أن يتجاوز الخيار 300 حرف.';
    }

    if (new Set(options).size !== options.length) {
      return 'يجب أن تكون جميع الخيارات مختلفة.';
    }

    if (!options.includes(correctAnswer)) {
      return 'اختاري الإجابة الصحيحة من الخيارات.';
    }

    if (!Number.isInteger(points) || points < 1 || points > 100) {
      return 'النقاط يجب أن تكون عددًا صحيحًا بين 1 و100.';
    }

    if (!Number.isInteger(order) || order < 1) {
      return 'ترتيب السؤال يجب أن يكون عددًا صحيحًا موجبًا.';
    }

    if (!pieceId || pieceId.length > 100) {
      return 'أدخلي معرّفًا لقطعة الأحجية لا يتجاوز 100 حرف.';
    }

    return null;
  };

  const makeQuestionPayload = (form) => ({
    stageId: selectedStageId,
    question: form.question.trim(),
    options: form.options.map((option) => option.trim()),
    correctAnswer: form.correctAnswer.trim(),
    points: Number(form.points),
    order: Number(form.order),
    pieceId: form.pieceId.trim(),
  });

  const handleCreateStage = async (event) => {
    event.preventDefault();

    setStageError('');
    setPageSuccess('');

    const title = stageForm.title.trim();
    const description = stageForm.description.trim();
    const order = Number(stageForm.order);
    const pieceId = stageForm.pieceId.trim();

    if (title.length < 3 || title.length > 100) {
      setStageError('يجب أن يتراوح اسم المرحلة بين 3 و100 حرف.');
      return;
    }

    if (!description || description.length > 1000) {
      setStageError(
        'أدخلي وصف المرحلة، على ألا يتجاوز 1000 حرف.',
      );
      return;
    }

    if (!Number.isInteger(order) || order < 1) {
      setStageError(
        'ترتيب المرحلة يجب أن يكون عددًا صحيحًا أكبر من صفر.',
      );
      return;
    }

    if (pieceId.length > 100) {
      setStageError(
        'معرّف قطعة الأحجية لا يمكن أن يتجاوز 100 حرف.',
      );
      return;
    }

    if (
      stageImageFile &&
      !ALLOWED_IMAGE_TYPES.includes(stageImageFile.type)
    ) {
      setStageError('نوع الصورة غير مدعوم.');
      return;
    }

    if (stageImageFile && stageImageFile.size > MAX_IMAGE_SIZE) {
      setStageError('يجب ألا يتجاوز حجم الصورة 5 ميغابايت.');
      return;
    }

    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    formData.append('difficulty', stageForm.difficulty);
    formData.append('order', String(order));

    if (pieceId) formData.append('pieceId', pieceId);
    if (stageImageFile) formData.append('image', stageImageFile);

    try {
      setSavingStage(true);

      const response = await API.post('/stages', formData);

      setStageForm({ ...emptyStage });
      setStageImageFile(null);
      setStageImagePreview('');

      const fileInput = document.getElementById('stage-image-upload');
      if (fileInput) fileInput.value = '';

      setPageSuccess(
        response.data.message || 'تم إرسال المرحلة للمراجعة بنجاح.',
      );

      await loadStages();
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setStageError(
        getErrorMessage(
          error,
          'تعذر إرسال المرحلة. تحققي من البيانات وحاولي مجددًا.',
        ),
      );
    } finally {
      setSavingStage(false);
    }
  };

  const handleCreateQuestion = async (event) => {
    event.preventDefault();

    setQuestionError('');
    setPageSuccess('');

    if (!canAddQuestions) {
      setQuestionError(
        'يجب أن تكون المرحلة معتمدة ونشطة قبل إضافة الأسئلة.',
      );
      return;
    }

    const validationError = validateQuestionForm(questionForm);

    if (validationError) {
      setQuestionError(validationError);
      return;
    }

    try {
      setSavingQuestion(true);

      const response = await API.post(
        '/questions',
        makeQuestionPayload(questionForm),
      );

      setQuestionForm({
        ...createEmptyQuestion(),
        order: questions.length + 2,
      });

      setPageSuccess(
        response.data.message || 'تم إرسال السؤال للمراجعة بنجاح.',
      );

      await loadQuestions();
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setQuestionError(
        getErrorMessage(
          error,
          'تعذر إرسال السؤال. تحققي من البيانات وحاولي مجددًا.',
        ),
      );
    } finally {
      setSavingQuestion(false);
    }
  };

  // تعبئة نموذج التعديل من السؤال الذي اختاره المستخدم
  const handleStartEditingQuestion = (question) => {
    setEditingQuestionId(getId(question));

    setEditingQuestionForm({
      question: question.question || '',
      options: Array.isArray(question.options)
        ? [
            ...question.options,
            ...Array(Math.max(0, 4 - question.options.length)).fill(''),
          ].slice(0, 4)
        : ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      points: question.points ?? 10,
      order: question.order ?? 1,
      pieceId: question.pieceId || '',
    });

    setEditQuestionError('');
    setQuestionError('');
    setPageSuccess('');

    // الانتقال إلى نموذج التعديل أسفل قائمة الأسئلة
    window.setTimeout(() => {
      document
        .getElementById('edit-question-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleCancelEditingQuestion = () => {
    setEditingQuestionId('');
    setEditingQuestionForm(createEmptyQuestion());
    setEditQuestionError('');
  };

  const handleUpdateQuestion = async (event) => {
    event.preventDefault();

    setEditQuestionError('');
    setPageSuccess('');

    if (!editingQuestionId) {
      setEditQuestionError('اختاري السؤال الذي تريدين تعديله.');
      return;
    }

    if (!canAddQuestions) {
      setEditQuestionError(
        'لا يمكن تعديل الأسئلة ما لم تكن المرحلة معتمدة ونشطة.',
      );
      return;
    }

    const validationError = validateQuestionForm(editingQuestionForm);

    if (validationError) {
      setEditQuestionError(validationError);
      return;
    }

    try {
      setSavingQuestionEdit(true);

      const response = await API.put(
        `/questions/${editingQuestionId}`,
        makeQuestionPayload(editingQuestionForm),
      );

      setPageSuccess(
        response.data.message ||
          'تم إرسال تعديلات السؤال إلى المدير للمراجعة.',
      );

      handleCancelEditingQuestion();

      // نعيد تحميل الأسئلة؛ في حساب مدير المحتوى ستبقى النسخة
      // المنشورة كما هي إلى أن يوافق المدير على التعديلات.
      await loadQuestions();
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setEditQuestionError(
        getErrorMessage(
          error,
          'تعذر إرسال تعديلات السؤال. تحققي من البيانات وحاولي مجددًا.',
        ),
      );
    } finally {
      setSavingQuestionEdit(false);
    }
  };

  const getStatus = (stage) => {
    if (
      stage.approvalStatus === 'approved' &&
      stage.isActive
    ) {
      return { label: 'معتمدة', color: 'success' };
    }

    if (stage.approvalStatus === 'rejected') {
      return { label: 'مرفوضة', color: 'error' };
    }

    if (stage.approvalStatus === 'approved') {
      return { label: 'غير نشطة', color: 'default' };
    }

    return { label: 'بانتظار الموافقة', color: 'warning' };
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#FFF',
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Cairo, sans-serif',
    },
  };

  const buttonSx = {
    borderRadius: '12px',
    py: 1.3,
    fontWeight: 800,
    fontFamily: 'Cairo, sans-serif',
  };

  const htmlInputProps = (props) => ({
    slotProps: {
      htmlInput: props,
    },
  });

  const renderQuestionFields = (
    form,
    updateField,
    updateOptionField,
    prefix,
  ) => (
    <Stack spacing={2}>
      <TextField
        label="نص السؤال"
        placeholder="اكتبي السؤال هنا"
        value={form.question}
        onChange={(event) =>
          updateField('question', event.target.value)
        }
        {...htmlInputProps({ maxLength: 1000 })}
        multiline
        minRows={2}
        required
        fullWidth
        sx={inputSx}
      />

      <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
        خيارات الإجابة
      </Typography>

      {form.options.map((option, index) => (
        <TextField
          key={`${prefix}-option-${index}`}
          label={`الخيار ${index + 1}`}
          value={option}
          onChange={(event) =>
            updateOptionField(index, event.target.value)
          }
          {...htmlInputProps({ maxLength: 300 })}
          required
          fullWidth
          sx={inputSx}
        />
      ))}

      <TextField
        select
        label="الإجابة الصحيحة"
        value={form.correctAnswer}
        onChange={(event) =>
          updateField('correctAnswer', event.target.value)
        }
        required
        fullWidth
        sx={inputSx}
      >
        {form.options
          .map((option) => option.trim())
          .filter(Boolean)
          .filter(
            (option, index, options) =>
              options.indexOf(option) === index,
          )
          .map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
      </TextField>

      <TextField
        label="النقاط"
        type="number"
        value={form.points}
        onChange={(event) =>
          updateField('points', event.target.value)
        }
        {...htmlInputProps({ min: 1, max: 100, step: 1 })}
        required
        fullWidth
        sx={inputSx}
      />

      <TextField
        label="ترتيب السؤال"
        type="number"
        value={form.order}
        onChange={(event) =>
          updateField('order', event.target.value)
        }
        {...htmlInputProps({ min: 1, step: 1 })}
        required
        fullWidth
        sx={inputSx}
      />

      <TextField
        label="معرّف قطعة الأحجية"
        placeholder="مثال: piece-1"
        value={form.pieceId}
        onChange={(event) =>
          updateField('pieceId', event.target.value)
        }
        {...htmlInputProps({ maxLength: 100 })}
        helperText="يجب أن يكون المعرّف فريدًا داخل المرحلة."
        required
        fullWidth
        sx={inputSx}
      />
    </Stack>
  );

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: '100vh',
        backgroundColor: CREAM,
        color: TEXT,
        fontFamily: 'Cairo, sans-serif',
        overflowX: 'clip',
        '& *': { boxSizing: 'border-box' },
      }}
    >
      <Box
        sx={{
          height: 12,
          background:
            'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)',
        }}
      />

      <Box
        component="main"
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 5 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Box
          component="header"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="شعار قطعة من فلسطين"
              sx={{
                width: 52,
                height: 52,
                objectFit: 'contain',
              }}
            />

            <Box>
              <Typography
                sx={{
                  color: GREEN,
                  fontSize: { xs: 17, sm: 21 },
                  fontWeight: 900,
                }}
              >
                قطعة من فلسطين
              </Typography>

              <Typography sx={{ color: MUTED, fontSize: 12 }}>
                لوحة إدارة المحتوى
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Symbol>↻</Symbol>}
              onClick={loadStages}
              sx={{
                ...buttonSx,
                color: GREEN,
                borderColor: BORDER,
              }}
            >
              تحديث
            </Button>

            <Button
              variant="outlined"
              startIcon={<Symbol>⇥</Symbol>}
              onClick={handleLogout}
              sx={{
                ...buttonSx,
                color: RED,
                borderColor: '#E8C5BA',
              }}
            >
              خروج
            </Button>
          </Stack>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: '24px',
            color: '#FFF',
            background:
              'linear-gradient(115deg, #21451D 0%, #2D5A27 60%, #557D43 100%)',
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 25, md: 32 },
              fontWeight: 900,
              mb: 1,
            }}
          >
            اصنع حكاية مرحلة جديدة
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 2,
              color: '#F2F7EE',
              maxWidth: 720,
            }}
          >
            أنشئ المراحل والأسئلة بنفسك، وحدد خيارات الإجابة وقطع
            الأحجية. سيرسل المحتوى الذي تضيفه إلى المدير للمراجعة
            وفق صلاحيات المنصة.
          </Typography>
        </Paper>

        {pageError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {pageError}
          </Alert>
        )}

        {pageSuccess && (
          <Alert
            severity="success"
            onClose={() => setPageSuccess('')}
            sx={{ mb: 3 }}
          >
            {pageSuccess}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(0, 0.85fr) minmax(0, 1.15fr)',
            },
            gap: 3,
            alignItems: 'start',
          }}
        >
          {/* إنشاء مرحلة */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '22px',
              border: `1px solid ${BORDER}`,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                backgroundColor: '#F4F7F0',
              }}
            >
              <Symbol color={GREEN} size={30}>▤</Symbol>

              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                  إنشاء مرحلة
                </Typography>
                <Typography sx={{ color: MUTED, fontSize: 12 }}>
                  املئي بيانات المرحلة الجديدة
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box
              component="form"
              onSubmit={handleCreateStage}
              sx={{ p: 3 }}
            >
              {stageError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {stageError}
                </Alert>
              )}

              <Stack spacing={2.2}>
                <TextField
                  label="اسم المرحلة"
                  placeholder="اكتبي اسم المرحلة"
                  value={stageForm.title}
                  onChange={(event) =>
                    updateStageField('title', event.target.value)
                  }
                  {...htmlInputProps({ maxLength: 100 })}
                  required
                  fullWidth
                  sx={inputSx}
                />

                <TextField
                  label="وصف المرحلة"
                  placeholder="ما الذي سيكتشفه اللاعب في هذه المرحلة؟"
                  value={stageForm.description}
                  onChange={(event) =>
                    updateStageField('description', event.target.value)
                  }
                  {...htmlInputProps({ maxLength: 1000 })}
                  multiline
                  minRows={3}
                  required
                  fullWidth
                  sx={inputSx}
                />

                <TextField
                  select
                  label="مستوى الصعوبة"
                  value={stageForm.difficulty}
                  onChange={(event) =>
                    updateStageField('difficulty', event.target.value)
                  }
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="easy">سهل</MenuItem>
                  <MenuItem value="medium">متوسط</MenuItem>
                  <MenuItem value="hard">صعب</MenuItem>
                </TextField>

                <TextField
                  label="ترتيب المرحلة"
                  type="number"
                  value={stageForm.order}
                  onChange={(event) =>
                    updateStageField('order', event.target.value)
                  }
                  {...htmlInputProps({ min: 1, step: 1 })}
                  required
                  fullWidth
                  sx={inputSx}
                />

                <Box>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: 14, mb: 1 }}
                  >
                    صورة المرحلة (اختياري)
                  </Typography>

                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    sx={{
                      ...buttonSx,
                      minHeight: 52,
                      color: GREEN,
                      borderColor: GREEN,
                      backgroundColor: '#FFF',
                      '&:hover': {
                        borderColor: GREEN,
                        backgroundColor: '#F4F7F0',
                      },
                    }}
                  >
                    <Symbol size={20}>▧</Symbol>
                    <Box component="span" sx={{ mr: 1 }}>
                      {stageImageFile
                        ? 'اختيار صورة أخرى'
                        : 'اختاري صورة من جهازك'}
                    </Box>

                    <input
                      id="stage-image-upload"
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleStageImageChange}
                    />
                  </Button>

                  <Typography
                    sx={{
                      color: MUTED,
                      fontSize: 12,
                      mt: 1,
                      lineHeight: 1.8,
                    }}
                  >
                    الصيغ المدعومة: JPG وPNG وWEBP وGIF.
                    الحد الأقصى لحجم الصورة 5 ميغابايت.
                  </Typography>

                  {stageImagePreview && (
                    <Paper
                      elevation={0}
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: '14px',
                        border: `1px solid ${BORDER}`,
                        backgroundColor: '#FFF',
                      }}
                    >
                      <Box
                        component="img"
                        src={stageImagePreview}
                        alt="معاينة صورة المرحلة"
                        sx={{
                          display: 'block',
                          width: '100%',
                          maxHeight: 260,
                          objectFit: 'contain',
                          borderRadius: '10px',
                          backgroundColor: '#F8F7F2',
                        }}
                      />

                      <Typography
                        sx={{
                          mt: 1,
                          fontSize: 12,
                          color: TEXT,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {stageImageFile?.name}
                      </Typography>

                      <Typography
                        sx={{ fontSize: 11, color: MUTED, mt: 0.5 }}
                      >
                        {stageImageFile
                          ? `${(stageImageFile.size / (1024 * 1024)).toFixed(2)} ميغابايت`
                          : ''}
                      </Typography>

                      <Button
                        type="button"
                        size="small"
                        color="error"
                        onClick={removeStageImage}
                        sx={{
                          mt: 1,
                          fontFamily: 'Cairo, sans-serif',
                        }}
                      >
                        إزالة الصورة
                      </Button>
                    </Paper>
                  )}
                </Box>

                <TextField
                  label="معرّف قطعة المرحلة (اختياري)"
                  value={stageForm.pieceId}
                  onChange={(event) =>
                    updateStageField('pieceId', event.target.value)
                  }
                  {...htmlInputProps({ maxLength: 100 })}
                  fullWidth
                  sx={inputSx}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={savingStage}
                  startIcon={
                    savingStage ? (
                      <CircularProgress size={19} color="inherit" />
                    ) : (
                      <Symbol>↑</Symbol>
                    )
                  }
                  sx={{
                    ...buttonSx,
                    backgroundColor: GREEN,
                    '&:hover': { backgroundColor: '#21451D' },
                  }}
                >
                  {savingStage
                    ? 'جارٍ إرسال المرحلة...'
                    : 'إرسال المرحلة للمراجعة'}
                </Button>

                <Typography
                  sx={{
                    color: MUTED,
                    fontSize: 12,
                    lineHeight: 1.9,
                  }}
                >
                  ستبقى المرحلة غير منشورة حتى تتم مراجعتها
                  والموافقة عليها من المدير.
                </Typography>
              </Stack>
            </Box>
          </Paper>

          {/* إدارة الأسئلة */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '22px',
              border: `1px solid ${BORDER}`,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                backgroundColor: '#FBF6E9',
              }}
            >
              <Symbol color={GOLD} size={30}>؟</Symbol>

              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                  إدارة الأسئلة
                </Typography>
                <Typography sx={{ color: MUTED, fontSize: 12 }}>
                  اختاري مرحلة معتمدة لإضافة الأسئلة وتعديلها
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ p: 3 }}>
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    py: 5,
                  }}
                >
                  <CircularProgress sx={{ color: GREEN }} />
                </Box>
              ) : stages.length === 0 ? (
                <Alert severity="info">
                  لا توجد مراحل في لوحة الإدارة بعد. أنشئي مرحلة
                  أولًا وانتظري اعتمادها.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  <TextField
                    select
                    label="اختيار المرحلة"
                    value={selectedStageId}
                    onChange={(event) => {
                      setSelectedStageId(event.target.value);
                      setQuestionError('');
                      setEditQuestionError('');
                      handleCancelEditingQuestion();
                    }}
                    fullWidth
                    sx={inputSx}
                  >
                    {stages.map((stage) => (
                      <MenuItem
                        key={getId(stage)}
                        value={getId(stage)}
                      >
                        {stage.title}
                      </MenuItem>
                    ))}
                  </TextField>

                  {selectedStage && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        border: `1px solid ${BORDER}`,
                        backgroundColor: '#FFF',
                      }}
                    >
                      <Stack
                        direction="row"
                        gap={1}
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography sx={{ fontWeight: 800 }}>
                          {selectedStage.title}
                        </Typography>

                        <Chip
                          size="small"
                          color={getStatus(selectedStage).color}
                          label={getStatus(selectedStage).label}
                        />
                      </Stack>

                      {selectedStage.description && (
                        <Typography
                          sx={{
                            color: MUTED,
                            fontSize: 12,
                            mt: 1,
                            lineHeight: 1.8,
                          }}
                        >
                          {selectedStage.description}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {!canAddQuestions && selectedStage && (
                    <Alert severity="warning">
                      هذه المرحلة ليست معتمدة ونشطة بعد. ستتمكنين
                      من إدارة أسئلتها بعد اعتمادها.
                    </Alert>
                  )}

                  {canAddQuestions && (
                    <>
                      <Divider />

                      <Typography sx={{ fontWeight: 900 }}>
                        الأسئلة الحالية ({questions.length})
                      </Typography>

                      {loadingQuestions ? (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: 2,
                          }}
                        >
                          <CircularProgress
                            size={25}
                            sx={{ color: GREEN }}
                          />
                        </Box>
                      ) : questions.length === 0 ? (
                        <Typography
                          sx={{ color: MUTED, fontSize: 13 }}
                        >
                          لا توجد أسئلة مسجلة لهذه المرحلة بعد.
                        </Typography>
                      ) : (
                        <Stack spacing={1.2}>
                          {questions.map((question, index) => (
                            <Box
                              key={getId(question) || index}
                              sx={{
                                display: 'flex',
                                gap: 1.5,
                                alignItems: 'flex-start',
                                p: 1.7,
                                borderRadius: '13px',
                                backgroundColor: '#F8F7F2',
                              }}
                            >
                              <Box
                                sx={{
                                  width: 30,
                                  height: 30,
                                  flexShrink: 0,
                                  display: 'grid',
                                  placeItems: 'center',
                                  borderRadius: '9px',
                                  backgroundColor: '#E7EFE2',
                                  color: GREEN,
                                  fontWeight: 900,
                                }}
                              >
                                {index + 1}
                              </Box>

                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: 13,
                                    lineHeight: 1.8,
                                    overflowWrap: 'anywhere',
                                  }}
                                >
                                  {question.question}
                                </Typography>

                                <Typography
                                  sx={{
                                    color: MUTED,
                                    fontSize: 11,
                                    mt: 0.5,
                                    lineHeight: 1.8,
                                  }}
                                >
                                  {Array.isArray(question.options)
                                    ? `${question.options.length} خيارات`
                                    : 'سؤال'}{' '}
                                  • {question.points ?? 10} نقاط
                                  {' • '}
                                  الترتيب: {question.order ?? index + 1}
                                  {' • '}
                                  القطعة: {question.pieceId || 'غير محددة'}
                                </Typography>

                                <Button
                                  type="button"
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Symbol size={17}>✎</Symbol>}
                                  onClick={() =>
                                    handleStartEditingQuestion(question)
                                  }
                                  sx={{
                                    mt: 1,
                                    borderRadius: '9px',
                                    color: GREEN,
                                    borderColor: GREEN,
                                    fontWeight: 800,
                                    fontFamily: 'Cairo, sans-serif',
                                  }}
                                >
                                  تعديل السؤال
                                </Button>
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      )}

                      {/* نموذج تعديل السؤال */}
                      {editingQuestionId && (
                        <>
                          <Divider />

                          <Paper
                            id="edit-question-form"
                            elevation={0}
                            sx={{
                              p: { xs: 2, sm: 2.5 },
                              borderRadius: '16px',
                              border: `1px solid ${GOLD}`,
                              backgroundColor: '#FFFCF3',
                              scrollMarginTop: 24,
                            }}
                          >
                            <Stack spacing={1} sx={{ mb: 2 }}>
                              <Typography
                                sx={{
                                  color: GREEN,
                                  fontWeight: 900,
                                  fontSize: 18,
                                }}
                              >
                                تعديل السؤال
                              </Typography>

                              <Typography
                                sx={{
                                  color: MUTED,
                                  fontSize: 12,
                                  lineHeight: 1.8,
                                }}
                              >
                                عدّلي البيانات المطلوبة ثم أرسلي
                                التغييرات للمراجعة. لن تتغير النسخة
                                المنشورة حتى يوافق المدير.
                              </Typography>
                            </Stack>

                            {editQuestionError && (
                              <Alert severity="error" sx={{ mb: 2 }}>
                                {editQuestionError}
                              </Alert>
                            )}

                            <Box
                              component="form"
                              onSubmit={handleUpdateQuestion}
                            >
                              {renderQuestionFields(
                                editingQuestionForm,
                                updateEditingQuestionField,
                                updateEditingOption,
                                'edit',
                              )}

                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1.5}
                                sx={{ mt: 2.5 }}
                              >
                                <Button
                                  type="submit"
                                  variant="contained"
                                  disabled={savingQuestionEdit}
                                  startIcon={
                                    savingQuestionEdit ? (
                                      <CircularProgress
                                        size={18}
                                        color="inherit"
                                      />
                                    ) : (
                                      <Symbol size={18}>✓</Symbol>
                                    )
                                  }
                                  sx={{
                                    ...buttonSx,
                                    flex: 1,
                                    backgroundColor: GREEN,
                                    '&:hover': {
                                      backgroundColor: '#21451D',
                                    },
                                  }}
                                >
                                  {savingQuestionEdit
                                    ? 'جارٍ حفظ التعديلات...'
                                    : 'حفظ وإرسال للمراجعة'}
                                </Button>

                                <Button
                                  type="button"
                                  variant="outlined"
                                  disabled={savingQuestionEdit}
                                  onClick={handleCancelEditingQuestion}
                                  sx={{
                                    ...buttonSx,
                                    flex: 1,
                                    color: RED,
                                    borderColor: '#E8C5BA',
                                  }}
                                >
                                  إلغاء التعديل
                                </Button>
                              </Stack>
                            </Box>
                          </Paper>
                        </>
                      )}

                      <Divider />

                      <Typography sx={{ fontWeight: 900 }}>
                        إضافة سؤال جديد
                      </Typography>

                      {questionError && (
                        <Alert severity="error">
                          {questionError}
                        </Alert>
                      )}

                      <Box
                        component="form"
                        onSubmit={handleCreateQuestion}
                      >
                        {renderQuestionFields(
                          questionForm,
                          updateQuestionField,
                          updateOption,
                          'create',
                        )}

                        <Button
                          type="submit"
                          variant="contained"
                          disabled={savingQuestion}
                          startIcon={
                            savingQuestion ? (
                              <CircularProgress
                                size={19}
                                color="inherit"
                              />
                            ) : (
                              <Symbol>➤</Symbol>
                            )
                          }
                          sx={{
                            ...buttonSx,
                            mt: 2,
                            width: '100%',
                            backgroundColor: RED,
                            '&:hover': {
                              backgroundColor: '#A83B26',
                            },
                          }}
                        >
                          {savingQuestion
                            ? 'جارٍ إرسال السؤال...'
                            : 'إرسال السؤال للمراجعة'}
                        </Button>

                        <Typography
                          sx={{
                            color: MUTED,
                            fontSize: 12,
                            lineHeight: 1.9,
                            mt: 1.5,
                          }}
                        >
                          الإجابة الصحيحة محفوظة في الخادم، ويجب
                          ألا تظهر ضمن الأسئلة العامة للاعبين.
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              )}
            </Box>
          </Paper>
        </Box>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: '18px',
            border: `1px solid ${BORDER}`,
            backgroundColor: '#FFF',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'flex-start' }}
          >
            <Symbol color={GREEN} size={24}>✓</Symbol>

            <Box>
              <Typography sx={{ fontWeight: 900, mb: 0.5 }}>
                كيف يعمل النشر؟
              </Typography>

              <Typography
                sx={{
                  color: MUTED,
                  fontSize: 13,
                  lineHeight: 2,
                }}
              >
                تُرسل المراحل والأسئلة للمراجعة بحسب صلاحيات الحساب.
                لا تنشر لوحة مدير المحتوى التعديلات مباشرة، ولا تعرض
                الإجابة الصحيحة ضمن الأسئلة العامة للاعبين.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Box
          component="footer"
          sx={{
            py: 3,
            textAlign: 'center',
            color: MUTED,
            fontSize: 12,
          }}
        >
          قطعة من فلسطين • إدارة المحتوى
        </Box>
      </Box>

      <Box
        sx={{
          height: 12,
          background:
            'repeating-linear-gradient(45deg, #2D5A27, #2D5A27 15px, #C84B31 15px, #C84B31 30px, #D4AF37 30px, #D4AF37 45px)',
        }}
      />
    </Box>
  );
};

export default ContentManagerDashboard;
